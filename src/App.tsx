import { useMemo, useState } from 'react';
import { Activity, Atom, Gauge, Rocket } from 'lucide-react';
import { EngineScene } from './components/EngineScene';
import { ParameterPanel } from './components/ParameterPanel';
import { KpiCards } from './components/KpiCards';
import { TransientPlots } from './components/TransientPlots';
import { DesignReviewPanel } from './components/DesignReviewPanel';
import { MissionComparison } from './components/MissionComparison';
import { defaultInputs } from './data/defaultInputs';
import { computeEngineOutputs } from './physics/propulsionModel';
import { generateTransient } from './physics/transientModel';
import type { EngineInputs } from './types/EngineState';

export function App() {
  const [inputs, setInputs] = useState<EngineInputs>(defaultInputs);
  const outputs = useMemo(() => computeEngineOutputs(inputs), [inputs]);
  const transient = useMemo(() => generateTransient(inputs), [inputs]);

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Reduced-order portfolio demo · public educational model</p>
          <h1>NTP Systems Console</h1>
          <p className="hero-copy">
            A NERVA/Rover-inspired interactive dashboard for nuclear thermal propulsion trade studies,
            transient reasoning, and design-review communication.
          </p>
        </div>
        <div className="hero-badges" aria-label="project focus areas">
          <span><Atom size={16} /> Reactor</span>
          <span><Rocket size={16} /> Propulsion</span>
          <span><Gauge size={16} /> Transients</span>
          <span><Activity size={16} /> Review</span>
        </div>
      </header>

      <section className="console-grid">
        <ParameterPanel inputs={inputs} onChange={setInputs} />
        <EngineScene inputs={inputs} outputs={outputs} />
        <KpiCards outputs={outputs} />
      </section>

      <section className="analysis-grid">
        <TransientPlots data={transient} />
        <DesignReviewPanel inputs={inputs} outputs={outputs} />
      </section>

      <MissionComparison />
    </main>
  );
}
