import type { EngineInputs, EngineOutputs } from '../types/EngineState';

interface DesignReviewPanelProps {
  inputs: EngineInputs;
  outputs: EngineOutputs;
}

export function DesignReviewPanel({ inputs, outputs }: DesignReviewPanelProps) {
  const risks = buildRisks(outputs);
  return (
    <section className="panel review-panel">
      <div className="panel-heading">
        <p className="eyebrow">design review mode</p>
        <h2>Analyst Notes</h2>
      </div>
      <p>
        At <strong>{inputs.thermalPowerMw} MWth</strong> and <strong>{inputs.massFlowKgPerSec} kg/s</strong> hydrogen flow,
        this reduced-order case predicts <strong>{Math.round(outputs.thrustKn)} kN</strong> thrust and
        <strong> {Math.round(outputs.specificImpulseSec)} s</strong> specific impulse.
      </p>
      <div className="risk-list">
        {risks.map((risk) => <span key={risk}>{risk}</span>)}
      </div>
      <h3>Recommended follow-up analyses</h3>
      <ul>
        <li>Compare transient outlet-temperature response against a ROCETS-style system trace.</li>
        <li>Export a placeholder axial/radial power profile to MCNP/OpenMC handoff documentation.</li>
        <li>Route peak fuel temperature and margin into a MOOSE/fuel-performance follow-up case.</li>
        <li>Evaluate payload-side shielding trades against mass fraction and mission architecture.</li>
      </ul>
    </section>
  );
}

function buildRisks(outputs: EngineOutputs): string[] {
  const risks = ['reduced-order model', 'not a flight/design tool'];
  if (outputs.thermalMarginK < 220) risks.push('thermal margin watch');
  if (outputs.pressureDropMpa > 1.4) risks.push('pressure-drop watch');
  if (outputs.stabilityStatus !== 'nominal') risks.push('transient stability review');
  return risks;
}
