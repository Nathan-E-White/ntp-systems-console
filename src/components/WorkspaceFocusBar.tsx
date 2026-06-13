import {Activity, Atom, ClipboardCheck, Rocket} from 'lucide-react';

import {type EngineWorkspace, useEngineStore} from '../state/EngineStore';

interface WorkspaceFocusOption {
    id: EngineWorkspace;
    label: string;
    description: string;
    Icon: typeof Atom;
}

const WORKSPACE_FOCUS_OPTIONS: WorkspaceFocusOption[] = [
    {
        id: 'reactor',
        label: 'Reactor',
        description: 'Core state, channel-wall criterion, and model basis',
        Icon: Atom,
    },
    {
        id: 'propulsion',
        label: 'Propulsion',
        description: 'Hydrogen flow, nozzle response, thrust, and Isp',
        Icon: Rocket,
    },
    {
        id: 'transients',
        label: 'Transients',
        description: 'Startup, shutdown, and stability timeline',
        Icon: Activity,
    },
    {
        id: 'review',
        label: 'Review',
        description: 'Risks, posture, and follow-up analyses',
        Icon: ClipboardCheck,
    },
];

export function WorkspaceFocusBar() {
    const activeWorkspace = useEngineStore((state) => state.activeWorkspace);
    const focusWorkspace = useEngineStore((state) => state.focusWorkspace);

    return (
        <nav aria-label="Workspace focus" className="workspace-focus-bar">
            {WORKSPACE_FOCUS_OPTIONS.map(({id, label, description, Icon}) => {
                const active = id === activeWorkspace;

                return (
                    <button
                        aria-current={active ? 'page' : undefined}
                        aria-label={`${label}: ${description}`}
                        className={active ? 'workspace-focus-button active' : 'workspace-focus-button'}
                        key={id}
                        onClick={() => focusWorkspace(id)}
                        title={description}
                        type="button"
                    >
                        <Icon aria-hidden="true" size={16}/>
                        <span>{label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
