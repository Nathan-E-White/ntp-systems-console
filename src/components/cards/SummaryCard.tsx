import type {ReactNode} from "react";

import {PostureSpan} from "../PostureSpan";

export interface SummaryCardBaseProps<TPosture extends string> {
    children: ReactNode;
    posture?: TPosture;
    title: string;
}

export type SummaryCardProps<TPosture extends string> = SummaryCardBaseProps<TPosture>;

export function SummaryCard<TPosture extends string>({children, posture, title}: Readonly<SummaryCardProps<TPosture>>) {
    const displayedPosture = posture ?? 'unknown';
    return <article className="analysis-summary-card">
        <div className="summary-card-heading">
            <h3>{title}</h3>
            <PostureSpan posture={displayedPosture}/>
        </div>
        <dl>{children}</dl>
    </article>;
}