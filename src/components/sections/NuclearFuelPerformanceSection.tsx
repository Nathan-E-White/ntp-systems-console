import type {BisonOutputParseResult} from '../../parser/bison/bison.output.parser';
import {DEFAULT_ANALYSIS_EVIDENCE, BISON_FUEL_PERFORMANCE_METADATA} from '../../demo/demoModel';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {EvidenceDatasetPanels, InvestigationThread, useGuidedInvestigation} from '../visualization';
import {useEngineeringDataWorkspace} from '../analysis';

const BISON_REVIEW_VALUES = [
    {id: 'peak-fuel', label: 'Peak fuel temperature', value: '2,966.5', unit: 'K'},
    {id: 'peak-restart', label: 'Peak restart temperature', value: '2,608.1', unit: 'K'},
    {id: 'coating', label: 'Coating margin', value: '0.68', unit: 'proxy'},
    {id: 'hydrogen', label: 'Hydrogen attack margin', value: '0.72', unit: 'proxy'},
    {id: 'burnup', label: 'Final burnup proxy', value: '0.06728', unit: ''},
    {id: 'damage', label: 'Final damage index', value: '6.58e-6', unit: ''},
] as const;

const MCNP_REVIEW_VALUES = [
    {label: 'k-effective trend', value: '1.01039 -> 0.99284'},
    {label: 'Peak xenon worth', value: '-742 pcm'},
    {label: '+100 s decay heat', value: '0.0158 normalized'},
] as const;

export function NuclearFuelPerformanceSection() {
    const workspace = useEngineeringDataWorkspace();
    const investigation = useGuidedInvestigation();
    const selectedComponent = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    const datasets = workspace.model.investigationEvidence.datasets;
    const bisonFuel = datasets.find((dataset) => dataset.id === 'bison-fuel-performance-history');
    const bisonAxial = datasets.find((dataset) => dataset.id === 'bison-axial-temperature-profile');
    const bisonHydrogen = datasets.find((dataset) => dataset.id === 'bison-hydrogen-profile');
    const mcnpBurnup = datasets.find((dataset) => dataset.id === 'mcnp-criticality-burnup');
    const parsedBison = DEFAULT_ANALYSIS_EVIDENCE.find((evidence) => evidence.id === 'bison-output')
        ?.artifact.parsed?.rawParsed as BisonOutputParseResult | undefined;

    return (
        <SectionShell
            eyebrow="nuclear fuel and core materials"
            title="Nuclear Fuel Performance"
            titleId="nuclear-fuel-performance-title"
            description="Fixture-backed BISON and MCNP burnup evidence for fuel, restart, and material-response discussion."
        >
            <InvestigationThread/>
            <section className="panel nuclear-posture-panel">
                <div className="nuclear-posture-panel__heading">
                    <div>
                        <p className="eyebrow">fuel-performance posture</p>
                        <h2>BISON and MCNP burnup handoff</h2>
                        <p>
                            Synthetic fuel-channel evidence is separated from reduced-order dashboard outputs. The app
                            demonstrates traceability and review discipline, not validated fuel qualification.
                        </p>
                    </div>
                    <div className="nuclear-posture-panel__badges" aria-label="Fuel-performance claim boundary">
                        <span>Executable-lite</span>
                        <span>Not validated</span>
                        <span>Fixture-backed</span>
                    </div>
                </div>
                <div className="nuclear-kpi-grid" aria-label="BISON fuel-performance review values">
                    {BISON_REVIEW_VALUES.map((item) => (
                        <div className="nuclear-kpi" key={item.id}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            {item.unit ? <small>{item.unit}</small> : null}
                        </div>
                    ))}
                </div>
            </section>

            <SectionGrid>
                <section className="panel nuclear-context-panel">
                    <p className="eyebrow">job-posting match</p>
                    <h2>Core fuel response is now first-class</h2>
                    <p>
                        This section centers fuel temperature, hydrogen exposure, burnup/restart memory, coating
                        margin, damage index, and cross-code handoff fields before propulsion-system details.
                    </p>
                    <dl className="nuclear-handoff-list">
                        <div><dt>MCNP burnup kit</dt><dd>{MCNP_REVIEW_VALUES.map((item) => `${item.label}: ${item.value}`).join('; ')}</dd></div>
                        <div><dt>BISON scaffold</dt><dd>{parsedBison?.metadata.inputFile ?? 'ntp.bison.i'} {'->'} {parsedBison?.finalReview.caseId ?? 'ntp-bison-fuel-performance-001'}</dd></div>
                        <div><dt>Selected focus</dt><dd>{selectedComponent.label} / {selectedComponent.discipline}</dd></div>
                    </dl>
                </section>
                <section className="panel nuclear-context-panel">
                    <p className="eyebrow">cross-code handoff</p>
                    <h2>Traceability Map</h2>
                    <div className="nuclear-source-grid">
                        {Object.entries(BISON_FUEL_PERFORMANCE_METADATA.sourceFiles).map(([key, value]) => (
                            <div key={key}>
                                <span>{humanizeKey(key)}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                    <p className="muted-copy">
                        MCNP material/tally maps and ROCETS histories remain metadata until a conservative power-map,
                        material calibration, mesh QA, and validation package exist.
                    </p>
                </section>
            </SectionGrid>

            {bisonFuel ? (
                <section className="panel nuclear-evidence-panel">
                    <p className="eyebrow">BISON transient response</p>
                    <h2>Fuel temperature, coating, and hydrogen margins</h2>
                    <EvidenceDatasetPanels dataset={bisonFuel}/>
                </section>
            ) : null}

            <SectionGrid>
                {mcnpBurnup ? (
                    <section className="panel nuclear-evidence-panel">
                        <p className="eyebrow">MCNP burnup / restart memory</p>
                        <h2>Criticality Trend and Decay-Heat Proxy</h2>
                        <EvidenceDatasetPanels dataset={mcnpBurnup}/>
                    </section>
                ) : null}
                {bisonAxial ? (
                    <section className="panel nuclear-evidence-panel">
                        <p className="eyebrow">fuel-channel profile</p>
                        <h2>Final Axial Temperature</h2>
                        <EvidenceDatasetPanels dataset={bisonAxial}/>
                    </section>
                ) : null}
            </SectionGrid>

            {bisonHydrogen ? (
                <section className="panel nuclear-evidence-panel">
                    <p className="eyebrow">hot-wall hydrogen exposure</p>
                    <h2>Hydrogen Inventory and Damage Proxy</h2>
                    <EvidenceDatasetPanels dataset={bisonHydrogen}/>
                </section>
            ) : null}
        </SectionShell>
    );
}

function humanizeKey(value: string): string {
    return value
        .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll(/[_-]+/g, ' ')
        .replace(/^./, (first) => first.toUpperCase());
}
