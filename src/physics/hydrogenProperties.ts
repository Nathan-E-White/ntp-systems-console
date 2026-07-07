import type {BasisDiagnostic} from './referenceBasis';

const MOLAR_MASS_KG_PER_MOL = 0.00201588;
const SPECIFIC_GAS_CONSTANT_J_PER_KG_K = 8.31446261815324 / MOLAR_MASS_KG_PER_MOL;

interface ShomateBand {
    readonly minimumK: number;
    readonly maximumK: number;
    readonly coefficients: readonly [number, number, number, number, number, number, number, number];
}

const SHOMATE_BANDS: readonly ShomateBand[] = [
    {minimumK: 298, maximumK: 1_000, coefficients: [33.066178, -11.363417, 11.432816, -2.772874, -0.158558, -9.980797, 172.707974, 0]},
    {minimumK: 1_000, maximumK: 2_500, coefficients: [18.563083, 12.257357, -2.859786, 0.268238, 1.977990, -1.147438, 156.288133, 0]},
    {minimumK: 2_500, maximumK: 6_000, coefficients: [43.413560, -4.293079, 1.272428, -0.096876, -20.533862, -38.515158, 162.081354, 0]},
];

export interface HydrogenGasProperties {
    readonly temperatureK: number;
    readonly pressurePa: number;
    readonly cpJPerKgK: number;
    readonly enthalpyJPerKg: number;
    readonly densityKgPerM3: number;
    readonly gamma: number;
    readonly speedOfSoundMPerSec: number;
    readonly viscosityPaSec: number;
    readonly prandtl: number;
    readonly thermalConductivityWPerMK: number;
    readonly diagnostics: readonly BasisDiagnostic[];
}

export function evaluateHydrogenGasProperties(temperatureK: number, pressurePa: number): HydrogenGasProperties {
    const diagnostics: BasisDiagnostic[] = [];
    const band = SHOMATE_BANDS.find((candidate, index) =>
        temperatureK >= candidate.minimumK
        && (temperatureK < candidate.maximumK || index === SHOMATE_BANDS.length - 1 && temperatureK <= candidate.maximumK),
    );
    if (!band) {
        diagnostics.push({
            id: 'nist-temperature-range',
            severity: 'incomplete',
            basisId: 'nist-shomate-hydrogen',
            message: `NIST ideal-gas Shomate data is implemented only from 298 to 6000 K; received ${temperatureK.toFixed(1)} K.`,
        });
    }
    if (!Number.isFinite(pressurePa) || pressurePa <= 0) {
        diagnostics.push({
            id: 'hydrogen-pressure',
            severity: 'incomplete',
            message: 'Hydrogen pressure must be positive and finite.',
        });
    }

    const selected = band ?? SHOMATE_BANDS[temperatureK < 298 ? 0 : SHOMATE_BANDS.length - 1];
    const boundedTemperatureK = Math.min(Math.max(temperatureK, selected.minimumK), selected.maximumK);
    const [a, b, c, d, e, f, , h] = selected.coefficients;
    const t = boundedTemperatureK / 1_000;
    const cpJPerMolK = a + b * t + c * t ** 2 + d * t ** 3 + e / t ** 2;
    const enthalpyKJPerMol = a * t + b * t ** 2 / 2 + c * t ** 3 / 3 + d * t ** 4 / 4 - e / t + f - h;
    const cpJPerKgK = cpJPerMolK / MOLAR_MASS_KG_PER_MOL;
    const enthalpyJPerKg = enthalpyKJPerMol * 1_000 / MOLAR_MASS_KG_PER_MOL;
    const cvJPerKgK = cpJPerKgK - SPECIFIC_GAS_CONSTANT_J_PER_KG_K;
    const gamma = cpJPerKgK / cvJPerKgK;
    const densityKgPerM3 = Math.max(pressurePa, 1) / (SPECIFIC_GAS_CONSTANT_J_PER_KG_K * boundedTemperatureK);

    // Calibrated screening transport closure. ELM used a dedicated parahydrogen
    // property routine; the public NIST WebBook source used here supplies Cp/H,
    // but not the matching high-pressure transport table.
    const viscosityPaSec = 8.76e-6 * (boundedTemperatureK / 300) ** 0.68;
    const prandtl = 0.69;
    const thermalConductivityWPerMK = cpJPerKgK * viscosityPaSec / prandtl;
    diagnostics.push({
        id: 'transport-property-closure',
        severity: 'warning',
        basisId: 'hydrogen-transport-closure',
        message: 'Viscosity, Prandtl number, and conductivity use a documented screening closure; replace with controlled parahydrogen transport data for design work.',
    });

    return {
        temperatureK,
        pressurePa,
        cpJPerKgK,
        enthalpyJPerKg,
        densityKgPerM3,
        gamma,
        speedOfSoundMPerSec: Math.sqrt(gamma * SPECIFIC_GAS_CONSTANT_J_PER_KG_K * boundedTemperatureK),
        viscosityPaSec,
        prandtl,
        thermalConductivityWPerMK,
        diagnostics,
    };
}

export function hydrogenEnthalpyJPerKg(temperatureK: number): number {
    return evaluateHydrogenGasProperties(temperatureK, 101_325).enthalpyJPerKg;
}

export function temperatureFromHydrogenEnthalpy(enthalpyJPerKg: number): number | undefined {
    const lowEnthalpy = hydrogenEnthalpyJPerKg(298);
    const highEnthalpy = hydrogenEnthalpyJPerKg(6_000);
    if (!Number.isFinite(enthalpyJPerKg) || enthalpyJPerKg < lowEnthalpy || enthalpyJPerKg > highEnthalpy) {
        return undefined;
    }
    let low = 298;
    let high = 6_000;
    for (let iteration = 0; iteration < 80; iteration += 1) {
        const midpoint = (low + high) / 2;
        if (hydrogenEnthalpyJPerKg(midpoint) < enthalpyJPerKg) low = midpoint;
        else high = midpoint;
    }
    return (low + high) / 2;
}

export const HYDROGEN_SPECIFIC_GAS_CONSTANT_J_PER_KG_K = SPECIFIC_GAS_CONSTANT_J_PER_KG_K;
