import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {OutputWorkspaceProvider, ParameterWorkspaceProvider} from './analysis';
import {buildOutputWorkspaceModel} from './analysis/OutputWorkspace/OutputWorkspace.model';
import {buildParameterWorkspaceModel} from './analysis/ParameterWorkspace/ParameterWorkspace.model';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {CalculationBasisInspector} from './CalculationBasisInspector';

describe('CalculationBasisInspector', () => {
    it('shows MathML, substitutions, limitations, and selectable output traces', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const outputs = evaluateEngineCase(inputs).outputs;
        render(
            <ParameterWorkspaceProvider model={buildParameterWorkspaceModel(inputs)}>
                <OutputWorkspaceProvider
                    model={buildOutputWorkspaceModel(outputs)}
                    initialSelectedOutputKey="channelWallCriterionMarginK"
                >
                    <CalculationBasisInspector inputs={inputs}/>
                </OutputWorkspaceProvider>
            </ParameterWorkspaceProvider>,
        );

        expect(screen.getByRole('heading', {name: 'Calculation Basis'})).toBeInTheDocument();
        expect(screen.getByLabelText('Channel wall criterion margin')).not.toBeNull();
        expect(screen.getByText('Model boundary')).toBeInTheDocument();
        expect(screen.getByText(/2,750 - 2,611.36/)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Displayed calculation output'), {
            target: {value: 'pressureDropMpa'},
        });
        expect(screen.getByRole('heading', {name: 'Representative channel pressure drop'})).toBeInTheDocument();
        expect(screen.getByText('Physical Relation')).toBeInTheDocument();
    });
});
