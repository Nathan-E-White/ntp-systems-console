

import {useMemo, useState} from 'react';

export type RawOutputKind = 'mcnp' | 'rocets' | 'moose' | 'json';

export interface RawOutputDocument {
    id: RawOutputKind;
    label: string;
    sourceLabel: string;
    content: string;
    language: 'text' | 'json';
}

export interface RawOutputViewerProps {
    documents?: RawOutputDocument[];
    initialDocumentId?: RawOutputKind;
}

const DEFAULT_DOCUMENTS: RawOutputDocument[] = [
    {
        id: 'mcnp',
        label: 'MCNP-like',
        sourceLabel: 'Synthetic neutronics fixture',
        language: 'text',
        content: `======================================================================
SYNTHETIC MCNP-LIKE OUTPUT -- PUBLIC PORTFOLIO FIXTURE
Case: NTP_BASELINE_STARTUP
This file is illustrative mock data for UI/parser development only.
It is not produced by MCNP and is not a validated reactor calculation.
======================================================================

problem summary
    geometry class                  generic solid-core ntp demonstrator
    fuel form                       abstract fuel-element lattice
    moderator/coolant               flowing hydrogen, reduced-order state
    control element                 external rotating absorber drums
    particle histories              2500000
    random seed                     19073421

kcode cycle summary
    inactive cycles                 50
    active cycles                   250
    neutrons per cycle              10000

final estimated combined collision/absorption/track-length results
    keff                            1.00342
    estimated standard deviation    0.00058
    95 pct confidence interval      1.00228 to 1.00456

reactivity indicators
    reactivity pcm                  +341
    one sigma pcm                   58
    estimated shutdown margin pcm   -1840
    drum angle deg                  42.0
    estimated drum worth pcm        2360
    temperature feedback pcm        -410

neutron balance
    leakage fraction                0.0712
    fuel absorption fraction         0.6814
    moderator/coolant absorption     0.0187
    reflector absorption             0.0421
    structural absorption            0.0318
    non-fission capture fraction     0.1548

normalized power distribution
    axial zone      relative power
        01             0.61
        02             0.78
        03             0.94
        04             1.08
        05             1.16
        06             1.19
        07             1.13
        08             0.98
        09             0.82
        10             0.63

    radial ring      relative power
        01             1.12
        02             1.08
        03             1.02
        04             0.96
        05             0.87

engineering flags
    criticality posture             critical operating band
    peaking concern                 nominal
    shutdown margin concern         nominal
    recommended review              coupled thermal margin check`,
    },
    {
        id: 'rocets',
        label: 'ROCETS-like',
        sourceLabel: 'Synthetic propulsion fixture',
        language: 'text',
        content: `======================================================================
SYNTHETIC ROCETS-LIKE OUTPUT -- PUBLIC PORTFOLIO FIXTURE
Case: NTP_BASELINE_STARTUP
This file is illustrative mock data for UI/parser development only.
It is not produced by ROCETS and is not a validated propulsion model.
======================================================================

engine operating point
    thermal power MW                515.0
    chamber pressure MPa            4.15
    hydrogen mass flow kg/s         13.80
    core inlet temperature K         94
    core outlet temperature K        2760
    estimated peak fuel temp K       2925
    fuel temperature limit K         3050
    thermal margin K                 125

propulsion performance
    thrust kN                       112.4
    specific impulse s              865.2
    nozzle expansion ratio           140.0
    nozzle efficiency                0.942
    pressure ratio Pc/Pe             512.0

transient summary
    startup ramp duration s          38.0
    max outlet temperature K         2788
    min thermal margin K             92
    max thrust kN                    113.1
    stability score                  91

time history
    time_s, power_MW, outlet_K, peak_fuel_K, margin_K, thrust_kN, stability
    0.0,    25.0,    620,      710,       2340,     4.8,     99
    5.0,    96.0,    1120,     1285,      1765,     21.4,    98
    10.0,   185.0,   1580,     1760,      1290,     43.6,    97
    15.0,   294.0,   2025,     2230,      820,      67.9,    95
    20.0,   392.0,   2385,     2605,      445,      89.8,    94
    25.0,   462.0,   2620,     2840,      210,      104.5,   93
    30.0,   505.0,   2740,     2948,      102,      111.0,   92
    35.0,   515.0,   2760,     2925,      125,      112.4,   91
    40.0,   515.0,   2760,     2918,      132,      112.4,   91`,
    },
    {
        id: 'moose',
        label: 'MOOSE-like',
        sourceLabel: 'Synthetic thermomechanics fixture',
        language: 'text',
        content: `======================================================================
SYNTHETIC MOOSE-LIKE OUTPUT -- PUBLIC PORTFOLIO FIXTURE
Case: NTP_BASELINE_STARTUP
This file is illustrative mock data for UI/parser development only.
It is not produced by MOOSE and is not a validated FE calculation.
======================================================================

Executioner Summary
    solve_type                       NEWTON
    time_integrator                  implicit-euler
    nonlinear_converged              true
    nonlinear_iterations             7
    linear_iterations                124
    mesh_elements                    18432
    mesh_dimension                   2D-RZ fuel element slice

Postprocessors
    peak_fuel_temperature_K          2925.0
    peak_web_temperature_K           2810.0
    max_von_mises_stress_MPa         184.0
    thermal_strain_percent           0.34
    minimum_thermal_margin_K         125.0
    hot_channel_factor               1.19
    peak_stress_axial_station        z/L = 0.62
    peak_temperature_region          inner coolant-channel ligament

Material Limits
    fuel_temperature_limit_K         3050.0
    stress_limit_MPa                 240.0
    strain_watch_percent             0.50

Time History
    time_s, peak_fuel_K, max_stress_MPa, thermal_strain_percent, min_margin_K, converged
    0.0,    710.0,     24.0,    0.03,  2340.0, true
    5.0,    1285.0,    52.0,    0.08,  1765.0, true
    10.0,   1760.0,    88.0,    0.14,  1290.0, true
    15.0,   2230.0,    126.0,   0.21,  820.0,  true
    20.0,   2605.0,    158.0,   0.28,  445.0,  true
    25.0,   2840.0,    178.0,   0.32,  210.0,  true
    30.0,   2948.0,    189.0,   0.35,  102.0,  true
    35.0,   2925.0,    184.0,   0.34,  125.0,  true

Engineering Flags
    thermal_mechanical_posture       nominal
    convergence_posture              nominal
    recommended_review               compare hot-channel factor against MCNP axial peaking`,
    },
    {
        id: 'json',
        label: 'Parsed JSON',
        sourceLabel: 'Normalized imported-analysis object',
        language: 'json',
        content: JSON.stringify(
            {
                caseId: 'NTP_BASELINE_STARTUP',
                source: {
                    neutronics: 'Synthetic MCNP-like fixture',
                    propulsion: 'Synthetic ROCETS-like fixture',
                    thermomechanics: 'Synthetic MOOSE-like fixture',
                },
                neutronics: {
                    keff: 1.00342,
                    keffStdDev: 0.00058,
                    reactivityPcm: 341,
                    shutdownMarginPcm: -1840,
                    controlDrumAngleDeg: 42,
                    drumWorthPcm: 2360,
                    temperatureFeedbackPcm: -410,
                    leakageFraction: 0.0712,
                    powerPeakingFactor: 1.19,
                    posture: 'critical operating band',
                },
                thermalHydraulic: {
                    thermalPowerMw: 515,
                    massFlowKgPerSec: 13.8,
                    coreInletTemperatureK: 94,
                    coreOutletTemperatureK: 2760,
                    peakFuelTemperatureK: 2925,
                    fuelTemperatureLimitK: 3050,
                    thermalMarginK: 125,
                },
                propulsion: {
                    chamberPressureMpa: 4.15,
                    thrustKn: 112.4,
                    specificImpulseSec: 865.2,
                    nozzleExpansionRatio: 140,
                    nozzleEfficiency: 0.942,
                },
                thermomechanics: {
                    converged: true,
                    meshElements: 18432,
                    nonlinearIterations: 7,
                    maxVonMisesStressMpa: 184,
                    stressLimitMpa: 240,
                    thermalStrainPercent: 0.34,
                    posture: 'nominal',
                },
            },
            null,
            2,
        ),
    },
];

