import {KeffBandInputError} from "./keffBandInputError";

export interface TwoSigmaKeffBand {
    lower: number;
    upper: number;
    center: number;
    sigma: number;
}

/**
 * Computes an approximate two-sigma confidence band around k-effective.
 *
 * This helper assumes the supplied sigma is the one-sigma standard deviation
 * reported for the k-effective estimate. The returned band is:
 *   [k_eff - 2 sigma, k_eff + 2 sigma]
 *
 * This is intended for reduced-order dashboard interpretation and UI review,
 * not design-quality uncertainty quantification.
 */
export function computeTwoSigmaKeffBand(keff: number, sigma: number): TwoSigmaKeffBand {
    if (!Number.isFinite(keff)) {
        throw new KeffBandInputError('k-eff must be a finite number.');
    }

    if (!Number.isFinite(sigma)) {
        throw new KeffBandInputError('sigma must be a finite number.');
    }

    if (keff <= 0) {
        throw new KeffBandInputError('k-eff must be greater than zero.');
    }

    if (sigma < 0) {
        throw new KeffBandInputError('sigma must be greater than or equal to zero.');
    }

    const width = 2 * sigma;

    return {
        lower: keff - width,
        upper: keff + width,
        center: keff,
        sigma,
    };
}