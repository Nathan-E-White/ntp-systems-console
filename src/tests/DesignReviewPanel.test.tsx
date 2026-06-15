import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {buildDesignReviewModel, DesignReviewPanel} from '../components/DesignReviewPanel';
import {PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC} from '../physics/modelProfiles';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';

const nominalInputs: EngineInputs = {
    ...ENGINE_INPUT_PRESETS.baselineStartup,
};

const nominalOutputs: EngineOutputs = {
    outletTemperatureK: 2680,
    exhaustVelocityMPerSec: 8580,
    peakChannelWallTemperatureK: 2625,
    channelWallCriterionMarginK: 225,
    specificImpulseSec: 875,
    thrustKn: 118,
    pressureDropMpa: 1.1,
    basisCompletenessPercent: 92,
    reviewPosture: 'nominal',
};

describe('buildDesignReviewModel', () => {
    it('builds the expected baseline model for a nominal case', () => {
        const model = buildDesignReviewModel(nominalOutputs);

        expect(model.risks).toEqual(['screening model']);
        expect(model.casePosture).toBe(
            'First-pass review ready; higher-fidelity handoff pending.',
        );
    });

    it('adds thermal-margin risk posture and fuel-performance follow-up for a constrained thermal case', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            channelWallCriterionMarginK: 95,
        });

        expect(model.risks).toContain('channel wall criterion watch');
        expect(model.casePosture).toBe(
            'Thermal margin controls; defer performance claims.',
        );
    });

    it('adds pressure-drop review language when pressure drop is high', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            pressureDropMpa: 1.55,
        });

        expect(model.risks).toContain('pressure-drop watch');
        expect(model.casePosture).toBe(
            'Performance-positive; pressure-drop basis remains open.',
        );
    });

    it('adds transient-stability review language when stability is non-nominal', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            basisCompletenessPercent: 62,
            reviewPosture: 'watch',
        });

        expect(model.risks).toContain('model-basis closure required');
        expect(model.casePosture).toBe('Property, component-pressure, and transient-model limits control.');
    });
});

describe('DesignReviewPanel', () => {
    it('renders the design-review region with the expected accessible heading', () => {
        render(<DesignReviewPanel inputs={nominalInputs} outputs={nominalOutputs}/>);

        expect(screen.getByRole('heading', {name: 'Case Readout'})).toBeInTheDocument();
        expect(screen.queryByRole('heading', {name: 'Recommended follow-up analyses'})).not.toBeInTheDocument();
    });

    it('formats calculated input values at appropriate display precision', () => {
        render(
            <DesignReviewPanel
                inputs={{
                    ...nominalInputs,
                    thermalPowerMw: 500,
                    massFlowKgPerSec: PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC,
                }}
                outputs={nominalOutputs}
            />,
        );

        expect(screen.getByText('500 MWth')).toBeInTheDocument();
        expect(screen.getByText('12.96 kg/s')).toBeInTheDocument();
        expect(screen.queryByText(`${PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC} kg/s`)).not.toBeInTheDocument();
    });
});
