import {buildPostureClassName} from './BuildPostureClassName';
import {formatPosture} from './FormatPosture';

export interface PostureSpanProps<TPosture extends string> {
    posture: TPosture;
}

export function PostureSpan<TPosture extends string>({posture}: Readonly<PostureSpanProps<TPosture>>) {
    return <span className={buildPostureClassName(posture)}>{formatPosture(posture)}</span>;
}