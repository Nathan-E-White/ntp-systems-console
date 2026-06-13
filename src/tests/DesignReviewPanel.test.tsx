import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {buildDesignReviewModel, DesignReviewPanel} from '../components/DesignReviewPanel';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';

const nominalInputs: EngineInputs = {
    ...ENGINE_INPUT_PRESETS.baselineStartup,
};

const nominalOutputs: EngineOutputs = {
    outletTemperatureK: 2680,
    exhaustVelocityMPerSec: 8580,
    fuelTemperatureK: 2625,
    thermalMarginK: 225,
    peakChannelWallTemperatureK: 2625,
    channelWallCriterionMarginK: 225,
    specificImpulseSec: 875,
    thrustKn: 118,
    pressureDropMpa: 1.1,
    stabilityScore: 92,
    stabilityStatus: 'nominal',
    basisCompletenessPercent: 92,
    reviewPosture: 'nominal',
};

describe('buildDesignReviewModel', () => {
    it('builds the expected baseline model for a nominal case', () => {
        const model = buildDesignReviewModel(nominalOutputs);

        expect(model.risks).toEqual(['reduced-order model', 'not a flight/design tool']);
        expect(model.recommendations).toEqual([
            'Compare transient outlet-temperature response against a ROCETS-style system trace.',
            'Correlate the synthetic axial/radial power profile with MCNP/OpenMC handoff documentation.',
            'Evaluate payload-side shielding trades against mass fraction and mission architecture.',
        ]);
        expect(model.casePosture).toBe(
            'The case appears suitable for a first-pass design-review walkthrough, subject to higher-fidelity model handoff.',
        );
    });

    it('adds thermal-margin risk posture and fuel-performance follow-up for a constrained thermal case', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            channelWallCriterionMarginK: 95,
        });

        expect(model.risks).toContain('channel wall criterion watch');
        expect(model.casePosture).toBe(
            'The case should be treated as a constrained thermal-margin scenario before any performance claims are emphasized.',
        );
        expect(model.recommendations).toContain(
            'Route peak channel-wall temperature into a coupled conduction and qualified material-criterion follow-up case.',
        );
    });

    it('adds pressure-drop review language when pressure drop is high', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            pressureDropMpa: 1.55,
        });

        expect(model.risks).toContain('pressure-drop watch');
        expect(model.casePosture).toBe(
            'The case is performance-positive, but pressure-drop and flow-path assumptions deserve review.',
        );
        expect(model.recommendations).toContain(
            'Review propellant channel pressure-drop assumptions and candidate flow-area trades.',
        );
    });

    it('adds transient-stability review language when stability is non-nominal', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            basisCompletenessPercent: 62,
            reviewPosture: 'watch',
        });

        expect(model.risks).toContain('model-basis closure required');
        expect(model.casePosture).toBe('The calculated operating point remains subject to explicit property, component-pressure, and transient-model limitations.');
        expect(model.recommendations).toContain(
            'Close the property, whole-engine pressure-loss, and transient-model review flags before asserting a nominal posture.',
        );
    });
});

describe('DesignReviewPanel', () => {
    it('renders the design-review region with the expected accessible heading', () => {
        render(<DesignReviewPanel inputs={nominalInputs} outputs={nominalOutputs}/>);

        expect(screen.getByRole('heading', {name: 'Analyst Notes'})).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: 'Recommended follow-up analyses'})).toBeInTheDocument();
    });
});
