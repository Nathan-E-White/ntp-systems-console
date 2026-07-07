import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';

import type {TheatreDemoDirectorModel} from './TheatreDemoDirector.model';

export type TheatrePlaybackStatus =
    | 'idle'
    | 'animating'
    | 'waiting'
    | 'paused'
    | 'complete'
    | 'stopped'
    | 'error';

export interface TheatreDemoDirectorProps {
    readonly model: TheatreDemoDirectorModel;
    readonly initialCueId?: string | null;
}

export interface TheatreDemoDirectorState {
    readonly activeCueId: string | null;
    readonly activeCueIndex: number | null;
    readonly playbackStatus: TheatrePlaybackStatus;
    readonly cueProgress: number;
}

export interface TheatreDemoDirectorContextValue {
    readonly model: TheatreDemoDirectorModel;
    readonly state: TheatreDemoDirectorState;
    readonly replay: () => void;
    readonly advanceCue: () => void;
    readonly previousCue: () => void;
    readonly pause: () => void;
    readonly resume: () => void;
    readonly stop: () => void;
    readonly completeCueAnimation: () => void;
    readonly fail: () => void;
    readonly setCueProgress: (progress: number) => void;
}

export interface TheatreDemoDirectorProviderProps extends TheatreDemoDirectorProps {
    readonly children: ReactNode;
}

const TheatreDemoDirectorContext = createContext<TheatreDemoDirectorContextValue | undefined>(undefined);

/** Boundary: deterministic presentation choreography. Scope: visual cues; no domain-state writes. */
export function TheatreDemoDirectorProvider({
    model,
    initialCueId = null,
    children,
}: Readonly<TheatreDemoDirectorProviderProps>) {
    const initialCueIndex = initialCueId
        ? model.cues.findIndex((cue) => cue.id === initialCueId)
        : -1;
    const [activeCueIndex, setActiveCueIndex] = useState<number | null>(
        initialCueIndex >= 0 ? initialCueIndex : null,
    );
    const [playbackStatus, setPlaybackStatus] = useState<TheatrePlaybackStatus>('idle');
    const [cueProgress, setCueProgress] = useState(0);
    const activeCueId = activeCueIndex === null ? null : model.cues[activeCueIndex]?.id ?? null;
    const animateCue = useCallback((index: number) => {
        setActiveCueIndex(index);
        setCueProgress(0);
        setPlaybackStatus('animating');
    }, []);
    const replay = useCallback(() => animateCue(0), [animateCue]);
    const advanceCue = useCallback(() => {
        if (activeCueIndex === null) return animateCue(0);
        if (activeCueIndex >= model.cues.length - 1) {
            setCueProgress(1);
            setPlaybackStatus('complete');
            return;
        }
        animateCue(activeCueIndex + 1);
    }, [activeCueIndex, animateCue, model.cues.length]);
    const previousCue = useCallback(
        () => animateCue(Math.max((activeCueIndex ?? 0) - 1, 0)),
        [activeCueIndex, animateCue],
    );
    const pause = useCallback(
        () => setPlaybackStatus((status) => status === 'animating' ? 'paused' : status),
        [],
    );
    const resume = useCallback(
        () => setPlaybackStatus((status) => status === 'paused' ? 'animating' : status),
        [],
    );
    const stop = useCallback(() => {
        setActiveCueIndex(null);
        setCueProgress(0);
        setPlaybackStatus('stopped');
    }, []);
    const completeCueAnimation = useCallback(() => {
        setCueProgress(1);
        setPlaybackStatus('waiting');
    }, []);
    const fail = useCallback(() => setPlaybackStatus('error'), []);
    const value = useMemo(() => ({
        model,
        state: {activeCueId, activeCueIndex, playbackStatus, cueProgress},
        replay,
        advanceCue,
        previousCue,
        pause,
        resume,
        stop,
        completeCueAnimation,
        fail,
        setCueProgress,
    }), [
        activeCueId,
        activeCueIndex,
        advanceCue,
        completeCueAnimation,
        cueProgress,
        fail,
        model,
        pause,
        playbackStatus,
        previousCue,
        replay,
        resume,
        stop,
    ]);
    return <TheatreDemoDirectorContext.Provider value={value}>{children}</TheatreDemoDirectorContext.Provider>;
}

export function useTheatreDemoDirector(): TheatreDemoDirectorContextValue {
    const context = useContext(TheatreDemoDirectorContext);
    if (!context) throw new Error('useTheatreDemoDirector must be used inside TheatreDemoDirectorProvider.');
    return context;
}

export function TheatreDemoDirectorView() {
    const {model, state} = useTheatreDemoDirector();
    return (
        <div
            aria-label="Theatre demo director"
            data-cue-count={model.cues.length}
            data-cue-index={state.activeCueIndex ?? -1}
            data-playback-status={state.playbackStatus}
            data-scope="theatre-demo-director"
            role="status"
        />
    );
}

export function TheatreDemoDirector(props: Readonly<TheatreDemoDirectorProps>) {
    return (
        <TheatreDemoDirectorProvider {...props}>
            <TheatreDemoDirectorView/>
        </TheatreDemoDirectorProvider>
    );
}
