import {PowerProfilePoint} from "../types/PowerProfilePoint";

export function PowerProfile({points, title}: Readonly<{ points: PowerProfilePoint[]; title: string }>) {
    const maximumRelativePower = Math.max(...points.map((point) => point.relativePower));

    return (
        <article className="power-profile-card">
            <div className="summary-card-heading">
                <h3>{title}</h3>
                <span className="posture-chip nominal">normalized</span>
            </div>
            <div className="power-profile-bars">
                {points.map((point) => {
                    const heightPercent = (point.relativePower / maximumRelativePower) * 100;

                    return (
                        <div className="power-profile-sample" key={point.id}
                             title={`${point.label}: ${point.relativePower.toFixed(2)}`}>
                            <span style={{height: `${heightPercent}%`}}/>
                            <small>{point.label}</small>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}