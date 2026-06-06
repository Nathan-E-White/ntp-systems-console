import {ReactorPhysicsInputs} from "../types/ReactorPhysicsInputs";

export function computeNeutronAccountingSubtotal(inputs: ReactorPhysicsInputs): number {
    return inputs.leakageFraction + inputs.fuelAbsorptionFraction + inputs.nonFissionCaptureFraction;
}