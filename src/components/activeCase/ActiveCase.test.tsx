import {renderHook, act} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProvider, useActiveCase} from './ActiveCase';

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
});
