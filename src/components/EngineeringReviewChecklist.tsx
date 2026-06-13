

export type ReviewPosture = 'nominal' | 'watch' | 'limit' | 'unknown';

export interface ReviewFinding {
    id: string;
    label: string;
    value: string;
    posture: ReviewPosture;
    note: string;
}

export interface ReviewSection {
    id: string;
    title: string;
    posture: ReviewPosture;
    summary: string;
    findings: ReviewFinding[];
}

export interface EngineeringReviewChecklistSummary {
    caseId: string;
    sourceLabel: string;
    sections: ReviewSection[];
    recommendedActions: string[];
}

export interface EngineeringReviewChecklistProps {
    review?: EngineeringReviewChecklistSummary;
}

const DEFAULT_ENGINEERING_REVIEW: EngineeringReviewChecklistSummary = {
    caseId: 'NTP_BASELINE_STARTUP',
    sourceLabel: 'Synthetic integrated MCNP-like / ROCETS-like / MOOSE-like fixture',
    sections: [
        {
            id: 'neutronics',
            title: 'Neutronics',
            posture: 'nominal',
            summary: 'Criticality estimate is inside the operating band with adequate synthetic shutdown margin.',
            findings: [
                {
                    id: 'keff-band',
                    label: 'k-eff estimate',
                    value: '1.00342 ± 0.00058',
                    posture: 'nominal',
                    note: 'Synthetic MCNP-like estimate remains close to the intended critical operating band.',
                },
                {
                    id: 'reactivity',
                    label: 'reactivity',
                    value: '+341 pcm',
                    posture: 'watch',
                    note: 'Positive reactivity is expected for this illustrative operating point, but should be tracked against drum worth.',
                },
                {
                    id: 'shutdown-margin',
                    label: 'shutdown margin',
                    value: '-1840 pcm',
                    posture: 'nominal',
                    note: 'Synthetic shutdown margin is comfortably negative for this fixture case.',
                },
            ],
        },
        {
            id: 'thermal-materials',
            title: 'Thermal / materials',
            posture: 'watch',
            summary: 'Peak fuel temperature remains below the selected material limit, but the minimum transient margin is the controlling concern.',
            findings: [
                {
                    id: 'peak-fuel-temperature',
                    label: 'peak fuel temperature',
                    value: '2925 K',
                    posture: 'nominal',
                    note: 'Synthetic peak fuel temperature is below the illustrative 3050 K limit.',
                },
                {
                    id: 'minimum-margin',
                    label: 'minimum thermal margin',
                    value: '+125 K',
                    posture: 'watch',
                    note: 'Margin is positive but small enough to justify startup-ramp and hot-channel sensitivity checks.',
                },
                {
                    id: 'hot-channel-factor',
                    label: 'hot-channel factor',
                    value: '1.19',
                    posture: 'watch',
                    note: 'Power peaking should be compared directly against the MOOSE-like stress and temperature locations.',
                },
            ],
        },
        {
            id: 'propulsion',
            title: 'Propulsion',
            posture: 'nominal',
            summary: 'The synthetic ROCETS-like operating point reaches the target thrust and specific impulse range for the demo case.',
            findings: [
                {
                    id: 'thrust',
                    label: 'thrust',
                    value: '112.4 kN',
                    posture: 'nominal',
                    note: 'Illustrative thrust is consistent with the selected reduced-order operating point.',
                },
                {
                    id: 'specific-impulse',
                    label: 'specific impulse',
                    value: '865.2 s',
                    posture: 'nominal',
                    note: 'Synthetic Isp is in a plausible NTP-style demo range for hot hydrogen expansion.',
                },
                {
                    id: 'mass-flow',
                    label: 'hydrogen mass flow',
                    value: '13.80 kg/s',
                    posture: 'nominal',
                    note: 'Mass flow supports the current thermal-power fixture but should be perturbed for margin studies.',
                },
            ],
        },
        {
            id: 'thermomechanics',
            title: 'Thermomechanics',
            posture: 'nominal',
            summary: 'The synthetic MOOSE-like finite-element response converged and remains below stress and strain watch criteria.',
            findings: [
                {
                    id: 'convergence',
                    label: 'FE convergence',
                    value: 'converged',
                    posture: 'nominal',
                    note: 'Fixture reports a converged nonlinear solve in seven iterations.',
                },
                {
                    id: 'stress',
                    label: 'max von Mises stress',
                    value: '184 MPa / 240 MPa',
                    posture: 'nominal',
                    note: 'Stress utilization is below the illustrative limit for this case.',
                },
                {
                    id: 'strain',
                    label: 'thermal strain',
                    value: '0.34% / 0.50%',
                    posture: 'nominal',
                    note: 'Thermal strain remains below the watch threshold in the synthetic fixture.',
                },
            ],
        },
        {
            id: 'transient',
            title: 'Transient behavior',
            posture: 'watch',
            summary: 'The startup ramp reaches its limiting thermal and stress conditions near the high-power settling region.',
            findings: [
                {
                    id: 'limiting-time',
                    label: 'limiting time',
                    value: '30.0 s',
                    posture: 'watch',
                    note: 'Minimum thermal margin and peak stress occur near the startup transition into full-power operation.',
                },
                {
                    id: 'stability-score',
                    label: 'stability score',
                    value: '91',
                    posture: 'nominal',
                    note: 'Synthetic reduced-order stability indicator remains acceptable but trends downward during ramp-up.',
                },
            ],
        },
    ],
    recommendedActions: [
        'Run a sensitivity sweep on startup ramp rate, drum angle schedule, and hydrogen mass flow.',
        'Compare neutronics power peaking against thermomechanical peak temperature and stress locations.',
        'Treat this as a public UI/parser fixture only; do not represent it as MCNP, ROCETS, or MOOSE calculation output.',
    ],
};

