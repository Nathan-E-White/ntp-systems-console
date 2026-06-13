import type {BasisDiagnostic} from './referenceBasis';
import {
    evaluateHydrogenGasProperties,
    HYDROGEN_SPECIFIC_GAS_CONSTANT_J_PER_KG_K,
} from './hydrogenProperties';

export interface NozzlePerformanceInput {
    readonly chamberTemperatureK: number;
    readonly chamberPressureMpa: number;
    readonly expansionRatio: number;
    readonly massFlowKgPerSec: number;
    readonly nozzleEfficiency: number;
    readonly ambientPressureKpa: number;
}

export interface NozzlePerformanceResult {
    readonly exitMach: number;
    readonly exitPressureKpa: number;
    readonly exitTemperatureK: number;
    readonly idealExitVelocityMPerSec: number;
    readonly deliveredExitVelocityMPerSec: number;
    readonly exitAreaM2: number;
    readonly pressureThrustKn: number;
    readonly thrustKn: number;
    readonly specificImpulseSec: number;
    readonly diagnostics: readonly BasisDiagnostic[];
}

const G0_M_PER_S2 = 9.80665;

export function evaluateNozzlePerformance(input: NozzlePerformanceInput): NozzlePerformanceResult {
    const diagnostics: BasisDiagnostic[] = [];
    const chamberPressurePa = input.chamberPressureMpa * 1_000_000;
    const ambientPressurePa = input.ambientPressureKpa * 1_000;
    const properties = evaluateHydrogenGasProperties(input.chamberTemperatureK, chamberPressurePa);
    const gamma = properties.gamma;
    const exitMach = solveExitMach(input.expansionRatio, gamma);
    const temperatureRatio = 1 / (1 + (gamma - 1) * exitMach ** 2 / 2);
    const exitTemperatureK = input.chamberTemperatureK * temperatureRatio;
    const exitPressurePa = chamberPressurePa
        * temperatureRatio ** (gamma / (gamma - 1));
    const idealExitVelocityMPerSec = exitMach
        * Math.sqrt(gamma * HYDROGEN_SPECIFIC_GAS_CONSTANT_J_PER_KG_K * exitTemperatureK);
    const deliveredExitVelocityMPerSec = idealExitVelocityMPerSec
        * Math.sqrt(Math.min(Math.max(input.nozzleEfficiency, 0), 1));
    const throatMassFlux = chamberPressurePa
        / Math.sqrt(input.chamberTemperatureK)
        * Math.sqrt(gamma / HYDROGEN_SPECIFIC_GAS_CONSTANT_J_PER_KG_K)
        * (2 / (gamma + 1)) ** ((gamma + 1) / (2 * (gamma - 1)));
    const throatAreaM2 = input.massFlowKgPerSec / throatMassFlux;
    const exitAreaM2 = throatAreaM2 * input.expansionRatio;
    const pressureThrustN = (exitPressurePa - ambientPressurePa) * exitAreaM2;
    const thrustN = input.massFlowKgPerSec * deliveredExitVelocityMPerSec + pressureThrustN;
    if (input.nozzleEfficiency <= 0 || input.nozzleEfficiency > 1) {
        diagnostics.push({
            id: 'nozzle-efficiency-range',
            severity: 'incomplete',
            message: 'Nozzle efficiency must be greater than zero and no greater than one.',
        });
    } else {
        diagnostics.push({
            id: 'nozzle-efficiency-user',
            severity: 'warning',
            basisId: 'nozzle-efficiency',
            message: 'Delivered performance uses a user-visible lumped nozzle efficiency; cooling, divergence, and boundary-layer losses are not independently solved.',
        });
    }
    if (input.chamberTemperatureK > 2_500) {
        diagnostics.push({
            id: 'nozzle-chemistry',
            severity: 'warning',
            basisId: 'nasa-rp-1311',
            message: 'Ideal frozen molecular-hydrogen performance omits dissociation and equilibrium chemistry; NASA CEA is the higher-fidelity replacement.',
        });
    }

    return {
        exitMach,
        exitPressureKpa: exitPressurePa / 1_000,
        exitTemperatureK,
        idealExitVelocityMPerSec,
        deliveredExitVelocityMPerSec,
        exitAreaM2,
        pressureThrustKn: pressureThrustN / 1_000,
        thrustKn: thrustN / 1_000,
        specificImpulseSec: thrustN / (input.massFlowKgPerSec * G0_M_PER_S2),
        diagnostics,
    };
}

function solveExitMach(expansionRatio: number, gamma: number): number {
    const target = Math.max(expansionRatio, 1.0001);
    let low = 1.000001;
    let high = 20;
    for (let iteration = 0; iteration < 100; iteration += 1) {
        const midpoint = (low + high) / 2;
        if (areaRatio(midpoint, gamma) < target) low = midpoint;
        else high = midpoint;
    }
    return (low + high) / 2;
}

function areaRatio(mach: number, gamma: number): number {
    const exponent = (gamma + 1) / (2 * (gamma - 1));
    return (1 / mach)
        * (2 / (gamma + 1) * (1 + (gamma - 1) * mach ** 2 / 2)) ** exponent;
}
