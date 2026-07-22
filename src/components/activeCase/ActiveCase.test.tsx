import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProvider, useActiveCase} from './ActiveCase';
import {AnalysisLinkRegistryProvider, buildAnalysisLinkRegistryModel} from '../analysis';
import {
    buildScenePresentationWorkspaceModel,
    buildTheatreDemoDirectorModel,
    GuidedInvestigationProvider,
    ScenePresentationProvider,
    TheatreDemoDirectorProvider,
} from '../visualization';

describe('ActiveCaseProvider', () => {
    it('owns evidence focus, scene cue, and a reversible activity timeline through one public interface', () => {
        render(<Providers><Probe/></Providers>);

        fireEvent.click(screen.getByRole('button', {name: 'Open evidence'}));
        expect(screen.getByLabelText('active case')).toHaveTextContent('thermal-margin:user:none');
        fireEvent.click(screen.getByRole('button', {name: 'Present evidence'}));
        expect(screen.getByLabelText('active case')).toHaveTextContent('thermal-margin:theatre:inspect-channel');
        expect(screen.getByLabelText('activity timeline')).toHaveTextContent('evidence-opened:scene-cue');
        fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
        expect(screen.getByLabelText('active case')).toHaveTextContent('engine-overview:user:none');
        expect(screen.getByLabelText('activity timeline')).toHaveTextContent('reset');
    });
});

function Providers({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <AnalysisLinkRegistryProvider model={buildAnalysisLinkRegistryModel()}>
            <GuidedInvestigationProvider>
                <ScenePresentationProvider model={buildScenePresentationWorkspaceModel()}>
                    <TheatreDemoDirectorProvider model={buildTheatreDemoDirectorModel()}>
                        <ActiveCaseProvider>{children}</ActiveCaseProvider>
                    </TheatreDemoDirectorProvider>
                </ScenePresentationProvider>
            </GuidedInvestigationProvider>
        </AnalysisLinkRegistryProvider>
    );
}

function Probe() {
    const activeCase = useActiveCase();
    return (
        <>
            <output aria-label="active case">
                {activeCase.evidenceFocus.selectedComponentId}:{activeCase.evidenceFocus.owner}:{activeCase.sceneCueId ?? 'none'}
            </output>
            <output aria-label="activity timeline">{activeCase.timeline.map((entry) => entry.kind).join(':')}</output>
            <button onClick={() => activeCase.openEvidence('thermal-margin')}>Open evidence</button>
            <button onClick={() => activeCase.applySceneCue('inspect-channel', 'thermal-margin')}>Present evidence</button>
            <button onClick={activeCase.reset}>Reset</button>
        </>
    );
}
