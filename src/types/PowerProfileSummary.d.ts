import {PowerProfilePoint} from "./PowerProfilePoint";
import {PowerProfilePosture} from "../components/PowerProfilePanel";

export interface PowerProfileSummary {
    sourceLabel: string;
    axialProfile: PowerProfilePoint[];
    radialProfile: PowerProfilePoint[];
    powerPeakingFactor: number;
    axialPeakLocation: string;
    radialPeakLocation: string;
    posture: PowerProfilePosture;
    interpretation: string[];
}