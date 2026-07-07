import {
    PRESSURE_DROP_CHAMBER_COEFFICIENT,
    PRESSURE_DROP_FLOW_COEFFICIENT,
    PRESSURE_DROP_FLOW_EXPONENT,
    PRESSURE_DROP_MAXIMUM_MPA,
    PRESSURE_DROP_MINIMUM_MPA,
} from './reducedOrderModelConstants';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export function estimatePressureDrop(massFlowKgPerSec: number, chamberPressureMpa: number): number {
    return clamp(
        PRESSURE_DROP_FLOW_COEFFICIENT * massFlowKgPerSec ** PRESSURE_DROP_FLOW_EXPONENT
        + PRESSURE_DROP_CHAMBER_COEFFICIENT * chamberPressureMpa,
        PRESSURE_DROP_MINIMUM_MPA,
        PRESSURE_DROP_MAXIMUM_MPA,
    );
}
