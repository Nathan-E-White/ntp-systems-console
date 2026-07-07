import {
    EXPANSION_GAIN_BASE,
    EXPANSION_GAIN_LOG_COEFFICIENT,
    EXPANSION_GAIN_MAXIMUM,
    EXPANSION_GAIN_MINIMUM,
    GAMMA_H2,
    GAS_CONSTANT_H2_J_PER_KG_K,
} from './reducedOrderModelConstants';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);


export function estimateExhaustVelocity(outletTemperatureK: number, expansionRatio: number): number {
    const expansionGain = EXPANSION_GAIN_BASE
        + EXPANSION_GAIN_LOG_COEFFICIENT * Math.log(Math.max(expansionRatio, 1));
    const idealVelocity = Math.sqrt(
        (2 * GAMMA_H2 * GAS_CONSTANT_H2_J_PER_KG_K * outletTemperatureK) / (GAMMA_H2 - 1),
    );
    return idealVelocity * clamp(expansionGain, EXPANSION_GAIN_MINIMUM, EXPANSION_GAIN_MAXIMUM);
}
