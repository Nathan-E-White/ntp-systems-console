import {PowerProfilePoint} from "../types/PowerProfilePoint";

type PowerProfileProps = Readonly<{
    points: PowerProfilePoint[];
    title: string;
    valueBasis?: "relative" | "normalized";
}>;

export function PowerProfile({points, title, valueBasis = "relative"}: PowerProfileProps) {
    const maximumRelativePower = Math.max(...points.map((point) => point.relativePower));
    const postureLabel = valueBasis === "normalized" ? "normalized" : "relative";

    return (
        <article className="power-profile-card">
            <div className="summary-card-heading">
                <h3>{title}</h3>
                <span className="posture-chip nominal" title={`Power profile values are displayed on a ${postureLabel} basis.`}>
                    {postureLabel}
                </span>
            </div>
            <div className="power-profile-bars">
                {points.map((point) => {
                    const heightPercent = (point.relativePower / maximumRelativePower) * 100;

                    return (
                        <div className="power-profile-sample" key={point.id}
                             title={`${point.label}: ${point.relativePower.toFixed(2)} ${postureLabel} power`}>
                            <span style={{height: `${heightPercent}%`}}/>
                            <small>{point.label}</small>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}