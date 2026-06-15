import type {ReferenceControlledEngineOutputs} from "../types/EngineState";
import {
    STABILITY_LIMIT_SCORE,
    STABILITY_WATCH_SCORE,
    THERMAL_LIMIT_MARGIN_K,
    THERMAL_WATCH_MARGIN_K,
} from './reducedOrderModelConstants';

export function classifyStability(
    score: number,
    marginK: number,
    limitScore: number = STABILITY_LIMIT_SCORE,
    watchScore: number = STABILITY_WATCH_SCORE,
    limitMargin: number = THERMAL_LIMIT_MARGIN_K,
    watchMargin: number = THERMAL_WATCH_MARGIN_K
): ReferenceControlledEngineOutputs['reviewPosture'] {

    if (score < limitScore || marginK < limitMargin) return 'limit';

    if (score < watchScore || marginK < watchMargin) return 'watch';

    return 'nominal';
}
