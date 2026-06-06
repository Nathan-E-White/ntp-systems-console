export class DrumWorthInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DrumWorthInputError';
    }
}

/**
 * Estimates inserted control-drum worth using a smooth reduced-order worth curve.
 *
 * The model assumes the inserted worth varies as sin²(theta), where theta is the
 * normalized drum angle from 0 to 90 degrees:
 *   insertedWorth = totalWorth * sin²(theta)
 *
 * This gives zero inserted worth at 0 degrees and total inserted worth at 90 degrees.
 * Angles outside [0, 90] are clamped so UI perturbations do not produce unphysical
 * worth fractions. This is a dashboard interpretation helper, not a neutronics model.
 */
export function estimateInsertedDrumWorthPcm(angleDeg: number, totalWorthPcm: number): number {
    if (!Number.isFinite(angleDeg)) {
        throw new DrumWorthInputError('control drum angle must be a finite number.');
    }

    if (!Number.isFinite(totalWorthPcm)) {
        throw new DrumWorthInputError('total drum worth must be a finite number.');
    }

    if (totalWorthPcm < 0) {
        throw new DrumWorthInputError('total drum worth must be greater than or equal to zero.');
    }

    const clampedAngleDeg = clamp(angleDeg, 0, 90);
    const normalizedAngleRadians = degreesToRadians(clampedAngleDeg);
    const insertedFraction = Math.sin(normalizedAngleRadians) ** 2;

    return totalWorthPcm * insertedFraction;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
}

function degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}