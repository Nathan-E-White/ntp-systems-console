import type {EngineInputs, EngineOutputs} from '../types/EngineState';

interface DesignReviewPanelProps {
    inputs: EngineInputs;
    outputs: EngineOutputs;
}

export interface DesignReviewModel {
    risks: string[];
    recommendations: string[];
    casePosture: string;
}

export function buildDesignReviewModel(outputs: EngineOutputs): DesignReviewModel {
    return {
        risks: buildRisks(outputs),
        recommendations: buildRecommendations(outputs),
        casePosture: describeCasePosture(outputs),
    };
}

export function DesignReviewPanel({inputs, outputs}: Readonly<DesignReviewPanelProps>) {

    const {risks, recommendations, casePosture} = buildDesignReviewModel(outputs);

    return (
        <section className="panel review-panel">
            <div className="panel-heading">
                <p className="eyebrow">design review mode</p>
                <h2>Analyst Notes</h2>
            </div>
            <p>
                At <strong>{inputs.thermalPowerMw} MWth</strong> and <strong>{inputs.massFlowKgPerSec} kg/s</strong> hydrogen flow,
                this reduced-order case predicts <strong>{Math.round(outputs.thrustKn)} kN</strong> thrust and{' '}
                <strong>{Math.round(outputs.specificImpulseSec)} s</strong> specific impulse. {casePosture}
            </p>
            <div className="risk-list">
                {risks.map((risk) => <span key={risk}>{risk}</span>)}
            </div>
            <h3>Recommended follow-up analyses</h3>
            <ul>
                {recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
                ))}
            </ul>
        </section>
    );
}

function buildRisks(outputs: EngineOutputs): string[] {
    const risks = ['reduced-order model', 'not a flight/design tool'];
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
        return 'The case should be treated as a constrained thermal-margin scenario before any performance claims are emphasized.';
    }

    if (isIncompleteBasis(outputs)) {
        return 'The calculated operating point remains subject to explicit property, component-pressure, and transient-model limitations.';
    }

    if (outputs.pressureDropMpa > 1.4) {
        return 'The case is performance-positive, but pressure-drop and flow-path assumptions deserve review.';
    }

    return 'The case appears suitable for a first-pass design-review walkthrough, subject to higher-fidelity model handoff.';
}

function buildRecommendations(outputs: EngineOutputs): string[] {
    const recommendations = [
        'Compare transient outlet-temperature response against a ROCETS-style system trace.',
        'Correlate the synthetic axial/radial power profile with MCNP/OpenMC handoff documentation.',
    ];

    if (outputs.channelWallCriterionMarginK < 220) {
        recommendations.push('Route peak channel-wall temperature into a coupled conduction and qualified material-criterion follow-up case.');
    }

    if (outputs.pressureDropMpa > 1.4) {
        recommendations.push('Review propellant channel pressure-drop assumptions and candidate flow-area trades.');
    }

    if (isIncompleteBasis(outputs)) {
        recommendations.push('Close the property, whole-engine pressure-loss, and transient-model review flags before asserting a nominal posture.');
    }

    recommendations.push('Evaluate payload-side shielding trades against mass fraction and mission architecture.');

    return recommendations;
}
