import type {EngineInputs} from '../types/EngineState';
import {useOutputWorkspace, useParameterWorkspace} from './analysis';
import {collectInputDependencies, findCalculationNode} from '../physics/calculationTrace';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {
    ENGINE_INPUT_PRESETS,
    type EnginePresetId,
    useEngineStore,
} from '../state/EngineStore';

interface ParameterPanelProps {
    inputs: EngineInputs;
}

type NumericEngineInputKey = {
    [Key in keyof EngineInputs]: EngineInputs[Key] extends number ? Key : never;
}[keyof EngineInputs];

const CASES: Array<{id: EnginePresetId; label: string; note: string}> = [
    {id: 'baselineStartup', label: 'Pewee-Inspired Benchmark', note: 'Reference-controlled rated point'},
    {id: 'thermalMarginInvestigation', label: 'Thermal Margin Investigation', note: 'User-defined power-to-flow concern'},
];

export function ParameterPanel({inputs}: Readonly<ParameterPanelProps>) {
    const parameterWorkspace = useParameterWorkspace();
    const outputWorkspace = useOutputWorkspace();
    const setInput = useEngineStore((state) => state.setInput);
    const selectedPresetId = useEngineStore((state) => state.selectedPresetId);
    const loadPreset = useEngineStore((state) => state.loadPreset);
    const evaluation = evaluateEngineCase(inputs);
    const selectedOutputKey = outputWorkspace.state.selectedOutputKey ?? 'channelWallCriterionMarginK';
    const selectedNode = findCalculationNode(evaluation.trace, selectedOutputKey);
    const influentialInputs = new Set(selectedNode
        ? collectInputDependencies(evaluation.trace, selectedNode.id)
        : []);
    const lastEditedKey = parameterWorkspace.state.lastEditedKey;

    const updateNumber = (key: NumericEngineInputKey) => (value: string) => {
        const numericValue = Number(value);
        parameterWorkspace.setDraftValue(key, numericValue);
        setInput(key, numericValue);
    };

    const loadPreparedCase = (presetId: EnginePresetId) => {
        parameterWorkspace.resetDraft(ENGINE_INPUT_PRESETS[presetId]);
        loadPreset(presetId);
    };

    return (
        <aside className="panel controls-panel">
            <div className="panel-heading">
                <p className="eyebrow">operating scenario</p>
                <h2>Engine Case</h2>
            </div>

            <div className="case-choice-grid">
                {CASES.map((demoCase) => (
                    <button
                        className={demoCase.id === selectedPresetId ? 'case-choice active' : 'case-choice'}
                        key={demoCase.id}
                        onClick={() => loadPreparedCase(demoCase.id)}
                        type="button"
                    >
                        <strong>{demoCase.label}</strong>
                        <span>{demoCase.note}</span>
                    </button>
                ))}
            </div>
            {selectedPresetId === 'customWhatIf' ? (
                <p className="what-if-notice">
                    Custom What-If: {parameterWorkspace.state.dirtyKeys.length || 1} parameter
                    {parameterWorkspace.state.dirtyKeys.length === 1 ? '' : 's'} changed. Synthetic solver evidence was not rerun.
                </p>
            ) : null}

            <Slider highlighted={influentialInputs.has('thermalPowerMw')} recent={lastEditedKey === 'thermalPowerMw'} label="Thermal power" value={inputs.thermalPowerMw} min={80} max={700} step={5} suffix="MWth" onChange={updateNumber('thermalPowerMw')}/>
            <Slider highlighted={influentialInputs.has('massFlowKgPerSec')} recent={lastEditedKey === 'massFlowKgPerSec'} label="Hydrogen mass flow" value={inputs.massFlowKgPerSec} min={4} max={24} step={0.1} suffix="kg/s" onChange={updateNumber('massFlowKgPerSec')}/>
            <Slider highlighted={influentialInputs.has('controlDrumAngleDeg')} recent={lastEditedKey === 'controlDrumAngleDeg'} label="Control drum angle" value={inputs.controlDrumAngleDeg} min={0} max={90} step={1} suffix="deg" onChange={updateNumber('controlDrumAngleDeg')}/>
            <Slider highlighted={influentialInputs.has('channelWallCriterionK')} recent={lastEditedKey === 'channelWallCriterionK'} label="Channel wall criterion" value={inputs.channelWallCriterionK} min={2200} max={3300} step={10} suffix="K" onChange={updateNumber('channelWallCriterionK')}/>

            <details className="advanced-controls">
                <summary>What-if controls</summary>
                <Slider highlighted={influentialInputs.has('chamberPressureMpa')} recent={lastEditedKey === 'chamberPressureMpa'} label="Chamber pressure" value={inputs.chamberPressureMpa} min={1.5} max={12} step={0.1} suffix="MPa" onChange={updateNumber('chamberPressureMpa')}/>
                <Slider highlighted={influentialInputs.has('nozzleExpansionRatio')} recent={lastEditedKey === 'nozzleExpansionRatio'} label="Nozzle expansion ratio" value={inputs.nozzleExpansionRatio} min={20} max={250} step={1} suffix=":1" onChange={updateNumber('nozzleExpansionRatio')}/>
                <Slider highlighted={influentialInputs.has('inletTemperatureK')} recent={lastEditedKey === 'inletTemperatureK'} label="Inlet temperature" value={inputs.inletTemperatureK} min={20} max={300} step={5} suffix="K" onChange={updateNumber('inletTemperatureK')}/>
                <Slider highlighted={influentialInputs.has('thermalCouplingEfficiency')} recent={lastEditedKey === 'thermalCouplingEfficiency'} label="Thermal coupling efficiency" value={inputs.thermalCouplingEfficiency} min={0.5} max={1} step={0.005} suffix="" onChange={updateNumber('thermalCouplingEfficiency')}/>
                <Slider highlighted={influentialInputs.has('channelLengthM')} recent={lastEditedKey === 'channelLengthM'} label="Channel length" value={inputs.channelLengthM} min={0.5} max={2.5} step={0.01} suffix="m" onChange={updateNumber('channelLengthM')}/>
                <Slider highlighted={influentialInputs.has('channelHydraulicDiameterM')} recent={lastEditedKey === 'channelHydraulicDiameterM'} label="Hydraulic diameter" value={inputs.channelHydraulicDiameterM} min={0.001} max={0.01} step={0.0001} suffix="m" onChange={updateNumber('channelHydraulicDiameterM')}/>
                <Slider highlighted={influentialInputs.has('channelCount')} recent={lastEditedKey === 'channelCount'} label="Representative channel count" value={inputs.channelCount} min={500} max={12000} step={1} suffix="" onChange={updateNumber('channelCount')}/>
                <Slider highlighted={influentialInputs.has('nozzleEfficiency')} recent={lastEditedKey === 'nozzleEfficiency'} label="Nozzle performance factor" value={inputs.nozzleEfficiency} min={0.7} max={1} step={0.005} suffix="" onChange={updateNumber('nozzleEfficiency')}/>
                <Slider highlighted={influentialInputs.has('ambientPressureKpa')} recent={lastEditedKey === 'ambientPressureKpa'} label="Ambient pressure" value={inputs.ambientPressureKpa} min={0} max={101.325} step={0.1} suffix="kPa" onChange={updateNumber('ambientPressureKpa')}/>
                <label className="control-textarea">
                    <span>Override rationale</span>
                    <textarea
                        value={inputs.overrideRationale}
                        onChange={(event) => setInput('overrideRationale', event.target.value)}
                        placeholder="Required context for analyst-selected departures"
                    />
                </label>
            </details>
        </aside>
    );
}

function Slider({label, value, min, max, step, suffix, highlighted = false, recent = false, onChange}: {
    label: string; value: number; min: number; max: number; step: number; suffix: string;
    highlighted?: boolean; recent?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <label className={`slider-row ${highlighted ? 'calculation-input-highlight' : ''} ${recent ? 'calculation-input-recent' : ''}`}>
            <span>{label}</span>
            <strong>{value.toLocaleString()} {suffix}</strong>
            <input aria-label={label} type="range" value={value} min={min} max={max} step={step}
                   onInput={(event) => onChange(event.currentTarget.value)}
                   onChange={(event) => onChange(event.target.value)}/>
        </label>
    );
}
