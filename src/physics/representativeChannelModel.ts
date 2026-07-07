import type {EngineInputs} from '../types/EngineState';
import {
    evaluateHydrogenGasProperties,
    hydrogenEnthalpyJPerKg,
    temperatureFromHydrogenEnthalpy,
} from './hydrogenProperties';
import type {BasisDiagnostic} from './referenceBasis';

export interface ChannelStation {
    readonly index: number;
    readonly axialPositionM: number;
    readonly normalizedPosition: number;
    readonly powerShapeFactor: number;
    readonly bulkTemperatureK: number;
    readonly wallTemperatureK: number;
    readonly pressureMpa: number;
    readonly reynoldsNumber: number;
    readonly nusseltNumber: number;
    readonly machNumber: number;
    readonly frictionFactor: number;
}

export interface RepresentativeChannelResult {
    readonly stations: readonly ChannelStation[];
    readonly outletTemperatureK: number;
    readonly peakWallTemperatureK: number;
    readonly pressureDropMpa: number;
    readonly depositedPowerMw: number;
    readonly thermalCouplingEfficiency: number;
    readonly diagnostics: readonly BasisDiagnostic[];
    readonly converged: boolean;
}

const PEWEE_POWER_SHAPE = [0.315263743551, 4.01075764283, -2.81198488737, -2.13642616902, 0.653731955838] as const;
const DEFAULT_STATION_COUNT = 36;
const TARGET_PEWEE_EXIT_TEMPERATURE_K = 2_550;

export function peweePowerShape(normalizedPosition: number): number {
    const x = Math.min(Math.max(normalizedPosition, 0), 1);
    const [a, b, c, d, e] = PEWEE_POWER_SHAPE;
    return a + b * x + c * x ** 2 + d * x ** 3 + e * x ** 4;
}

export function derivePeweeClosureEfficiency(inputs: EngineInputs): number | undefined {
    if (inputs.inletTemperatureK < 298 || inputs.massFlowKgPerSec <= 0 || inputs.thermalPowerMw <= 0) return undefined;
    const enthalpyRise = hydrogenEnthalpyJPerKg(TARGET_PEWEE_EXIT_TEMPERATURE_K)
        - hydrogenEnthalpyJPerKg(inputs.inletTemperatureK);
    return inputs.massFlowKgPerSec * enthalpyRise / (inputs.thermalPowerMw * 1_000_000);
}

