import {ReactorPhysicsPosture} from "../types/ReactorPhysicsPosture";
import {buildPostureClassName} from "./BuildPostureClassName";

export function SourceBadge({label, tone = 'critical-band', value}: Readonly<{
    label: string;
    tone?: ReactorPhysicsPosture;
    value: string
}>) {
    return (
        <div className="source-badge">
            <span>{label}</span>
            <strong className={buildPostureClassName(tone)}>{value}</strong>
        </div>
    );
}

