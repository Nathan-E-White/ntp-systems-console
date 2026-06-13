import {type ReactNode} from 'react';
import {RotateCcw} from 'lucide-react';

import {AppSectionTabs} from './AppSectionTabs';
import {type AppSectionId} from './AppSections';
import {getCaseLabel} from './demo/demoModel';
import {useEngineStore} from './state/EngineStore';

interface AppLayoutProps {
    activeSectionId: AppSectionId;
    children: ReactNode;
    onSectionChange: (sectionId: AppSectionId) => void;
    onResetDemo: () => void;
}

export function AppLayout({activeSectionId, children, onResetDemo, onSectionChange}: AppLayoutProps) {
    const selectedPresetId = useEngineStore((state) => state.selectedPresetId);

    return (
        <main className="app-shell">
            <header className="hero-panel">
                <div>
                    <p className="eyebrow">Amentum R0157331 · portfolio workflow demonstration</p>
                    <h1>SNP Engine Systems Analysis Workbench</h1>
                    <p className="hero-copy">
                        A reduced-order nuclear propulsion workflow for operating-case definition, synthetic
                        multiphysics evidence handoff, review-flag interpretation, and milestone-review communication.
                    </p>
                </div>
                <div className="case-status-panel" aria-label="Current demo case">
                    <span>Current case</span>
                    <strong>{getCaseLabel(selectedPresetId)}</strong>
                    <small>Calculated model + static synthetic evidence</small>
                    <button type="button" onClick={onResetDemo}>
                        <RotateCcw aria-hidden="true" size={15}/>
                        Reset Demo
                    </button>
                </div>
            </header>

            <AppSectionTabs activeSectionId={activeSectionId} onSectionChange={onSectionChange}/>
            {children}
        </main>
    );
}
