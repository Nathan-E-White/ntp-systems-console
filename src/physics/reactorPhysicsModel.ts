import {ReactorPhysicsPosture} from "../types/ReactorPhysicsPosture";


export interface ReactorPhysicsResult {
    reactivityPcm: number;
    twoSigmaLowerKeff: number;
    twoSigmaUpperKeff: number;
    insertedDrumWorthPcm: number;
    remainingShutdownWorthPcm: number;
    temperatureFeedbackPcm: number;
    axialPeakFactor: number;
    radialPeakFactor: number;
    axialPeakLabel: string;
    radialPeakLabel: string;
    neutronAccountingSubtotal: number;
    untrackedBalanceFraction: number;
    posture: ReactorPhysicsPosture;
}
