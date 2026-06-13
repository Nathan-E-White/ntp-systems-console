import {type NumericOutputKey, useOutputWorkspace, useParameterWorkspace} from './analysis';
import {ENGINE_INPUT_PRESETS, useEngineStore} from '../state/EngineStore';
import type {EngineInputs} from '../types/EngineState';
import {
    collectInputDependencies,
    findCalculationNode,
    type CalculationNode,
} from '../physics/calculationTrace';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {generateTransientEvaluation} from '../physics/transientModel';
import {getReferenceRecord} from '../physics/referenceBasis';

export function CalculationBasisInspector({inputs}: Readonly<{inputs: EngineInputs}>) {
    const outputs = useOutputWorkspace();
    const parameters = useParameterWorkspace();
    const selection = useEngineStore((state) => state.selectedPresetId);
    const basePresetId = useEngineStore((state) => state.basePresetId);
    const selectedTransientTimeSec = useEngineStore((state) => state.selectedTransientTimeSec);
    const evaluation = evaluateEngineCase(inputs);
    const selectedOutputKey = outputs.state.selectedOutputKey ?? 'channelWallCriterionMarginK';
    const selectedDefinition = outputs.model.definitions.find((definition) => definition.key === selectedOutputKey);
    const selectedNode = findCalculationNode(evaluation.trace, selectedOutputKey)
        ?? findCalculationNode(evaluation.trace, 'channelWallCriterionMarginK')!;
    const dependencyInputs = collectInputDependencies(evaluation.trace, selectedNode.id);
    const upstreamNodes = collectUpstreamNodes(evaluation.trace.nodes, selectedNode);
    const baseInputs = ENGINE_INPUT_PRESETS[basePresetId];
    const baseEvaluation = evaluateEngineCase(baseInputs);
    const baseNode = findCalculationNode(baseEvaluation.trace, selectedOutputKey);
    const transientEvaluation = generateTransientEvaluation(inputs).reduce((nearest, candidate) =>
        Math.abs(candidate.timeSec - selectedTransientTimeSec) < Math.abs(nearest.timeSec - selectedTransientTimeSec)
            ? candidate
            : nearest,
    );
    const reference = selectedNode.referenceId ? getReferenceRecord(selectedNode.referenceId) : undefined;

    return (
        <section className="panel calculation-basis" aria-labelledby="calculation-basis-title">
            <header className="calculation-basis__header">
                <div>
                    <p className="eyebrow">reduced-order model transparency</p>
                    <h2 id="calculation-basis-title">Calculation Basis</h2>
                    <p>Select a KPI to trace its current value from operator inputs through intermediate equations.</p>
                </div>
                <label>
                    <span>Displayed output</span>
                    <select
                        aria-label="Displayed calculation output"
                        value={selectedOutputKey}
                        onChange={(event) => outputs.selectOutput(event.target.value as NumericOutputKey)}
                    >
                        {outputs.model.definitions.map((definition) => (
                            <option key={definition.key} value={definition.key}>{definition.label}</option>
                        ))}
                    </select>
                </label>
            </header>

            <div className="calculation-basis__summary">
                <div>
                    <span>Equation</span>
                    <strong>{selectedNode.equationId}</strong>
                </div>
                <div>
                    <span>Classification</span>
                    <strong>{formatClassification(selectedNode.classification)}</strong>
                </div>
                <div>
                    <span>Current result</span>
                    <strong>{formatResult(selectedNode.finalValue, selectedNode.unit, selectedDefinition?.precision)}</strong>
                </div>
                <div>
                    <span>Direct and upstream inputs</span>
                    <strong>{dependencyInputs.map(formatInputKey).join(', ') || 'Derived only'}</strong>
                </div>
            </div>

            <div className="calculation-basis__grid">
                <article className="calculation-equation-card">
                    <div className="calculation-equation-card__heading">
                        <div>
                            <p className="eyebrow">{selectedNode.equationId}</p>
                            <h3>{selectedNode.label}</h3>
                        </div>
                        <a href={`/docs/reduced-order-model-basis.html#${selectedNode.id}`}>Open model-basis reference</a>
                    </div>
                    <EquationMath nodeId={selectedNode.id}/>
                    <p className="calculation-substitution">{selectedNode.substitution}</p>
                    <dl className="calculation-symbols">
                        {selectedNode.terms.map((candidate) => (
                            <div key={`${selectedNode.id}-${candidate.symbol}`}>
                                <dt>{candidate.symbol}</dt>
                                <dd>{candidate.label}: <strong>{formatResult(candidate.value, candidate.unit)}</strong></dd>
                            </div>
                        ))}
                    </dl>
                    <div className="calculation-limit">
                        <strong>Model boundary</strong>
                        <p>{selectedNode.limitation}</p>
                    </div>
                    <div className="calculation-source">
                        <strong>Controlled source</strong>
                        {reference ? (
                            <p>
                                <a href={reference.url} target="_blank" rel="noreferrer">
                                    {reference.reportNumber ?? reference.title}
                                </a>
                                {' '}· {selectedNode.sourceLocator ?? reference.locator}
                            </p>
                        ) : <p>User-selected or derived basis; no external numerical authority is asserted.</p>}
                        {selectedNode.validity ? <p><strong>Applicability:</strong> {selectedNode.validity}</p> : null}
                    </div>
                </article>

                <aside className="calculation-basis__detail">
                    <section>
                        <p className="eyebrow">active assumptions and constraints</p>
                        <ul>
                            {selectedNode.assumptions.map((item) => (
                                <li className={item.active ? 'active' : ''} key={item.label}>
                                    <strong>{item.label}</strong>
                                    <span>{item.detail}</span>
                                </li>
                            ))}
                            {selectedNode.assumptions.length === 0 ? <li>No additional adjustment is applied at this step.</li> : null}
                        </ul>
                        {selectedNode.diagnostics?.length ? (
                            <>
                                <p className="eyebrow">range and completeness diagnostics</p>
                                <ul>
                                    {selectedNode.diagnostics.slice(0, 8).map((item) => (
                                        <li className={item.severity} key={item.id}>{item.message}</li>
                                    ))}
                                </ul>
                            </>
                        ) : null}
                    </section>
                    <section>
                        <p className="eyebrow">upstream calculation chain</p>
                        <ol>
                            {upstreamNodes.map((node) => (
                                <li key={node.id}>
                                    <button type="button" onClick={() => outputs.selectOutput(node.outputKey as NumericOutputKey)}>
                                        <span>{node.equationId}</span>
                                        <strong>{node.label}</strong>
                                        <small>{formatResult(node.finalValue, node.unit)}</small>
                                    </button>
                                </li>
                            ))}
                            <li className="calculation-chain__selected">
                                <span>{selectedNode.equationId}</span>
                                <strong>{selectedNode.label}</strong>
                            </li>
                        </ol>
                    </section>
                </aside>
            </div>

            <div className="calculation-basis__comparisons">
                <section>
                    <p className="eyebrow">{selection === 'customWhatIf' ? 'custom what-if comparison' : 'prepared case basis'}</p>
                    <h3>{selection === 'customWhatIf' ? `Compared with ${formatPreset(basePresetId)}` : formatPreset(basePresetId)}</h3>
                    <p>
                        {baseNode
                            ? `${selectedNode.label}: ${formatResult(baseNode.finalValue, baseNode.unit)} → ${formatResult(selectedNode.finalValue, selectedNode.unit)}`
                            : 'No prepared-case comparison is available.'}
                    </p>
                    <p className="what-if-notice">
                        {selection === 'customWhatIf'
                            ? `${parameters.state.dirtyKeys.length || 1} operator parameter(s) changed. MCNP-, MOOSE-, and ROCETS-like fixtures were not rerun.`
                            : 'Prepared inputs feed only the reduced-order evaluator; synthetic fixture evidence remains immutable.'}
                    </p>
                </section>
                <section>
                    <p className="eyebrow">illustrative transient point</p>
                    <h3>{transientEvaluation.timeSec} s · ramp {Math.round(transientEvaluation.rampFraction * 100)}%</h3>
                    <p>
                        Generated power {transientEvaluation.generatedInputs.thermalPowerMw.toFixed(1)} MWth;
                        {' '}drum angle {transientEvaluation.generatedInputs.controlDrumAngleDeg.toFixed(1)} deg;
                        {' '}{selectedNode.label.toLowerCase()} {
                            formatResult(
                                findCalculationNode(transientEvaluation.evaluation.trace, selectedOutputKey)?.finalValue ?? 'n/a',
                                selectedNode.unit,
                            )
                        }.
                    </p>
                    <p className="calculation-basis__boundary">
                        This is a deterministic 41-point presentation trajectory, not a time-integrated engine solver.
                    </p>
                </section>
            </div>
        </section>
    );
}
function collectUpstreamNodes(nodes: readonly CalculationNode[], root: CalculationNode): CalculationNode[] {
    const ordered: CalculationNode[] = [];
    const visited = new Set<string>();
    const visit = (node: CalculationNode) => {
        node.dependencies.forEach((dependencyId) => {
            const dependency = nodes.find((candidate) => candidate.id === dependencyId);
            if (!dependency || visited.has(dependency.id)) return;
            visit(dependency);
            visited.add(dependency.id);
            ordered.push(dependency);
        });
    };
    visit(root);
    return ordered;
}

