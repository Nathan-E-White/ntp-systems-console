import {useEffect, useRef, type ReactNode} from 'react';

import {type EngineWorkspace, useEngineStore} from '../state/EngineStore';

export interface FocusedPanelProps {
    children: ReactNode;
    className?: string;
    workspace: EngineWorkspace;
}

export function FocusedPanel({children, className = '', workspace}: Readonly<FocusedPanelProps>) {
    const activeWorkspace = useEngineStore((state) => state.activeWorkspace);
    const focused = activeWorkspace === workspace;
    const panelClassName = buildPanelClassName(className, focused);
    const panelRef = useRef<HTMLElement | null>(null);
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (!focused) {
            return;
        }

        panelRef.current?.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'center',
        });
    }, [focused]);

    return (
        <section
            aria-current={focused ? 'true' : undefined}
            className={panelClassName}
            data-workspace={workspace}
            ref={panelRef}
        >
            {children}
        </section>
    );
}

function buildPanelClassName(className: string, focused: boolean): string {
    return [className, focused ? 'is-focused' : 'is-muted'].filter(Boolean).join(' ');
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}