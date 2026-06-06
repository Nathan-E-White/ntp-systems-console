import type {EngineOutputs} from "../types/EngineState";

export function classifyStability(
    score: number,
    marginK: number,
    limitScore: number = 58,
    watchScore: number = 78,
    limitMargin: number = 80,
    watchMargin: number = 220
): EngineOutputs['stabilityStatus'] {

    if (score < limitScore || marginK < limitMargin) return 'limit';

    if (score < watchScore || marginK < watchMargin) return 'watch';

    return 'nominal';
}