function EquationMath({nodeId}: Readonly<{nodeId: CalculationNode['id']}>) {
    const equations: Record<CalculationNode['id'], string> = {
        'outlet-temperature': '<math display="block" aria-label="Enthalpy energy balance"><mi>η</mi><mi>P</mi><mo>=</mo><mover><mi>m</mi><mo>˙</mo></mover><mo>[</mo><mi>h</mi><mo>(</mo><msub><mi>T</mi><mi>out</mi></msub><mo>)</mo><mo>−</mo><mi>h</mi><mo>(</mo><msub><mi>T</mi><mi>in</mi></msub><mo>)</mo><mo>]</mo></math>',
        'exhaust-velocity': '<math display="block" aria-label="Nozzle exit velocity"><msub><mi>V</mi><mi>e</mi></msub><mo>=</mo><msub><mi>M</mi><mi>e</mi></msub><msqrt><mi>γ</mi><mi>R</mi><msub><mi>T</mi><mi>e</mi></msub></msqrt><msqrt><msub><mi>η</mi><mi>n</mi></msub></msqrt></math>',
        'specific-impulse': '<math display="block" aria-label="Specific impulse"><msub><mi>I</mi><mi>sp</mi></msub><mo>=</mo><mfrac><mi>F</mi><mrow><mover><mi>m</mi><mo>˙</mo></mover><msub><mi>g</mi><mn>0</mn></msub></mrow></mfrac></math>',
        thrust: '<math display="block" aria-label="Generalized thrust"><mi>F</mi><mo>=</mo><mover><mi>m</mi><mo>˙</mo></mover><msub><mi>V</mi><mi>e</mi></msub><mo>+</mo><mo>(</mo><msub><mi>p</mi><mi>e</mi></msub><mo>−</mo><msub><mi>p</mi><mi>a</mi></msub><mo>)</mo><msub><mi>A</mi><mi>e</mi></msub></math>',
        'fuel-temperature': '<math display="block" aria-label="Channel wall heat transfer"><mi>q</mi><mo>=</mo><msub><mi>h</mi><mi>c</mi></msub><msub><mi>A</mi><mi>s</mi></msub><mo>(</mo><msub><mi>T</mi><mi>wall</mi></msub><mo>−</mo><msub><mi>T</mi><mi>bulk</mi></msub><mo>)</mo></math>',
        'thermal-margin': '<math display="block" aria-label="Channel wall criterion margin"><msub><mi>M</mi><mi>wall</mi></msub><mo>=</mo><msub><mi>T</mi><mi>criterion</mi></msub><mo>−</mo><mi>max</mi><mo>(</mo><msub><mi>T</mi><mi>wall</mi></msub><mo>)</mo></math>',
        'pressure-drop': '<math display="block" aria-label="Channel pressure drop"><mi>Δ</mi><mi>p</mi><mo>=</mo><mo>∑</mo><mo>(</mo><mi>Δ</mi><msub><mi>p</mi><mi>f</mi></msub><mo>+</mo><mi>Δ</mi><msub><mi>p</mi><mi>a</mi></msub><mo>+</mo><mi>Δ</mi><msub><mi>p</mi><mi>K</mi></msub><mo>)</mo></math>',
        'stability-score': '<math display="block" aria-label="Model basis completeness"><msub><mi>C</mi><mi>basis</mi></msub><mo>=</mo><mi>classify</mi><mo>(</mo><mi>missing</mi><mo>,</mo><mi>range</mi><mo>,</mo><mi>closures</mi><mo>)</mo></math>',
        'stability-posture': '<math display="block" aria-label="Review posture"><mi>posture</mi><mo>=</mo><mi>review</mi><mo>(</mo><msub><mi>M</mi><mi>wall</mi></msub><mo>,</mo><msub><mi>C</mi><mi>basis</mi></msub><mo>)</mo></math>',
    };
    return <div className="calculation-equation" dangerouslySetInnerHTML={{__html: equations[nodeId]}}/>;
}

