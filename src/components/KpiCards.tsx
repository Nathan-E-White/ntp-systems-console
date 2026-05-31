import type { EngineOutputs } from '../types/EngineState';

interface KpiCardsProps {
  outputs: EngineOutputs;
}

export function KpiCards({ outputs }: KpiCardsProps) {
  return (
    <aside className="kpi-stack">
      <Kpi label="Specific impulse" value={outputs.specificImpulseSec} suffix="s" />
      <Kpi label="Thrust" value={outputs.thrustKn} suffix="kN" />
      <Kpi label="Outlet temp" value={outputs.outletTemperatureK} suffix="K" />
      <Kpi label="Fuel margin" value={outputs.thermalMarginK} suffix="K" emphasize={outputs.thermalMarginK < 180} />
      <div className={`panel stability ${outputs.stabilityStatus}`}>
        <p className="eyebrow">stability</p>
        <h2>{outputs.stabilityScore}</h2>
        <span>{outputs.stabilityStatus}</span>
      </div>
    </aside>
  );
}

function Kpi({ label, value, suffix, emphasize = false }: { label: string; value: number; suffix: string; emphasize?: boolean }) {
  return (
    <div className={`panel kpi-card ${emphasize ? 'attention' : ''}`}>
      <p>{label}</p>
      <strong>{Math.round(value).toLocaleString()}</strong>
      <span>{suffix}</span>
    </div>
  );
}
