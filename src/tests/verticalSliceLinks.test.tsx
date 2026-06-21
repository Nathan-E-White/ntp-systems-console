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

    it('filters model evidence by fixture direction without changing fixture execution state', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        expect(screen.getAllByRole('button', {name: /ALL \(8\)/i})).toHaveLength(2);
        expect(screen.getByRole('button', {name: /INPUT/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /OUTPUT/i})).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /INPUT/i}));
        expect(document.querySelectorAll('.evidence-card')).toHaveLength(4);
        expect(screen.getByRole('heading', {name: 'Fixed-source input deck'})).toBeVisible();
        expect(screen.getByRole('heading', {name: 'Criticality input deck'})).toBeVisible();
        expect(screen.queryByRole('heading', {name: 'Neutronics / transport evidence'})).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /OUTPUT/i}));
        expect(document.querySelectorAll('.evidence-card')).toHaveLength(4);
        expect(screen.getByRole('heading', {name: 'Neutronics / transport evidence'})).toBeVisible();
        expect(screen.queryByRole('heading', {name: 'Criticality input deck'})).not.toBeInTheDocument();
    });

    it('filters model evidence by fixture family and shows pairing inventory', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        expect(screen.getByRole('heading', {name: 'Paired Fixture Inventory'})).toBeVisible();
        expect(screen.getAllByText(/MCNP fixed-source transport/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/ROCETS system network/i).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByRole('button', {name: /MOOSE \(2\)/i}));
        expect(document.querySelectorAll('.evidence-card')).toHaveLength(2);
        expect(screen.getByRole('heading', {name: 'Thermomechanics input deck'})).toBeVisible();
        expect(screen.getByRole('heading', {name: 'Thermomechanics evidence'})).toBeVisible();
        expect(screen.queryByRole('heading', {name: 'Fixed-source input deck'})).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /INPUT/i}));
        expect(document.querySelectorAll('.evidence-card')).toHaveLength(1);
        expect(screen.getByRole('heading', {name: 'Thermomechanics input deck'})).toBeVisible();
    });

    it('shows read-only messaging on model evidence cards and keeps input/output parse surfaces separate', () => {
        render(
            <ActiveCaseProviders model={workspace}>
                <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
            </ActiveCaseProviders>,
        );

        fireEvent.click(screen.getByRole('button', {name: /INPUT/i}));
        const criticalityArticle = screen.getByRole('heading', {name: 'Criticality input deck'}).closest('article');
        expect(criticalityArticle).toBeDefined();
        if (!criticalityArticle) return;
        fireEvent.click(criticalityArticle);

        expect(screen.getByText('Criticality input deck')).toBeVisible();
        expect(screen.getByRole('heading', {name: 'Criticality input deck'}).closest('article'))
            .toHaveClass('evidence-card--expanded');
        expect(document.querySelector('.evidence-inspection-workspace')).toBeInTheDocument();
        expect(document.querySelectorAll('.evidence-card')).toHaveLength(1);
        expect(screen.getByText(/Read-only parser output/i)).toBeInTheDocument();
        expect(screen.getByText(/Solver execution and validation claims/i)).toBeVisible();
        expect(screen.queryByText(/No parser diagnostics/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/Criticality input deck parsed inventory/i)).toBeInTheDocument();
        expect(screen.getByText('Parsed tables and records')).toBeVisible();
        expect(screen.getByRole('button', {name: /Cells/i})).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Raw JSON'})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'Inspect'})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /Parse another fixture/i})).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /OUTPUT/i}));
        expect(screen.getByRole('heading', {name: 'Neutronics / transport evidence'})).toBeVisible();
    }, 10000);
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
