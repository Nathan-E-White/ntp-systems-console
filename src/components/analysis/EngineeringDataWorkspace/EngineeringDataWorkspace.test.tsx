import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {computeEngineOutputs} from '../../../physics/propulsionModel';
import {ENGINE_INPUT_PRESETS} from '../../../state/EngineStore';
import {buildEvidenceWorkspace} from '../../../demo/evidenceModel';
import {buildAnalysisLinkRegistryModel} from '../AnalysisLinkRegistry/AnalysisLinkRegistry.model';
import {buildChartWorkspaceModel} from '../ChartWorkspace/ChartWorkspace.model';
import {buildFixtureEvidenceWorkspaceModel} from '../FixtureEvidenceWorkspace/FixtureEvidenceWorkspace.model';
import {buildOutputWorkspaceModel} from '../OutputWorkspace/OutputWorkspace.model';
import {buildParameterWorkspaceModel} from '../ParameterWorkspace/ParameterWorkspace.model';
import {EngineeringDataWorkspace} from './EngineeringDataWorkspace';
import {buildEngineeringDataWorkspaceModel} from './EngineeringDataWorkspace.model';

describe('EngineeringDataWorkspace', () => {
    it('provides one composition boundary for the active engineering case', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const model = buildEngineeringDataWorkspaceModel({
            caseId: 'baselineStartup',
            caseLabel: 'Pewee-Inspired Benchmark',
            fixtures: buildFixtureEvidenceWorkspaceModel(),
            parameters: buildParameterWorkspaceModel(inputs),
            outputs: buildOutputWorkspaceModel(computeEngineOutputs(inputs)),
            charts: buildChartWorkspaceModel(),
            links: buildAnalysisLinkRegistryModel(),
            investigationEvidence: buildEvidenceWorkspace([]),
        });

        render(<EngineeringDataWorkspace model={model}/>);
        expect(screen.getByRole('region', {name: 'Engineering data workspace'}))
            .toHaveAttribute('data-case-id', 'baselineStartup');
    });
});
