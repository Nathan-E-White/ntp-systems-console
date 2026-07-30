import {renderHook, act} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProvider, useActiveCase} from './ActiveCase';
import {GuidedInvestigationProvider, useGuidedInvestigation} from '../visualization/GuidedInvestigation/GuidedInvestigation';

describe('ActiveCase', () => {
    it('owns evidence focus, scene cues, and a reversible activity trail', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => <ActiveCaseProvider caseId="baseline">{children}</ActiveCaseProvider>;
        const {result} = renderHook(() => useActiveCase(), {wrapper});

        act(() => result.current.openEvidence('thermal-margin'));
        act(() => result.current.cueScene('feed-system', 'guided'));
        act(() => result.current.undoLastEvent());

        expect(result.current.state.evidenceFocus).toBe('thermal-margin');
        expect(result.current.state.sceneCue).toBe('thermal-margin');
        expect(result.current.state.sceneOwner).toBe('manual');
        expect(result.current.state.timeline.map(({kind}) => kind)).toEqual(['evidence-opened']);
    });

    it('records an operating-case transition', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => <ActiveCaseProvider caseId="baseline">{children}</ActiveCaseProvider>;
        const {result} = renderHook(() => useActiveCase(), {wrapper});

        act(() => result.current.changeCase('what-if', 'Changed case to what-if'));

        expect(result.current.state.caseId).toBe('what-if');
        expect(result.current.state.timeline.at(-1)).toMatchObject({kind: 'case-change'});
    });

    it('keeps evidence selection ownership independent from a guided scene cue', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => (
            <ActiveCaseProvider caseId="baseline">
                <GuidedInvestigationProvider>{children}</GuidedInvestigationProvider>
            </ActiveCaseProvider>
        );
        const {result} = renderHook(() => ({
            activeCase: useActiveCase(),
            investigation: useGuidedInvestigation(),
        }), {wrapper});

        act(() => result.current.activeCase.openEvidence('thermal-margin'));
        act(() => result.current.activeCase.cueScene('feed-system', 'guided'));

        expect(result.current.activeCase.state.evidenceFocus).toBe('thermal-margin');
        expect(result.current.activeCase.state.sceneCue).toBe('feed-system');
        expect(result.current.investigation.state).toEqual({
            selectedComponentId: 'thermal-margin',
            owner: 'user',
        });

        act(() => result.current.activeCase.cueScene('thermal-margin'));

        expect(result.current.activeCase.state.sceneCue).toBe('thermal-margin');
        expect(result.current.activeCase.state.sceneOwner).toBe('manual');
        expect(result.current.investigation.state).toEqual({
            selectedComponentId: 'thermal-margin',
            owner: 'user',
        });
    });

    it('resets Active Case selection once without asking Guided Investigation to reset', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => (
            <ActiveCaseProvider caseId="baseline">
                <GuidedInvestigationProvider>{children}</GuidedInvestigationProvider>
            </ActiveCaseProvider>
        );
        const {result} = renderHook(() => ({
            activeCase: useActiveCase(),
            investigation: useGuidedInvestigation(),
        }), {wrapper});

        act(() => result.current.activeCase.openEvidence('thermal-margin'));
        act(() => result.current.activeCase.reset());

        expect(result.current.activeCase.state.resetVersion).toBe(1);
        expect(result.current.investigation.state).toEqual({
            selectedComponentId: 'engine-overview',
            owner: 'user',
        });
    });
});
