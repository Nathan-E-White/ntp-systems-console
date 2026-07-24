import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {App} from './App';
import {useEngineStore} from './state/EngineStore';

describe('App', () => {
    afterEach(() => {
        useEngineStore.getState().resetDemo();
        window.history.replaceState(null, '', '/');
    });

    it('opens a routed Evidence Artifact once', async () => {
        window.history.replaceState(null, '', '/?section=model-evidence&focus=reactor-criticality&case=thermalMarginInvestigation');

        render(<App/>);

        expect(screen.getAllByText(/evidence opened:\s*reactor-criticality/)).toHaveLength(1);
        expect(useEngineStore.getState().selectedPresetId).toBe('thermalMarginInvestigation');
    });

    it('restores a routed Custom What-If in a new browser session', () => {
        const inputs = encodeURIComponent(JSON.stringify({thermalPowerMw: 525, overrideRationale: 'Hold margin for review'}));
        window.history.replaceState(null, '', `/?section=review&case=customWhatIf&base=thermalMarginInvestigation&inputs=${inputs}`);

        render(<App/>);

        expect(useEngineStore.getState().selectedPresetId).toBe('customWhatIf');
        expect(useEngineStore.getState().basePresetId).toBe('thermalMarginInvestigation');
        expect(useEngineStore.getState().inputs.thermalPowerMw).toBe(525);
        expect(useEngineStore.getState().inputs.overrideRationale).toBe('Hold margin for review');
    });

    it('keeps a Custom What-If citeable after an input change', async () => {
        render(<App/>);

        useEngineStore.getState().setInput('thermalPowerMw', 525);

        await waitFor(() => expect(parseSearch()).toMatchObject({case: 'customWhatIf', base: 'baselineStartup'}));
        expect(JSON.parse(parseSearch().inputs!)).toMatchObject({thermalPowerMw: 525});
    });

    it('resets the investigation without re-entering the reset transition', async () => {
        render(<App/>);

        fireEvent.click(screen.getByRole('button', {name: 'Reset Demo'}));

        expect(await screen.findByText('reset: Reset investigation')).toBeVisible();
        expect(screen.getAllByText('reset: Reset investigation')).toHaveLength(1);
    });
});

function parseSearch() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}