export function EngineeringReviewChecklist({review = DEFAULT_ENGINEERING_REVIEW}: Readonly<EngineeringReviewChecklistProps>) {
    const overallPosture = buildOverallPosture(review.sections);

    return (
        <section className="panel engineering-review-checklist">
            <div className="panel-heading">
                <p className="eyebrow">integrated systems review</p>
                <h2>Engineering Review Checklist</h2>
            </div>

            <p className="muted-copy">
                {review.sourceLabel}. Case <strong>{review.caseId}</strong> is reviewed as a synthetic public fixture,
                not as validated analysis output or a design-quality calculation.
            </p>

            <div className="analysis-source-grid">
                <SourceBadge label="Overall posture" value={formatPosture(overallPosture)} tone={overallPosture}/>
                <SourceBadge label="Review basis" value="fixture-derived" tone="nominal"/>
                <SourceBadge label="Use" value="portfolio / parser demo" tone="watch"/>
            </div>

            <div className="review-section-grid">
                {review.sections.map((section) => (
                    <ReviewSectionCard key={section.id} section={section}/>
                ))}
            </div>

            <div className="review-callout">
                <h3>Recommended integrated actions</h3>
                <ul>
                    {review.recommendedActions.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function ReviewSectionCard({section}: Readonly<{ section: ReviewSection }>) {
    return (
        <article className="analysis-summary-card review-section-card">
            <div className="summary-card-heading">
                <h3>{section.title}</h3>
                <span className={buildPostureClassName(section.posture)}>{formatPosture(section.posture)}</span>
            </div>

            <p className="muted-copy">{section.summary}</p>

            <div className="review-finding-list">
                {section.findings.map((finding) => (
                    <ReviewFindingRow finding={finding} key={finding.id}/>
                ))}
            </div>
        </article>
    );
}

function ReviewFindingRow({finding}: Readonly<{ finding: ReviewFinding }>) {
    return (
        <div className="review-finding-row">
            <div>
                <strong>{finding.label}</strong>
                <span>{finding.note}</span>
            </div>
            <div className="review-finding-value">
                <span className={buildPostureClassName(finding.posture)}>{formatPosture(finding.posture)}</span>
                <dd>{finding.value}</dd>
            </div>
        </div>
    );
}

function SourceBadge({label, tone, value}: Readonly<{ label: string; tone: ReviewPosture; value: string }>) {
    return (
        <div className="source-badge">
            <span>{label}</span>
            <strong className={buildPostureClassName(tone)}>{value}</strong>
        </div>
    );
}

function buildOverallPosture(sections: ReviewSection[]): ReviewPosture {
    if (sections.some((section) => section.posture === 'limit')) {
        return 'limit';
    }

    if (sections.some((section) => section.posture === 'watch')) {
        return 'watch';
    }

    if (sections.some((section) => section.posture === 'unknown')) {
        return 'unknown';
    }

    return 'nominal';
}

function buildPostureClassName(posture: ReviewPosture): string {
    if (posture === 'limit') {
        return 'posture-chip limit';
    }

    if (posture === 'watch' || posture === 'unknown') {
        return 'posture-chip watch';
    }

    return 'posture-chip nominal';
}

function formatPosture(posture: ReviewPosture): string {
    return posture.replaceAll('-', ' ');
}
