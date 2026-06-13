import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {buildScenePresentationWorkspaceModel} from './ScenePresentationWorkspace.model';
import {ScenePresentationProvider, useScenePresentation} from './ScenePresentationWorkspace';

describe('ScenePresentationWorkspace', () => {
    it('restores the exact captured pose and presentation state after Theatre ownership', () => {
        render(
            <ScenePresentationProvider model={buildScenePresentationWorkspaceModel()}>
                <Probe/>
            </ScenePresentationProvider>,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Capture'}));
        fireEvent.click(screen.getByRole('button', {name: 'Explode'}));
        fireEvent.click(screen.getByRole('button', {name: 'Save'}));
        fireEvent.click(screen.getByRole('button', {name: 'Theatre'}));
        fireEvent.click(screen.getByRole('button', {name: 'Restore'}));

        expect(screen.getByLabelText('presentation state'))
            .toHaveTextContent('user:1:9,8,7:1,2,3');
    });

    it('returns to the fit-engine assembled default on reset', () => {
        render(
            <ScenePresentationProvider model={buildScenePresentationWorkspaceModel()}>
                <Probe/>
            </ScenePresentationProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'Explode'}));
        fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
        expect(screen.getByLabelText('presentation state'))
            .toHaveTextContent('user:0:8.8,4.4,12.2:-0.45,-0.55,0');
    });
});

function Probe() {
    const presentation = useScenePresentation();
    const pose = presentation.state.cameraPose;
    return (
        <>
            <output aria-label="presentation state">
                {presentation.state.cameraOwner}:{presentation.state.explodedViewProgress}:
                {pose.position.join(',')}:{pose.target.join(',')}
            </output>
            <button onClick={() => presentation.captureManualPose({position: [9, 8, 7], target: [1, 2, 3]})}>Capture</button>
            <button onClick={() => presentation.setExploded(true)}>Explode</button>
            <button onClick={presentation.saveTourSnapshot}>Save</button>
            <button onClick={() => presentation.requestTheatrePose({position: [2, 2, 2], target: [0, 0, 0]}, 0)}>Theatre</button>
            <button onClick={presentation.restoreTourSnapshot}>Restore</button>
            <button onClick={presentation.resetPresentation}>Reset</button>
        </>
    );
}
