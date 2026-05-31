import type { EngineInputs, MissionMode } from '../types/EngineState';

interface ParameterPanelProps {
  inputs: EngineInputs;
  onChange: (inputs: EngineInputs) => void;
}

export function ParameterPanel({ inputs, onChange }: ParameterPanelProps) {
  const updateNumber = (key: keyof EngineInputs) => (value: string) => {
    onChange({ ...inputs, [key]: Number(value) });
  };

  const updateMissionMode = (missionMode: MissionMode) => {
    onChange({ ...inputs, missionMode });
  };

  return (
    <aside className="panel controls-panel">
      <div className="panel-heading">
        <p className="eyebrow">scenario inputs</p>
        <h2>Engine Case</h2>
      </div>
      <Slider label="Thermal power" value={inputs.thermalPowerMw} min={80} max={700} step={5} suffix="MWth" onChange={updateNumber('thermalPowerMw')} />
      <Slider label="Hydrogen mass flow" value={inputs.massFlowKgPerSec} min={4} max={24} step={0.1} suffix="kg/s" onChange={updateNumber('massFlowKgPerSec')} />
      <Slider label="Control drum angle" value={inputs.controlDrumAngleDeg} min={0} max={90} step={1} suffix="deg" onChange={updateNumber('controlDrumAngleDeg')} />
      <Slider label="Chamber pressure" value={inputs.chamberPressureMpa} min={1.5} max={12} step={0.1} suffix="MPa" onChange={updateNumber('chamberPressureMpa')} />
      <Slider label="Nozzle expansion ratio" value={inputs.nozzleExpansionRatio} min={20} max={250} step={1} suffix=":1" onChange={updateNumber('nozzleExpansionRatio')} />
      <Slider label="Fuel temperature limit" value={inputs.fuelTemperatureLimitK} min={2400} max={3300} step={10} suffix="K" onChange={updateNumber('fuelTemperatureLimitK')} />

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
