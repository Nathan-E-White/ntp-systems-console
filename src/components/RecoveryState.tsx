import type {ReactNode} from 'react';

export type RecoveryKind = 'loading' | 'empty' | 'parser-error' | 'projection-error' | 'webgl-fallback';

const content: Record<RecoveryKind, {title: string; nextAction: string}> = {
    loading: {title: 'Preparing review surface', nextAction: 'Wait for the requested workspace to finish loading.'},
    empty: {title: 'No review records available', nextAction: 'Adjust the evidence filter or import an artifact.'},
    'parser-error': {title: 'Parser could not prepare this artifact', nextAction: 'Review the diagnostic and correct or replace the source file.'},
    'projection-error': {title: 'Review projection is unavailable', nextAction: 'Open the source artifact and use the diagnostic to recover.'},
    'webgl-fallback': {title: 'Interactive scene is unavailable', nextAction: 'Continue with the evidence and decision record; WebGL is optional.'},
};

export function RecoveryState({detail, kind, children}: Readonly<{kind: RecoveryKind; detail?: string; children?: ReactNode}>) {
    const state = content[kind];
    return <section className="recovery-state" data-recovery-kind={kind} role="status">
        <p className="eyebrow">recovery state</p><strong>{state.title}</strong><p>{detail ?? state.nextAction}</p>{children}
    </section>;
}
