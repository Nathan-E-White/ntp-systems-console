import type {EngineInputs, EngineOutputs} from '../types/EngineState';

interface DesignReviewPanelProps {
    inputs: EngineInputs;
    outputs: EngineOutputs;
}

export interface DesignReviewModel {
    risks: string[];
    casePosture: string;
}

export function buildDesignReviewModel(outputs: EngineOutputs): DesignReviewModel {
    return {
        risks: buildRisks(outputs),
        casePosture: describeCasePosture(outputs),
    };
}

export function DesignReviewPanel({inputs, outputs}: Readonly<DesignReviewPanelProps>) {
    const {risks, casePosture} = buildDesignReviewModel(outputs);
    const thermalPower = inputs.thermalPowerMw.toLocaleString(undefined, {
        maximumFractionDigits: 0,
    });
    const massFlow = inputs.massFlowKgPerSec.toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });

    return (
        <section className="panel review-panel">
            <div className="panel-heading">
                <p className="eyebrow">calculated case</p>
                <h2>Case Readout</h2>
            </div>
            <p>
                At <strong>{thermalPower} MWth</strong> and <strong>{massFlow} kg/s</strong> hydrogen flow,
                the case produces <strong>{Math.round(outputs.thrustKn)} kN</strong> thrust and{' '}
                <strong>{Math.round(outputs.specificImpulseSec)} s</strong> Isp. {casePosture}
            </p>
            <div className="risk-list">
                {risks.map((risk) => <span key={risk}>{risk}</span>)}
            </div>
        </section>
    );
}

function buildRisks(outputs: EngineOutputs): string[] {
    const risks = ['screening model'];
    if (outputs.channelWallCriterionMarginK < 220) risks.push('channel wall criterion watch');
    if (outputs.pressureDropMpa > 1.4) risks.push('pressure-drop watch');
    if (isIncompleteBasis(outputs)) risks.push('model-basis closure required');
    return risks;
}

function isIncompleteBasis(outputs: EngineOutputs): boolean {
    return outputs.reviewPosture === 'watch' || outputs.reviewPosture === 'limit';
}

function describeCasePosture(outputs: EngineOutputs): string {
    if (outputs.channelWallCriterionMarginK < 120) {
        return 'Thermal margin controls; defer performance claims.';
    }

    if (isIncompleteBasis(outputs)) {
        return 'Property, component-pressure, and transient-model limits control.';
    }

    if (outputs.pressureDropMpa > 1.4) {
        return 'Performance-positive; pressure-drop basis remains open.';
    }

    return 'First-pass review ready; higher-fidelity handoff pending.';
}