export function solveRepresentativeChannel(
    inputs: EngineInputs,
    stationCount = DEFAULT_STATION_COUNT,
): RepresentativeChannelResult {
    const diagnostics: BasisDiagnostic[] = [];
    validateInputs(inputs, stationCount, diagnostics);
    const closureEfficiency = inputs.thermalCouplingMode === 'benchmarkClosure'
        ? derivePeweeClosureEfficiency(inputs)
        : inputs.thermalCouplingEfficiency;
    if (closureEfficiency === undefined || closureEfficiency <= 0 || closureEfficiency > 1) {
        diagnostics.push({
            id: 'thermal-coupling-efficiency',
            severity: 'incomplete',
            message: 'Thermal coupling efficiency must resolve within 0-1.',
        });
    }
    const efficiency = Math.min(Math.max(closureEfficiency ?? inputs.thermalCouplingEfficiency, 0), 1);
    const depositedPowerW = inputs.thermalPowerMw * 1_000_000 * efficiency;
    if (diagnostics.some((item) => item.severity === 'incomplete')) {
        return incompleteResult(inputs, efficiency, depositedPowerW, diagnostics);
    }

    const channelAreaM2 = Math.PI * inputs.channelHydraulicDiameterM ** 2 / 4;
    const channelMassFlowKgPerSec = inputs.massFlowKgPerSec / inputs.channelCount;
    const lengthStepM = inputs.channelLengthM / stationCount;
    const shapeValues = Array.from({length: stationCount}, (_, index) =>
        peweePowerShape((index + 0.5) / stationCount),
    );
    const shapeSum = shapeValues.reduce((sum, value) => sum + value, 0);
    let bulkTemperatureK = inputs.inletTemperatureK;
    let pressurePa = inputs.chamberPressureMpa * 1_000_000;
    let peakWallTemperatureK = bulkTemperatureK;
    const stations: ChannelStation[] = [];
    const inletProperties = evaluateHydrogenGasProperties(bulkTemperatureK, pressurePa);
    const inletVelocity = channelMassFlowKgPerSec / (inletProperties.densityKgPerM3 * channelAreaM2);
    pressurePa -= inputs.channelInletLossCoefficient
        * inletProperties.densityKgPerM3 * inletVelocity ** 2 / 2;

    for (let index = 0; index < stationCount; index += 1) {
        const normalizedPosition = (index + 0.5) / stationCount;
        const stationPowerW = depositedPowerW * shapeValues[index] / shapeSum;
        const inletEnthalpy = hydrogenEnthalpyJPerKg(bulkTemperatureK);
        const outletEnthalpy = inletEnthalpy + stationPowerW / inputs.massFlowKgPerSec;
        const outletTemperatureK = temperatureFromHydrogenEnthalpy(outletEnthalpy);
        if (outletTemperatureK === undefined) {
            diagnostics.push({
                id: `enthalpy-range-${index}`,
                severity: 'incomplete',
                message: `Station ${index + 1} leaves the implemented NIST enthalpy range.`,
            });
            break;
        }
        const meanTemperatureK = (bulkTemperatureK + outletTemperatureK) / 2;
        const properties = evaluateHydrogenGasProperties(meanTemperatureK, pressurePa);
        const velocityMPerSec = channelMassFlowKgPerSec / (properties.densityKgPerM3 * channelAreaM2);
        const reynoldsNumber = properties.densityKgPerM3 * velocityMPerSec
            * inputs.channelHydraulicDiameterM / properties.viscosityPaSec;
        let wallTemperatureK = Math.max(outletTemperatureK + 1, peakWallTemperatureK);
        let nusseltNumber = 0;
        let converged = false;
        for (let iteration = 0; iteration < 40; iteration += 1) {
            const wallRatio = wallTemperatureK / meanTemperatureK;
            nusseltNumber = modifiedWolfMcCarthyNusselt(
                reynoldsNumber,
                properties.prandtl,
                wallRatio,
                Math.max((index + 0.5) * lengthStepM, inputs.channelHydraulicDiameterM),
                inputs.channelHydraulicDiameterM,
            );
            const heatTransferCoefficient = nusseltNumber
                * properties.thermalConductivityWPerMK / inputs.channelHydraulicDiameterM;
            const heatTransferArea = Math.PI * inputs.channelHydraulicDiameterM
                * lengthStepM * inputs.channelCount;
            const nextWallTemperatureK = meanTemperatureK + stationPowerW
                / Math.max(heatTransferCoefficient * heatTransferArea, 1);
            if (Math.abs(nextWallTemperatureK - wallTemperatureK) < 0.02) {
                wallTemperatureK = nextWallTemperatureK;
                converged = true;
                break;
            }
            wallTemperatureK = 0.55 * wallTemperatureK + 0.45 * nextWallTemperatureK;
        }
        if (!converged) {
            diagnostics.push({
                id: `wall-convergence-${index}`,
                severity: 'incomplete',
                message: `Wall-temperature iteration did not converge at station ${index + 1}.`,
            });
        }
        const wallProperties = evaluateHydrogenGasProperties(wallTemperatureK, pressurePa);
        const wallReynolds = 4 * channelMassFlowKgPerSec
            / (Math.PI * inputs.channelHydraulicDiameterM * wallProperties.viscosityPaSec)
            * meanTemperatureK / wallTemperatureK;
        const frictionFactor = taylorFanningFrictionFactor(wallReynolds, meanTemperatureK, wallTemperatureK);
        if (wallReynolds < 3_000 || wallReynolds > 187_000) {
            diagnostics.push({
                id: `taylor-range-${index}`,
                severity: 'warning',
                basisId: 'elm-taylor-friction',
                message: `Taylor correlation range exceeded at station ${index + 1}: Re_w=${wallReynolds.toFixed(0)}.`,
            });
        }
        if (wallTemperatureK / meanTemperatureK > 3.5) {
            diagnostics.push({
                id: `wolf-range-${index}`,
                severity: 'warning',
                basisId: 'elm-modified-wolf-mccarthy',
                message: `Modified Wolf-McCarthy wall/bulk temperature ratio exceeds 3.5 at station ${index + 1}.`,
            });
        }
        const outletProperties = evaluateHydrogenGasProperties(outletTemperatureK, pressurePa);
        const massFluxSquared = (channelMassFlowKgPerSec / channelAreaM2) ** 2;
        const frictionPressureDropPa = massFluxSquared * lengthStepM * frictionFactor
            / inputs.channelHydraulicDiameterM
            * (1 / properties.densityKgPerM3 + 1 / outletProperties.densityKgPerM3);
        const accelerationPressureDropPa = massFluxSquared
            * (1 / outletProperties.densityKgPerM3 - 1 / properties.densityKgPerM3);
        pressurePa -= Math.max(frictionPressureDropPa + accelerationPressureDropPa, 0);
        peakWallTemperatureK = Math.max(peakWallTemperatureK, wallTemperatureK);
        bulkTemperatureK = outletTemperatureK;
        stations.push({
            index,
            axialPositionM: normalizedPosition * inputs.channelLengthM,
            normalizedPosition,
            powerShapeFactor: shapeValues[index],
            bulkTemperatureK,
            wallTemperatureK,
            pressureMpa: pressurePa / 1_000_000,
            reynoldsNumber,
            nusseltNumber,
            machNumber: velocityMPerSec / properties.speedOfSoundMPerSec,
            frictionFactor,
        });
        if (pressurePa <= 0) {
            diagnostics.push({
                id: 'nonpositive-channel-pressure',
                severity: 'incomplete',
                message: `Channel pressure became nonpositive at station ${index + 1}.`,
            });
            break;
        }
    }

    const finalProperties = evaluateHydrogenGasProperties(
        bulkTemperatureK,
        Math.max(pressurePa, 1),
    );
    const finalVelocity = channelMassFlowKgPerSec / (finalProperties.densityKgPerM3 * channelAreaM2);
    pressurePa -= inputs.channelExitLossCoefficient
        * finalProperties.densityKgPerM3 * finalVelocity ** 2 / 2;
    const inletPressurePa = inputs.chamberPressureMpa * 1_000_000;
    const pressureDropMpa = Math.max((inletPressurePa - pressurePa) / 1_000_000, 0);
    const uniqueTransportWarning = diagnostics.find((item) => item.id === 'transport-property-closure');
    if (!uniqueTransportWarning) {
        diagnostics.push(...finalProperties.diagnostics.filter((item) => item.id === 'transport-property-closure'));
    }

    return {
        stations,
        outletTemperatureK: bulkTemperatureK,
        peakWallTemperatureK,
        pressureDropMpa,
        depositedPowerMw: depositedPowerW / 1_000_000,
        thermalCouplingEfficiency: efficiency,
        diagnostics: deduplicateDiagnostics(diagnostics),
        converged: !diagnostics.some((item) => item.severity === 'incomplete'),
    };
}

