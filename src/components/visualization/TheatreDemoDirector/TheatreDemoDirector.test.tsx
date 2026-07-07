import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {
    TheatreDemoDirector,
    TheatreDemoDirectorProvider,
    useTheatreDemoDirector,
} from './TheatreDemoDirector';
import {buildTheatreDemoDirectorModel} from './TheatreDemoDirector.model';

describe('TheatreDemoDirector', () => {
    it('declares the walkthrough cue sequence without mutating app state', () => {
        render(<TheatreDemoDirector model={buildTheatreDemoDirectorModel()}/>);
        expect(screen.getByRole('status', {name: 'Theatre demo director'}))
            .toHaveAttribute('data-cue-count', '5');
    });

    it('waits for presenter navigation between cues', () => {
        render(
            <TheatreDemoDirectorProvider model={buildTheatreDemoDirectorModel()}>
                <DirectorProbe/>
            </TheatreDemoDirectorProvider>,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Replay'}));
        expect(screen.getByLabelText('director state')).toHaveTextContent('0:animating');
        fireEvent.click(screen.getByRole('button', {name: 'Settle'}));
        expect(screen.getByLabelText('director state')).toHaveTextContent('0:waiting');
        expect(screen.getByLabelText('director state')).toHaveTextContent('establish-basis');
        fireEvent.click(screen.getByRole('button', {name: 'Next'}));
        expect(screen.getByLabelText('director state')).toHaveTextContent('1:animating');
        fireEvent.click(screen.getByRole('button', {name: 'Back'}));
        expect(screen.getByLabelText('director state')).toHaveTextContent('0:animating');
    });
});

function DirectorProbe() {
    const director = useTheatreDemoDirector();
    return (
        <>
            <output aria-label="director state">
                {director.state.activeCueIndex}:{director.state.playbackStatus}:{director.state.activeCueId}
            </output>
            <button onClick={director.replay} type="button">Replay</button>
            <button onClick={director.completeCueAnimation} type="button">Settle</button>
            <button onClick={director.advanceCue} type="button">Next</button>
            <button onClick={director.previousCue} type="button">Back</button>
        </>
    );
}
