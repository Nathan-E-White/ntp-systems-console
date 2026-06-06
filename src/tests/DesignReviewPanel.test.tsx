import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {buildDesignReviewModel, DesignReviewPanel} from '../components/DesignReviewPanel';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';

const nominalInputs: EngineInputs = {
    thermalPowerMw: 450,
    massFlowKgPerSec: 14,
    inletTemperatureK: 120,
    chamberPressureMpa: 4.1,
    nozzleExpansionRatio: 80,
    controlDrumAngleDeg: 45,
    fuelTemperatureLimitK: 2850,
    shieldingMassFraction: 0.08,
    missionMode: 'startup',
};

const nominalOutputs: EngineOutputs = {
    outletTemperatureK: 2680,
    exhaustVelocityMPerSec: 8580,
    fuelTemperatureK: 2625,
    thermalMarginK: 225,
    specificImpulseSec: 875,
    thrustKn: 118,
    pressureDropMpa: 1.1,
    stabilityScore: 92,
    stabilityStatus: 'nominal',
};

describe('buildDesignReviewModel', () => {
    it('builds the expected baseline model for a nominal case', () => {
        const model = buildDesignReviewModel(nominalOutputs);

        expect(model.risks).toEqual(['reduced-order model', 'not a flight/design tool']);
        expect(model.recommendations).toEqual([
            'Compare transient outlet-temperature response against a ROCETS-style system trace.',
            'Export a placeholder axial/radial power profile to MCNP/OpenMC handoff documentation.',
            'Evaluate payload-side shielding trades against mass fraction and mission architecture.',
        ]);
        expect(model.casePosture).toBe(
            'The case appears suitable for a first-pass design-review walkthrough, subject to higher-fidelity model handoff.',
        );
    });

    it('adds thermal-margin risk posture and fuel-performance follow-up for a constrained thermal case', () => {
        const model = buildDesignReviewModel({
            ...nominalOutputs,
            thermalMarginK: 95,
        });

        expect(model.risks).toContain('thermal margin watch');
        expect(model.casePosture).toBe(
            'The case should be treated as a constrained thermal-margin scenario before any performance claims are emphasized.',
        );
        expect(model.recommendations).toContain(
            'Route peak fuel temperature and margin into a MOOSE/fuel-performance follow-up case.',
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
            stabilityScore: 62,
            stabilityStatus: 'watch',
        });

        expect(model.risks).toContain('transient stability review');
        expect(model.casePosture).toBe('The primary concern is transient behavior rather than steady-state performance.');
        expect(model.recommendations).toContain(
            'Run a focused startup/shutdown sensitivity sweep on drum motion, flow ramp rate, and thermal lag.',
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