export function modifiedWolfMcCarthyNusselt(
    reynoldsNumber: number,
    prandtl: number,
    wallToBulkTemperatureRatio: number,
    axialPositionM: number,
    hydraulicDiameterM: number,
): number {
    if (reynoldsNumber < 1_200) {
        const entry = reynoldsNumber * prandtl * hydraulicDiameterM / axialPositionM;
        return (4.36 + 0.036 * entry / (1 + 0.001 * entry))
            * wallToBulkTemperatureRatio ** 0.25;
    }
    return 0.025 * reynoldsNumber ** 0.8 * prandtl ** 0.4
        * wallToBulkTemperatureRatio ** -0.55
        * (1 + 0.3 * (axialPositionM / hydraulicDiameterM) ** -0.7);
}

export function taylorFanningFrictionFactor(
    wallReynoldsNumber: number,
    bulkTemperatureK: number,
    wallTemperatureK: number,
): number {
    if (wallReynoldsNumber < 1_070) return 16 / Math.max(wallReynoldsNumber, 1);
    return (0.0014 + 0.125 / wallReynoldsNumber ** 0.32)
        * Math.sqrt(bulkTemperatureK / wallTemperatureK);
}

function validateInputs(inputs: EngineInputs, stationCount: number, diagnostics: BasisDiagnostic[]) {
    const positiveInputs: Array<[string, number]> = [
        ['Thermal power', inputs.thermalPowerMw],
        ['Mass flow', inputs.massFlowKgPerSec],
        ['Channel length', inputs.channelLengthM],
        ['Hydraulic diameter', inputs.channelHydraulicDiameterM],
        ['Channel count', inputs.channelCount],
        ['Chamber pressure', inputs.chamberPressureMpa],
        ['Station count', stationCount],
    ];
    positiveInputs.forEach(([label, value]) => {
        if (!Number.isFinite(value) || value <= 0) {
            diagnostics.push({id: `invalid-${label}`, severity: 'incomplete', message: `${label} must be positive and finite.`});
        }
    });
    if (inputs.inletTemperatureK < 298) {
        diagnostics.push({
            id: 'inlet-real-fluid-required',
            severity: 'incomplete',
            message: 'The implemented NIST gas-property model begins at 298 K; a cryogenic real-fluid provider is required below that temperature.',
        });
    }
}

function incompleteResult(
    inputs: EngineInputs,
    efficiency: number,
    depositedPowerW: number,
    diagnostics: readonly BasisDiagnostic[],
): RepresentativeChannelResult {
    return {
        stations: [],
        outletTemperatureK: inputs.inletTemperatureK,
        peakWallTemperatureK: inputs.inletTemperatureK,
        pressureDropMpa: 0,
        depositedPowerMw: depositedPowerW / 1_000_000,
        thermalCouplingEfficiency: efficiency,
        diagnostics,
        converged: false,
    };
}

function deduplicateDiagnostics(diagnostics: readonly BasisDiagnostic[]): BasisDiagnostic[] {
    return [...new Map(diagnostics.map((item) => [item.id, item])).values()];
}
