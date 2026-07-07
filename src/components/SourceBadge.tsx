import {PostureSpan} from './PostureSpan';

export interface SourceBadgeProps<TTone extends string> {
    label: string;
    tone?: TTone;
    value: string;
}

export function SourceBadge<TTone extends string>({label, tone, value}: Readonly<SourceBadgeProps<TTone>>) {
    const displayedTone = tone ?? 'unknown';

    return (
        <div className="source-badge">
            <span>{label}</span>
            <strong>
                <PostureSpan posture={displayedTone}/>
                <span className="source-badge-value">{value}</span>
            </strong>
        </div>
    );
}

