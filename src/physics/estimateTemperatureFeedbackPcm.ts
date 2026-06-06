export class TemperatureFeedbackInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TemperatureFeedbackInputError';
    }
}

export interface TemperatureFeedbackInput {
    fuelTemperatureK: number;
    referenceFuelTemperatureK: number;
    coefficientPcmPerK: number;
}

/**
 * Estimates temperature-feedback reactivity in pcm using a linear coefficient model.
 *
 * The reduced-order model is:
 *   feedback_pcm = alpha_pcm_per_K * (T_fuel - T_reference)
 *
 * For a stabilizing fuel-temperature feedback model, alpha is usually negative:
 * increasing fuel temperature inserts negative reactivity. This helper is intended
 * for dashboard interpretation and sensitivity studies, not validated reactor analysis.
 */
export function estimateTemperatureFeedbackPcm(input: TemperatureFeedbackInput): number {
    const {fuelTemperatureK, referenceFuelTemperatureK, coefficientPcmPerK} = input;

    assertFiniteTemperature(fuelTemperatureK, 'fuel temperature');
    assertFiniteTemperature(referenceFuelTemperatureK, 'reference fuel temperature');

    if (!Number.isFinite(coefficientPcmPerK)) {
        throw new TemperatureFeedbackInputError('temperature feedback coefficient must be a finite number.');
    }

    const deltaTemperatureK = fuelTemperatureK - referenceFuelTemperatureK;
    return coefficientPcmPerK * deltaTemperatureK;
}

function assertFiniteTemperature(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new TemperatureFeedbackInputError(`${label} must be a finite number.`);
    }

    if (value < 0) {
        throw new TemperatureFeedbackInputError(`${label} must be greater than or equal to zero kelvin.`);
    }
}