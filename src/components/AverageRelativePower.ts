import {PowerProfilePoint} from "./PowerProfilePanel";

export function averageRelativePower(points: PowerProfilePoint[]): number {
    const total = points.reduce((sum, point) => sum + point.relativePower, 0);
    return total / points.length;
}