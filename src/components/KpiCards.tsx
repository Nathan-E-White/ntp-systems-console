import type { EngineOutputs } from '../types/EngineState';
import {useAnalysisLinkRegistry, useOutputWorkspace} from './analysis';
import type {NumericOutputKey} from './analysis';

interface KpiCardsProps {
  outputs: EngineOutputs;
}

export function KpiCards({ outputs }: Readonly<KpiCardsProps>) {
  const links = useAnalysisLinkRegistry();
  const outputWorkspace = useOutputWorkspace();

  const selectOutput = (key: NumericOutputKey, linkId: string) => {
    outputWorkspace.selectOutput(key);
    links.activateLink(linkId);
  };

  return (
    <aside className="kpi-stack">
      <Kpi label="Specific impulse" value={outputs.specificImpulseSec} suffix="s"
           active={links.state.activeLinkId === 'propulsion-stability'}
           onSelect={() => selectOutput('specificImpulseSec', 'propulsion-stability')} />
      <Kpi label="Thrust" value={outputs.thrustKn} suffix="kN"
           active={links.state.activeLinkId === 'propulsion-stability'}
           onSelect={() => selectOutput('thrustKn', 'propulsion-stability')} />
      <Kpi label="Outlet temp" value={outputs.outletTemperatureK} suffix="K"
           active={links.state.activeLinkId === 'thermal-margin'}
           onSelect={() => selectOutput('outletTemperatureK', 'thermal-margin')} />
      <Kpi label="Wall criterion margin" value={outputs.channelWallCriterionMarginK} suffix="K" emphasize={outputs.channelWallCriterionMarginK < 0}
           active={links.state.activeLinkId === 'thermal-margin'}
           onSelect={() => selectOutput('channelWallCriterionMarginK', 'thermal-margin')} />
      <Kpi label="Pressure drop" value={outputs.pressureDropMpa} suffix="MPa"
           precision={2}
           active={outputWorkspace.state.selectedOutputKey === 'pressureDropMpa'}
           onSelect={() => selectOutput('pressureDropMpa', 'propulsion-stability')} />
      <button className={`panel stability linkable-card ${outputs.reviewPosture} ${links.state.activeLinkId === 'propulsion-stability' ? 'linked' : ''}`}
              onClick={() => selectOutput('basisCompletenessPercent', 'propulsion-stability')} type="button">
        <p className="eyebrow">basis completeness</p>
        <h2>{outputs.basisCompletenessPercent}%</h2>
        <span>{outputs.reviewPosture}</span>
      </button>
    </aside>
  );
}

function Kpi({ label, value, suffix, emphasize = false, active = false, precision, onSelect }: Readonly<{
    label: string;
    value: number;
    suffix: string;
    emphasize?: boolean;
    active?: boolean;
    precision?: number;
    onSelect: () => void;
}>) {
  return (
    <button className={`panel kpi-card linkable-card ${emphasize ? 'attention' : ''} ${active ? 'linked' : ''}`}
            onClick={onSelect} type="button">
      <p>{label}</p>
      <strong>{value.toLocaleString(undefined, {maximumFractionDigits: precision ?? 0})}</strong>
      <span>{suffix}</span>
    </button>
  );
}
