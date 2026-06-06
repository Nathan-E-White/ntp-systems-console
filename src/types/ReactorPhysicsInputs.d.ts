import {PowerProfilePoint} from "../components/PowerProfilePanel";

export interface ReactorPhysicsInputs {
    keff: number;
    keffStdDev: number;
    shutdownMarginPcm: number;
    controlDrumAngleDeg: number;
    totalDrumWorthPcm: number;
    fuelTemperatureK: number;
    referenceFuelTemperatureK: number;
    fuelTemperatureCoefficientPcmPerK: number;
    leakageFraction: number;
    fuelAbsorptionFraction: number;
    nonFissionCaptureFraction: number;
    axialPowerProfile: PowerProfilePoint[];
    radialPowerProfile: PowerProfilePoint[];
}