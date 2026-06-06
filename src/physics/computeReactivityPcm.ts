
import {KeffBandInputError} from "./keffBandInputError"
export function computeReactivityPcm(keff: number): number


/**
 * Converts effective multiplication factor to reactivity in pcm.
 *
 * Reactivity is defined as:
 *   rho = (k_eff - 1) / k_eff
 *
 * One pcm is 1e-5 delta-k/k, so:
 *   rho_pcm = rho * 100_000
 *
 * This helper is intended for reduced-order dashboard interpretation,
 * not design-quality criticality analysis.
 */
export function computeReactivityPcm(keff: number): number {
    if (!Number.isFinite(keff)) {
        throw new KeffBandInputError('k-eff must be a finite number.');
    }

    if (keff <= 0) {
        throw new KeffBandInputError('k-eff must be greater than zero.');
    }

    return ((keff - 1) / keff) * 100_000;
}