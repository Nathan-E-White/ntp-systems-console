import {PowerProfilePoint} from "./PowerProfilePanel";

export function findPeakPoint(points: PowerProfilePoint[]): PowerProfilePoint {
    return points.reduce((currentPeak, point) => {
        if (point.relativePower > currentPeak.relativePower) {
            return point;
        }

        return currentPeak;
    }, points[0]);
}