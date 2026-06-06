import type { EngineInputs, MissionMode } from '../types/EngineState';
import { type EnginePresetId, type EngineVisualizationMode, useEngineStore } from '../state/EngineStore';

interface ParameterPanelProps {
  inputs: EngineInputs;
}

type NumericEngineInputKey = {
  [Key in keyof EngineInputs]: EngineInputs[Key] extends number ? Key : never;
}[keyof EngineInputs];

const ENGINE_PRESETS: Array<{ id: EnginePresetId; label: string }> = [
  { id: 'baselineStartup', label: 'Baseline Startup' },
  { id: 'highThrustBurn', label: 'High Thrust Burn' },
  { id: 'thermalMarginWatch', label: 'Thermal Margin Watch' },
  { id: 'cooldownReview', label: 'Cooldown Review' },
];

const VISUALIZATION_MODES: Array<{ id: EngineVisualizationMode; label: string }> = [
  { id: 'systems', label: 'Systems' },
  { id: 'thermal', label: 'Thermal' },
  { id: 'flow', label: 'Flow' },
  { id: 'review', label: 'Review' },
];

export function ParameterPanel({ inputs }: Readonly<ParameterPanelProps>) {
  const setInput = useEngineStore((state) => state.setInput);
  const setMissionMode = useEngineStore((state) => state.setMissionMode);
  const selectedPresetId = useEngineStore((state) => state.selectedPresetId);
  const visualizationMode = useEngineStore((state) => state.visualizationMode);
  const loadPreset = useEngineStore((state) => state.loadPreset);
  const setVisualizationMode = useEngineStore((state) => state.setVisualizationMode);

  const updateNumber = (key: NumericEngineInputKey) => (value: string) => {
    setInput(key, Number(value));
  };

  const updateMissionMode = (missionMode: MissionMode) => {
    setMissionMode(missionMode);
  };

  const updatePreset = (presetId: EnginePresetId) => {
    loadPreset(presetId);
  };

  const updateVisualizationMode = (nextVisualizationMode: EngineVisualizationMode) => {
    setVisualizationMode(nextVisualizationMode);
  };

  return (
    <aside className="panel controls-panel">
      <div className="panel-heading">
        <p className="eyebrow">scenario inputs</p>
        <h2>Engine Case</h2>
      </div>
      <div className="control-section">
        <h3>Case presets</h3>
        <div className="mode-buttons">
          {ENGINE_PRESETS.map((preset) => (
            <button
              className={preset.id === selectedPresetId ? 'active' : ''}
              key={preset.id}
              onClick={() => updatePreset(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <Slider label="Thermal power" value={inputs.thermalPowerMw} min={80} max={700} step={5} suffix="MWth" onChange={updateNumber('thermalPowerMw')} />
      <Slider label="Hydrogen mass flow" value={inputs.massFlowKgPerSec} min={4} max={24} step={0.1} suffix="kg/s" onChange={updateNumber('massFlowKgPerSec')} />
      <Slider label="Control drum angle" value={inputs.controlDrumAngleDeg} min={0} max={90} step={1} suffix="deg" onChange={updateNumber('controlDrumAngleDeg')} />
      <Slider label="Chamber pressure" value={inputs.chamberPressureMpa} min={1.5} max={12} step={0.1} suffix="MPa" onChange={updateNumber('chamberPressureMpa')} />
      <Slider label="Nozzle expansion ratio" value={inputs.nozzleExpansionRatio} min={20} max={250} step={1} suffix=":1" onChange={updateNumber('nozzleExpansionRatio')} />
      <Slider label="Fuel temperature limit" value={inputs.fuelTemperatureLimitK} min={2400} max={3300} step={10} suffix="K" onChange={updateNumber('fuelTemperatureLimitK')} />

      <div className="control-section">
        <h3>Mission phase</h3>
        <div className="mode-buttons">
          {(['startup', 'steadyBurn', 'shutdown', 'cooldown'] as MissionMode[]).map((mode) => (
            <button
              className={mode === inputs.missionMode ? 'active' : ''}
              key={mode}
              onClick={() => updateMissionMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h3>Visualization mode</h3>
        <div className="mode-buttons">
          {VISUALIZATION_MODES.map((mode) => (
            <button
              className={mode.id === visualizationMode ? 'active' : ''}
              key={mode.id}
              onClick={() => updateVisualizationMode(mode.id)}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: string) => void;
}

function Slider({ label, value, min, max, step, suffix, onChange }: SliderProps) {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <strong>{value.toLocaleString()} {suffix}</strong>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
