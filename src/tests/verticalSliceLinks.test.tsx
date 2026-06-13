import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProviders} from '../components/analysis/ActiveCaseProviders';
import {KpiCards} from '../components/KpiCards';
import {ModelEvidenceSection} from '../components/sections/ModelEvidenceSection';
import {buildActiveCaseWorkspace} from '../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../physics/propulsionModel';
import {generateTransient} from '../physics/transientModel';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {useGuidedInvestigation} from '../components/visualization';

const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
const outputs = computeEngineOutputs(inputs);
const workspace = buildActiveCaseWorkspace({
    selection: 'baselineStartup',
    inputs,
    outputs,
    transient: generateTransient(inputs),
});

describe('vertical-slice concern linking', () => {
    it('links thermal-margin selection to MCNP and MOOSE evidence', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <KpiCards outputs={outputs}/>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        fireEvent.click(screen.getByRole('button', {name: /Wall criterion margin/i}));

        expect(screen.getByRole('heading', {name: 'Neutronics / transport evidence'}).closest('article'))
            .toHaveClass('linked-evidence');
        expect(screen.getByRole('heading', {name: 'Thermomechanics evidence'}).closest('article'))
            .toHaveClass('linked-evidence');
        expect(screen.getByRole('heading', {name: 'Engine system / stability evidence'}).closest('article'))
            .not.toHaveClass('linked-evidence');
    });

    it('links stability selection to ROCETS evidence', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <KpiCards outputs={outputs}/>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        fireEvent.click(screen.getByRole('button', {name: /basis completeness 70% watch/i}));

        expect(screen.getByRole('heading', {name: 'Engine system / stability evidence'}).closest('article'))
            .toHaveClass('linked-evidence');
    });

    it('focuses the selected criticality artifact in Model Evidence', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <SelectCriticality/>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Select criticality evidence'}));
        expect(screen.getByRole('heading', {name: 'Criticality / burnup evidence'}).closest('article'))
            .toHaveClass('focused-evidence');
        expect(screen.getByRole('heading', {name: 'Neutronics / transport evidence'}).closest('article'))
            .not.toHaveClass('focused-evidence');
    });
});

function SelectCriticality() {
    const investigation = useGuidedInvestigation();
    return (
        <button
            onClick={() => investigation.selectComponent('reactor-criticality')}
            type="button"
        >
            Select criticality evidence
        </button>
    );
}
