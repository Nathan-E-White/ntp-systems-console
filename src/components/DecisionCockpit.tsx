import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ENGINE_INPUT_PRESETS, type EngineCaseSelection, type EnginePresetId, useEngineStore} from '../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';

export interface OperatingCaseDecisionRecord {
    readonly controllingCondition: string;
    readonly result: string;
    readonly baselineDelta: string;
    readonly trace: string;
    readonly provenanceDelta: string;
    readonly reviewPosture: EngineOutputs['reviewPosture'];
    readonly evidenceApplicability: string;
    readonly guardrail: string;
    readonly rollbackPreset: EnginePresetId | null;
    readonly changedInputs: readonly string[];
    readonly affectedClaims: readonly string[];
}

export function buildOperatingCaseDecisionRecord({inputs, outputs, selection, baselinePreset}: Readonly<{inputs: EngineInputs; outputs: EngineOutputs; selection: EngineCaseSelection; baselinePreset: EnginePresetId}>): OperatingCaseDecisionRecord {
    const baselineOutputs = evaluateEngineCase(ENGINE_INPUT_PRESETS[baselinePreset]).outputs;
    const baselineInputs = ENGINE_INPUT_PRESETS[baselinePreset];
    const delta = outputs.channelWallCriterionMarginK - baselineOutputs.channelWallCriterionMarginK;
    const isCustom = selection === 'customWhatIf';
    const changedInputs = Object.entries(inputs)
        .filter(([key, value]) => value !== baselineInputs[key as keyof EngineInputs])
        .map(([key]) => key.replaceAll(/([a-z])([A-Z])/g, '$1 $2'));
    return {
        controllingCondition: 'Channel-wall criterion margin', result: `${outputs.channelWallCriterionMarginK.toFixed(0)} K`,
        baselineDelta: `${delta >= 0 ? '+' : ''}${delta.toFixed(0)} K versus ${baselinePreset}`,
        trace: `RC-TH-103: wall criterion − maximum calculated wall temperature at ${inputs.thermalPowerMw.toFixed(0)} MW thermal power`,
        provenanceDelta: isCustom ? 'Inputs changed in this browser session; fixture evidence was not rerun.' : 'Prepared input profile; static fixture provenance unchanged.',
        reviewPosture: outputs.reviewPosture,
        evidenceApplicability: 'Use fixture evidence as contextual support, not as a recalculated result.',
        guardrail: outputs.channelWallCriterionMarginK < 0 ? 'Do not advance this case without reducing load or increasing hydrogen flow.' : 'Treat this as a screening margin until property and pressure-model limits close.',
        rollbackPreset: isCustom ? baselinePreset : null,
        changedInputs,
        affectedClaims: isCustom ? ['Channel-wall criterion margin', 'Fixture evidence applicability'] : [],
    };
}

export function DecisionCockpit({inputs, outputs}: Readonly<{inputs: EngineInputs; outputs: EngineOutputs}>) {
    const selection = useEngineStore((state) => state.selectedPresetId);
    const baselinePreset = useEngineStore((state) => state.basePresetId);
    const loadPreset = useEngineStore((state) => state.loadPreset);
    const record = buildOperatingCaseDecisionRecord({inputs, outputs, selection, baselinePreset});
    return <section className="decision-cockpit" aria-label="Operating case decision record">
        <header><p className="eyebrow">decision record</p><h2>{record.controllingCondition}</h2></header>
        <div className="decision-cockpit__result"><strong>{record.result}</strong><span>{record.reviewPosture}</span></div>
        <dl>
            <div><dt>Review posture</dt><dd>{record.reviewPosture}</dd></div>
            <div><dt>Baseline delta</dt><dd>{record.baselineDelta}</dd></div><div><dt>Calculation trace</dt><dd>{record.trace}</dd></div>
            <div><dt>Provenance delta</dt><dd>{record.provenanceDelta}</dd></div><div><dt>Evidence applicability</dt><dd>{record.evidenceApplicability}</dd></div>
            <div><dt>Guardrail</dt><dd>{record.guardrail}</dd></div>
            {record.changedInputs.length ? <div><dt>Changed inputs</dt><dd>{record.changedInputs.join(', ')}</dd></div> : null}
            {record.affectedClaims.length ? <div><dt>Affected claims</dt><dd>{record.affectedClaims.join(', ')}</dd></div> : null}
        </dl>
        {record.rollbackPreset && <button onClick={() => loadPreset(record.rollbackPreset!)} type="button">Rollback to {record.rollbackPreset}</button>}
    </section>;
}
