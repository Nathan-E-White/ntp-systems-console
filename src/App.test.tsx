import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {App} from './App';
import {useEngineStore} from './state/EngineStore';

describe('App', () => {
    afterEach(() => {
        useEngineStore.getState().resetDemo();
        window.history.replaceState(null, '', '/');
    });

    it('opens a routed Evidence Artifact once', async () => {
        window.history.replaceState(null, '', '/?section=model-evidence&focus=reactor-criticality');

        render(<App/>);

        expect(screen.getAllByText(/evidence opened:\s*reactor-criticality/)).toHaveLength(1);
    });

    it('resets the investigation without re-entering the reset transition', async () => {
        render(<App/>);

        fireEvent.click(screen.getByRole('button', {name: 'Reset Demo'}));

        expect(await screen.findByText('reset: Reset investigation')).toBeVisible();
        expect(screen.getAllByText('reset: Reset investigation')).toHaveLength(1);
    });
});
