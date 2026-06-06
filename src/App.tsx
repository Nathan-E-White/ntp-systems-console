import {DesignReviewPanel} from './components/DesignReviewPanel';
import {EngineeringReviewChecklist} from './components/EngineeringReviewChecklist';
import {EngineScene} from './components/EngineScene';
import {FocusedPanel} from './components/FocusedPanel';
import {ImportedAnalysisPanel} from './components/ImportedAnalysisPanel';
import {KpiCards} from './components/KpiCards';
import {ParameterPanel} from './components/ParameterPanel';
import {PowerProfilePanel} from './components/PowerProfilePanel';
import {RawOutputViewer} from './components/RawOutputViewer';
import {ReactorPhysicsPanel} from './components/ReactorPhysicsPanel';
import {ThermomechanicsPanel} from './components/ThermomechanicsPanel';
import {TransientPlots} from './components/TransientPlots';
import {WorkspaceFocusBar} from './components/WorkspaceFocusBar';
import {useEngineInputs, useEngineOutputs, useEngineTransient} from './state/EngineSelectors';

export function App() {
    const inputs = useEngineInputs();
    const outputs = useEngineOutputs();
    const transient = useEngineTransient();

    return (
        <main className="app-shell">
            <header className="hero-panel">
                <div>
                    <p className="eyebrow">Reduced-order portfolio demo · public educational model</p>
                    <h1>NTP Systems Console</h1>
                    <p className="hero-copy">
                        A NERVA/Rover-inspired interactive dashboard for nuclear thermal propulsion trade studies,
                        transient reasoning, synthetic analysis import, and design-review communication.
                    </p>
                </div>
                <WorkspaceFocusBar/>
            </header>

            <section className="console-grid">
                <ParameterPanel inputs={inputs}/>
                <FocusedPanel className="panel engine-panel" workspace="reactor">
                    <EngineScene inputs={inputs} outputs={outputs}/>
                </FocusedPanel>
                <FocusedPanel className="panel kpi-panel" workspace="propulsion">
                    <KpiCards outputs={outputs}/>
                </FocusedPanel>
            </section>

            <section className="analysis-grid">
                <FocusedPanel className="panel plot-panel" workspace="transients">
                    <TransientPlots data={transient}/>
                </FocusedPanel>
                <FocusedPanel className="panel review-panel" workspace="review">
                    <DesignReviewPanel inputs={inputs} outputs={outputs}/>
                </FocusedPanel>
            </section>

            <section className="analysis-grid">
                <ReactorPhysicsPanel/>
                <PowerProfilePanel/>
            </section>

            <section className="analysis-grid">
                <ThermomechanicsPanel/>
                <ImportedAnalysisPanel/>
            </section>

            <EngineeringReviewChecklist/>

            <RawOutputViewer/>


        </main>
    );
}
