const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export function estimatePressureDrop(massFlowKgPerSec: number, chamberPressureMpa: number): number {
    return clamp(0.018 * massFlowKgPerSec ** 1.35 + 0.015 * chamberPressureMpa, 0.05, 3.5);
}