export function RawOutputViewer({documents = DEFAULT_DOCUMENTS, initialDocumentId = 'mcnp'}: Readonly<RawOutputViewerProps>) {
    const fallbackDocument = documents[0] ?? DEFAULT_DOCUMENTS[0];
    const initialDocument = documents.find((document) => document.id === initialDocumentId) ?? fallbackDocument;
    const [activeDocumentId, setActiveDocumentId] = useState<RawOutputKind>(initialDocument.id);

    const activeDocument = useMemo(() => {
        return documents.find((document) => document.id === activeDocumentId) ?? fallbackDocument;
    }, [activeDocumentId, documents, fallbackDocument]);

    return (
        <section className="panel raw-output-viewer">
            <div className="panel-heading">
                <p className="eyebrow">synthetic source files</p>
                <h2>Raw Output Viewer</h2>
            </div>

            <p className="muted-copy">
                Terminal-style fixture viewer for MCNP-like, ROCETS-like, MOOSE-like, and parsed JSON data. These
                files are intentionally close to familiar engineering outputs without pretending to be real solver output.
            </p>

            <div className="raw-output-tabs" role="tablist" aria-label="Raw output documents">
                {documents.map((document) => {
                    const active = document.id === activeDocument.id;

                    return (
                        <button
                            aria-selected={active}
                            className={active ? 'raw-output-tab active' : 'raw-output-tab'}
                            key={document.id}
                            onClick={() => setActiveDocumentId(document.id)}
                            role="tab"
                            type="button"
                        >
                            {document.label}
                        </button>
                    );
                })}
            </div>

            <div className="raw-output-meta">
                <span>{activeDocument.sourceLabel}</span>
                <strong>{activeDocument.language === 'json' ? 'normalized JSON' : 'plain text fixture'}</strong>
            </div>

            <pre className={`raw-output-console ${activeDocument.language}`} aria-label={`${activeDocument.label} raw output`}>
                <code>{activeDocument.content}</code>
            </pre>
        </section>
    );
}