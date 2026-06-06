

import type {ReactorPhysicsPosture} from '../types/ReactorPhysicsPosture';

export interface ClassifyReactorPostureInput {
    keff: number;
    twoSigmaUpperKeff: number;
    reactivityPcm: number;
    shutdownMarginPcm: number;
}

export interface ReactorPostureThresholds {
    weakShutdownMarginPcm: number;
    excessReactivityWatchPcm: number;
    subcriticalUpperKeff: number;
}

export class ReactorPostureInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ReactorPostureInputError';
    }
}

export const DEFAULT_REACTOR_POSTURE_THRESHOLDS: ReactorPostureThresholds = {
    weakShutdownMarginPcm: -500,
    excessReactivityWatchPcm: 700,
    subcriticalUpperKeff: 0.995,
};

/**
 * Classifies the reduced-order reactor posture used by the dashboard.
 *
 * Priority order is intentional:
 *   1. weak shutdown margin is treated as the strongest review concern,
 *   2. excess positive reactivity is flagged next,
 *   3. clearly subcritical k-effective band is flagged as subcritical,
 *   4. otherwise the case is treated as inside the critical operating band.
 *
 * This is a UI/review classification helper for synthetic fixture data, not a
 * design-quality criticality safety determination.
 */
export function classifyReactorPosture(
    input: ClassifyReactorPostureInput,
    thresholds: ReactorPostureThresholds = DEFAULT_REACTOR_POSTURE_THRESHOLDS,
): ReactorPhysicsPosture {
    validateInput(input);
    validateThresholds(thresholds);

    if (input.shutdownMarginPcm > thresholds.weakShutdownMarginPcm) {
        return 'shutdown-margin-concern';
    }

    if (input.reactivityPcm > thresholds.excessReactivityWatchPcm) {
        return 'excess-reactivity';
    }

    if (input.twoSigmaUpperKeff < thresholds.subcriticalUpperKeff || input.keff < thresholds.subcriticalUpperKeff) {
        return 'subcritical';
    }

    return 'critical-band';
}

function validateInput(input: ClassifyReactorPostureInput): void {
    if (!Number.isFinite(input.keff)) {
        throw new ReactorPostureInputError('k-eff must be a finite number.');
    }

    if (!Number.isFinite(input.twoSigmaUpperKeff)) {
        throw new ReactorPostureInputError('two-sigma upper k-eff must be a finite number.');
    }

    if (!Number.isFinite(input.reactivityPcm)) {
        throw new ReactorPostureInputError('reactivity must be a finite number.');
    }

    if (!Number.isFinite(input.shutdownMarginPcm)) {
        throw new ReactorPostureInputError('shutdown margin must be a finite number.');
    }

    if (input.keff <= 0) {
        throw new ReactorPostureInputError('k-eff must be greater than zero.');
    }

    if (input.twoSigmaUpperKeff <= 0) {
        throw new ReactorPostureInputError('two-sigma upper k-eff must be greater than zero.');
    }
}

function validateThresholds(thresholds: ReactorPostureThresholds): void {
    if (!Number.isFinite(thresholds.weakShutdownMarginPcm)) {
        throw new ReactorPostureInputError('weak shutdown margin threshold must be a finite number.');
    }

    if (!Number.isFinite(thresholds.excessReactivityWatchPcm)) {
        throw new ReactorPostureInputError('excess reactivity watch threshold must be a finite number.');
    }

    if (!Number.isFinite(thresholds.subcriticalUpperKeff)) {
        throw new ReactorPostureInputError('subcritical upper k-eff threshold must be a finite number.');
    }

    if (thresholds.subcriticalUpperKeff <= 0) {
        throw new ReactorPostureInputError('subcritical upper k-eff threshold must be greater than zero.');
    }
}