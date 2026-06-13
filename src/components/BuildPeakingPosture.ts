import {PowerProfilePosture} from "./PowerProfilePanel";

export function buildPeakingPosture(powerPeakingFactor: number): PowerProfilePosture {
    if (powerPeakingFactor >= 1.35) {
        return 'limit';
    }

    if (powerPeakingFactor >= 1.2) {
        return 'watch';
    }

    return 'nominal';
}