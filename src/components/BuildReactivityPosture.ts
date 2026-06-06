import {ReactorPhysicsSummary} from "../types/ReactorPhysicsSummary";
import {ReactorPhysicsPosture} from "../types/ReactorPhysicsPosture";

export function buildReactivityPosture(summary: ReactorPhysicsSummary): ReactorPhysicsPosture | 'nominal' {
    if (summary.shutdownMarginPcm > -500) {
        return 'shutdown-margin-concern';
    }

    if (summary.reactivityPcm > 700) {
        return 'excess-reactivity';
    }

    if (summary.keff < 0.995) {
        return 'subcritical';
    }

    return 'nominal';
}