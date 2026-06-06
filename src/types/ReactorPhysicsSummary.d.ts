import {PowerProfilePoint} from "./PowerProfilePoint";
import {ReactorPhysicsPosture} from "./ReactorPhysicsPosture";

export interface ReactorPhysicsSummary {
    sourceLabel: string;
    keff: number;
    keffStdDev: number;
    reactivityPcm: number;
    shutdownMarginPcm: number;
    controlDrumAngleDeg: number;
    drumWorthPcm: number;
    temperatureFeedbackPcm: number;
    leakageFraction: number;
    fuelAbsorptionFraction: number;
    nonFissionCaptureFraction: number;
    powerPeakingFactor: number;
    axialPowerProfile: PowerProfilePoint[];
    radialPowerProfile: PowerProfilePoint[];
    posture: ReactorPhysicsPosture;
    recommendedFollowup: string[];
}