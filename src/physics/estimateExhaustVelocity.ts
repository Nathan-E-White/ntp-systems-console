export function estimateExhaustVelocity(outletTemperatureK: number, expansionRatio: number): number {
    const expansionGain = 0.86 + 0.035 * Math.log(Math.max(expansionRatio, 1));
    const idealVelocity = Math.sqrt((2 * GAMMA_H2 * GAS_CONSTANT_H2 * outletTemperatureK) / (GAMMA_H2 - 1));
    return idealVelocity * clamp(expansionGain, 0.82, 1.08);
}