function formatResult(value: number | string, unit: string, precision = 3): string {
    const formatted = typeof value === 'number'
        ? value.toLocaleString(undefined, {maximumFractionDigits: precision})
        : value;
    return unit ? `${formatted} ${unit}` : String(formatted);
}

function formatClassification(value: CalculationNode['classification']): string {
    return value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

function formatInputKey(key: keyof EngineInputs): string {
    const labels: Partial<Record<keyof EngineInputs, string>> = {
        thermalPowerMw: 'thermal power',
        massFlowKgPerSec: 'mass flow',
        inletTemperatureK: 'inlet temperature',
        chamberPressureMpa: 'chamber pressure',
        nozzleExpansionRatio: 'expansion ratio',
        controlDrumAngleDeg: 'drum angle',
        fuelTemperatureLimitK: 'historical comparison temperature',
        channelWallCriterionK: 'wall criterion',
        thermalCouplingEfficiency: 'thermal coupling efficiency',
        channelLengthM: 'channel length',
        channelHydraulicDiameterM: 'hydraulic diameter',
        channelCount: 'channel count',
        nozzleEfficiency: 'nozzle factor',
        ambientPressureKpa: 'ambient pressure',
        missionMode: 'operating phase',
    };
    return labels[key] ?? key;
}

function formatPreset(value: keyof typeof ENGINE_INPUT_PRESETS): string {
    if (value === 'baselineStartup') return 'Pewee-Inspired Benchmark';
    if (value === 'legacyDemo') return 'Legacy Demo Model';
    return 'Thermal Margin Investigation';
}
