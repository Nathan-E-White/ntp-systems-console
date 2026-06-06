export class PowerProfileInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PowerProfileInputError';
    }
}

export interface PowerProfileSample {
    id?: string;
    label: string;
    relativePower: number;
}

export interface PowerProfilePeak<TSample extends PowerProfileSample = PowerProfileSample> {
    peak: TSample;
    peakIndex: number;
    peakRelativePower: number;
    averageRelativePower: number;
    peakingFactor: number;
}

/**
 * Finds the peak value in a normalized power profile and reports a simple peaking factor.
 *
 * The expected input is a reduced-order relative power profile, such as an axial-zone
 * or radial-ring profile parsed from a synthetic MCNP-like fixture. The returned
 * peaking factor is:
 *   peakingFactor = max(relativePower) / average(relativePower)
 *
 * For already normalized profiles with average near one, this is close to the maximum
 * relative power. This helper is for dashboard interpretation and consistency checks,
 * not design-quality reactor analysis.
 */
export function computePowerProfilePeak<TSample extends PowerProfileSample>(samples: TSample[]): PowerProfilePeak<TSample> {
    if (samples.length === 0) {
        throw new PowerProfileInputError('power profile must contain at least one sample.');
    }

    let peakIndex = 0;
    let totalRelativePower = 0;

    samples.forEach((sample, index) => {
        validateSample(sample, index);
        totalRelativePower += sample.relativePower;

        if (sample.relativePower > samples[peakIndex].relativePower) {
            peakIndex = index;
        }
    });

    const averageRelativePower = totalRelativePower / samples.length;

    if (averageRelativePower <= 0) {
        throw new PowerProfileInputError('average relative power must be greater than zero.');
    }

    const peak = samples[peakIndex];
    const peakRelativePower = peak.relativePower;

    return {
        peak,
        peakIndex,
        peakRelativePower,
        averageRelativePower,
        peakingFactor: peakRelativePower / averageRelativePower,
    };
}

function validateSample(sample: PowerProfileSample, index: number): void {
    if (!sample.label.trim()) {
        throw new PowerProfileInputError(`power profile sample ${index} must have a non-empty label.`);
    }

    if (!Number.isFinite(sample.relativePower)) {
        throw new PowerProfileInputError(`power profile sample ${index} relative power must be a finite number.`);
    }

    if (sample.relativePower < 0) {
        throw new PowerProfileInputError(`power profile sample ${index} relative power must be greater than or equal to zero.`);
    }
}