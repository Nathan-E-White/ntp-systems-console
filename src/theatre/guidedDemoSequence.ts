import type {TheatreCueModel} from '../components/visualization/TheatreDemoDirector/TheatreDemoDirector.model';

const DEFAULT_YAW = -0.55;
const cueTargets: Record<string, number> = {
    'establish-basis': -0.55,
    'follow-flow': 0.35,
    'inspect-channel': -1.15,
    'correlate-evidence': -0.85,
    review: -0.55,
};

let currentYaw = DEFAULT_YAW;
let activeTimer: number | null = null;
let activeResolve: (() => void) | null = null;
let sequenceVersion = 0;
let paused = false;
const yawListeners = new Set<(yaw: number) => void>();
let theatreStudioInitialized = false;

export function getGuidedDemoYaw(): number {
    return currentYaw;
}

export function subscribeToGuidedDemoYaw(listener: (yaw: number) => void): () => void {
    yawListeners.add(listener);
    listener(currentYaw);
    return () => yawListeners.delete(listener);
}

export interface GuidedDemoCallbacks {
    readonly onProgress?: (progress: number) => void;
}

export async function runGuidedDemoCue(
    cue: TheatreCueModel,
    callbacks: GuidedDemoCallbacks,
): Promise<'complete' | 'cancelled'> {
    cancelGuidedDemoSequence();
    const version = sequenceVersion;
    paused = false;

    const studioRequested = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).has('theatreStudio');
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test' && studioRequested) {
        void initializeTheatreStudio();
    }

    await animateYaw(
        cueTargets[cue.id] ?? DEFAULT_YAW,
        cue.animationDurationSeconds * 1_000,
        version,
        (cueProgress) => callbacks.onProgress?.(cueProgress),
    );

    return version === sequenceVersion ? 'complete' : 'cancelled';
}

export function cancelGuidedDemoSequence(): void {
    sequenceVersion += 1;
    paused = false;
    if (activeTimer !== null) {
        window.clearTimeout(activeTimer);
        activeTimer = null;
    }
    activeResolve?.();
    activeResolve = null;
}

export function pauseGuidedDemoSequence(): void {
    paused = true;
}

export function resumeGuidedDemoSequence(): void {
    paused = false;
}

async function animateYaw(
    targetYaw: number,
    durationMs: number,
    version: number,
    onProgress: (progress: number) => void,
): Promise<void> {
    const effectiveDurationMs = import.meta.env.MODE === 'test' ? 1 : durationMs;
    const startingYaw = currentYaw;
    let elapsedMs = 0;
    let previousFrame = performance.now();

    await new Promise<void>((resolve) => {
        activeResolve = resolve;
        const animate = (now: number) => {
            if (version !== sequenceVersion) {
                activeResolve = null;
                resolve();
                return;
            }
            const frameDelta = now - previousFrame;
            previousFrame = now;
            if (paused) {
                activeTimer = window.setTimeout(() => animate(performance.now()), 16);
                return;
            }
            elapsedMs += frameDelta;
            const progress = Math.min(elapsedMs / effectiveDurationMs, 1);
            const eased = progress * progress * (3 - 2 * progress);
            currentYaw = startingYaw + (targetYaw - startingYaw) * eased;

            yawListeners.forEach((listener) => listener(currentYaw));
            onProgress(progress);

            if (progress < 1) {
                activeTimer = window.setTimeout(() => animate(performance.now()), 16);
                return;
            }

            activeTimer = null;
            activeResolve = null;
            resolve();
        };

        activeTimer = window.setTimeout(() => animate(performance.now()), 0);
    });
}

async function initializeTheatreStudio(): Promise<void> {
    if (theatreStudioInitialized) return;
    theatreStudioInitialized = true;
    try {
        const [coreModule, studioModule] = await Promise.all([
            import('@theatre/core'),
            import('@theatre/studio'),
        ]);
        const studioDefault = studioModule.default;
        const studio = typeof studioDefault.initialize === 'function'
            ? studioDefault
            : (studioDefault as unknown as {default: typeof studioDefault}).default;
        studio.initialize({usePersistentStorage: false});
        studio.ui.hide();
        coreModule.getProject('NTP Guided Demo')
            .sheet('Engine Walkthrough')
            .object('Engine Root', {yaw: DEFAULT_YAW});
    } catch (error) {
        theatreStudioInitialized = false;
        console.warn('Theatre Studio authoring tools were unavailable; deterministic playback remains active.', error);
    }
}
