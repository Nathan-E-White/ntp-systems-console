import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {SceneCanvas} from './SceneCanvas';
import {buildSceneCanvasModel} from './SceneCanvas.model';

describe('SceneCanvas', () => {
    it('publishes camera configuration through the render boundary', () => {
        render(<SceneCanvas model={buildSceneCanvasModel()}/>);
        expect(screen.getByRole('img', {name: '3D scene canvas'})).toHaveAttribute('data-camera-fov', '38');
    });
});
