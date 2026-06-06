import type {ReactNode} from "react";

import {buildPostureClassName} from "./BuildPostureClassName";
import {formatPosture} from "./FormatPosture";
import {PostureSpan} from "./PostureSpan";

export interface SummaryCardBaseProps<TPosture extends string> {
    children: ReactNode;
    posture: TPosture;
    title: string;
}

export type SummaryCardProps<TPosture extends string> = SummaryCardBaseProps<TPosture>;

export function SummaryCard<TPosture extends string>({children, posture, title}: Readonly<SummaryCardProps<TPosture>>) {


    return <article className="analysis-summary-card">
        <div className="summary-card-heading">
            <h3>{title}</h3>
            <PostureSpan posture={posture} />
            {/*<span className={buildPostureClassName(posture)}>{formatPosture(posture)}</span>*/}
        </div>
        <dl>{children}</dl>
    </article>;
}