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
    onReturnToEvidence?: () => void;
    onShowCommandPalette?: () => void;
    onShowKeyboardMap?: () => void;
}

export function AppLayout({activeSectionId, children, onResetDemo, onReturnToEvidence, onSectionChange, onShowCommandPalette, onShowKeyboardMap}: AppLayoutProps) {
    const selectedPresetId = useEngineStore((state) => state.selectedPresetId);

    return (
        <main className="app-shell">
            <header className="hero-panel">
                <div>
                    <p className="eyebrow">Amentum R0157331 · portfolio workflow demonstration</p>
                    <h1>SNP Engine Systems Analysis Workbench</h1>
                    <p className="hero-copy">
                        Operating-case analysis, nuclear fuel-performance evidence, model handoff, and engineering review for SNP systems.
                    </p>
                </div>
                <div className="case-status-panel" aria-label="Current demo case">
                    <span>Current case</span>
                    <strong>{getCaseLabel(selectedPresetId)}</strong>
                    <small>Screening model · static MCNP/BISON/MOOSE/ROCETS fixtures</small>
                    <button type="button" onClick={onResetDemo}>
                        <RotateCcw aria-hidden="true" size={15}/>
                        Reset Demo
                    </button>
                    {onReturnToEvidence && <button type="button" onClick={onReturnToEvidence}>Return to last evidence</button>}
                    {onShowCommandPalette && <button type="button" onClick={onShowCommandPalette}>Command palette</button>}
                    {onShowKeyboardMap && <button type="button" onClick={onShowKeyboardMap}>Keyboard map</button>}
                </div>
            </header>

            <AppSectionTabs activeSectionId={activeSectionId} onSectionChange={onSectionChange}/>
            <p className="app-scope">
                <strong>Scope:</strong> screening workflow with static synthetic fixtures; no design or validation output.
            </p>
            {children}
        </main>
    );
}
