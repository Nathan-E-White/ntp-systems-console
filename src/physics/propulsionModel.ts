import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {evaluateEngineCase} from './evaluateEngineCase';
export {
    GAMMA_H2,
    HYDROGEN_CP_J_PER_KG_K,
    MODEL_EFFICIENCY,
} from './reducedOrderModelConstants';
export {
    G0_M_PER_S2 as G0,
    GAS_CONSTANT_H2_J_PER_KG_K as GAS_CONSTANT_H2,
} from './reducedOrderModelConstants';

export function computeEngineOutputs(inputs: EngineInputs): EngineOutputs {
    return evaluateEngineCase(inputs).outputs;
}
