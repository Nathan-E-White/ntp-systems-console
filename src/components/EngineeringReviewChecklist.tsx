

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
            summary: 'Neutronics estimate is in band with adequate synthetic shutdown margin.',
            findings: [
                {
                    id: 'keff-band',
                    label: 'k-eff estimate',
                    value: '1.00342 ± 0.00058',
                    posture: 'nominal',
                    note: 'MCNP-like estimate remains near the intended critical band.',
                },
                {
                    id: 'reactivity',
                    label: 'reactivity',
                    value: '+341 pcm',
                    posture: 'watch',
                    note: 'Positive reactivity is expected; track against drum worth.',
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
            summary: 'Peak fuel temperature stays below the material limit; minimum transient margin is controlling.',
            findings: [
                {
                    id: 'peak-fuel-temperature',
                    label: 'peak fuel temperature',
                    value: '2925 K',
                    posture: 'nominal',
                    note: 'Peak fuel is below the illustrative 3050 K limit.',
                },
                {
                    id: 'minimum-margin',
                    label: 'minimum thermal margin',
                    value: '+125 K',
                    posture: 'watch',
                    note: 'Margin is positive but small; use startup-ramp and hot-channel sensitivity checks.',
                },
                {
                    id: 'hot-channel-factor',
                    label: 'hot-channel factor',
                    value: '1.19',
                    posture: 'watch',
                    note: 'Compare power peaking directly against MOOSE-like stress and temperature locations.',
                },
            ],
        },
        {
            id: 'propulsion',
            title: 'Propulsion',
            posture: 'nominal',
            summary: 'ROCETS-like point reaches target thrust and Isp for this demo.',
            findings: [
                {
                    id: 'thrust',
                    label: 'thrust',
                    value: '112.4 kN',
                    posture: 'nominal',
                    note: 'Thrust aligns with selected reduced-order point.',
                },
                {
                    id: 'specific-impulse',
                    label: 'specific impulse',
                    value: '865.2 s',
                    posture: 'nominal',
                    note: 'Synthetic Isp is plausible for hot hydrogen expansion.',
                },
                {
                    id: 'mass-flow',
                    label: 'hydrogen mass flow',
                    value: '13.80 kg/s',
                    posture: 'nominal',
                    note: 'Mass flow supports current thermal-power fixture; sweep for margin.',
                },
            ],
        },
        {
            id: 'thermomechanics',
            title: 'Thermomechanics',
            posture: 'nominal',
            summary: 'Synthetic MOOSE-like FE response is converged and below watch stress/strain criteria.',
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
                    note: 'Stress utilization stays below the fixture limit.',
                },
                {
                    id: 'strain',
                    label: 'thermal strain',
                    value: '0.34% / 0.50%',
                    posture: 'nominal',
                    note: 'Thermal strain stays below the watch threshold.',
                },
            ],
        },
        {
            id: 'transient',
            title: 'Transient behavior',
            posture: 'watch',
            summary: 'Startup ramp reaches peak thermal and stress conditions near high-power settling.',
            findings: [
                {
                    id: 'limiting-time',
                    label: 'limiting time',
                    value: '30.0 s',
                    posture: 'watch',
                    note: 'Minimum thermal margin and peak stress occur near startup transition to full power.',
                },
                {
                    id: 'stability-score',
                    label: 'stability score',
                    value: '91',
                    posture: 'nominal',
                    note: 'Synthetic stability indicator is acceptable but declines during ramp-up.',
                },
            ],
        },
    ],
    recommendedActions: [
        'Sensitivity sweep on startup ramp, drum schedule, and hydrogen flow.',
        'Compare neutronics peaking with thermomechanical heat and stress locations.',
        'Fixture-only context only; not production MCNP/ROCETS/MOOSE output.',
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
                {review.sourceLabel}. Case <strong>{review.caseId}</strong> is synthetic fixture review only, not validated analysis.
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
