export type BasisClassification =
    | 'published'
    | 'physical-constant'
    | 'derived'
    | 'calibrated'
    | 'user-supplied'
    | 'fixture'
    | 'missing';

export type ReferenceApplicability =
    | 'historical-benchmark'
    | 'analysis-method'
    | 'correlation'
    | 'material-evidence'
    | 'validation-guidance'
    | 'system-architecture';

export interface ReferenceRecord {
    readonly id: string;
    readonly title: string;
    readonly authors: string;
    readonly reportNumber?: string;
    readonly publicationDate: string;
    readonly url: string;
    readonly locator: string;
    readonly applicability: readonly ReferenceApplicability[];
    readonly limitation: string;
    readonly accessedDate: string;
}

export interface ParameterBasis {
    readonly id: string;
    readonly label: string;
    readonly classification: BasisClassification;
    readonly referenceId?: string;
    readonly locator?: string;
    readonly originalValue?: number | string;
    readonly unit?: string;
    readonly rationale: string;
    readonly validity?: string;
}

export interface CorrelationBasis extends ParameterBasis {
    readonly equation: string;
    readonly minimum?: number;
    readonly maximum?: number;
    readonly rangeVariable?: string;
}

export interface BasisDiagnostic {
    readonly id: string;
    readonly severity: 'info' | 'warning' | 'incomplete';
    readonly message: string;
    readonly basisId?: string;
}

export interface ModelBasisSummary {
    readonly profileId: string;
    readonly profileLabel: string;
    readonly completeness: 'complete' | 'screening' | 'incomplete';
    readonly diagnostics: readonly BasisDiagnostic[];
    readonly activeBasisIds: readonly string[];
    readonly claimBoundary: string;
}

export const REFERENCE_RECORDS: readonly ReferenceRecord[] = [
    {
        id: 'nasem-25977-ch2',
        title: 'Space Nuclear Propulsion for Human Mars Exploration, Chapter 2',
        authors: 'National Academies of Sciences, Engineering, and Medicine',
        publicationDate: '2021',
        url: 'https://www.nationalacademies.org/read/25977/chapter/4',
        locator: 'Chapter 2, pp. 14-16, Tables 2.1 and 2.2',
        applicability: ['historical-benchmark', 'material-evidence', 'validation-guidance'],
        limitation: 'Secondary synthesis of public historical data; values are comparison benchmarks, not a Pewee reconstruction.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-tm-105867',
        title: 'Program ELM: A Tool for Rapid Thermal-Hydraulic Analysis of Solid-Core Nuclear Rocket Fuel Elements',
        authors: 'James T. Walton',
        reportNumber: 'NASA-TM-105867',
        publicationDate: '1992',
        url: 'https://ntrs.nasa.gov/api/citations/19930009917/downloads/19930009917.pdf',
        locator: 'pp. 5-6, 11, 16-26; program listing and Pewee-1 power-shape coefficients',
        applicability: ['analysis-method', 'correlation', 'validation-guidance'],
        limitation: 'One-dimensional steady fuel-channel method; correlation validity and geometry applicability must be checked.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-cr-191081',
        title: 'Nuclear Engine System Simulation (NESS), Version 2.0: Program User Guide',
        authors: 'Dennis G. Pelaccio, Christine M. Scheil, and Lyman Petrosky',
        reportNumber: 'NASA-CR-191081',
        publicationDate: '1993',
        url: 'https://ntrs.nasa.gov/api/citations/19930014686/downloads/19930014686.pdf',
        locator: 'Sections 2.1-2.2 and 3.3; sample and comparison cases',
        applicability: ['analysis-method', 'system-architecture', 'correlation', 'validation-guidance'],
        limitation: 'Historical preliminary-design code documentation; not reproduced or validated by this browser model.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-cr-184270',
        title: 'Rover Nuclear Rocket Engine Program: Overview of Rover Engine Tests',
        authors: 'J. L. Finseth',
        reportNumber: 'NASA-CR-184270',
        publicationDate: '1991',
        url: 'https://ntrs.nasa.gov/api/citations/19920005899/downloads/19920005899.pdf',
        locator: 'Pewee-1 test summary and performance tables',
        applicability: ['historical-benchmark', 'material-evidence'],
        limitation: 'Historical test overview; exact instrumentation, uncertainty, and configuration details require underlying test reports.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nist-srd69-h2',
        title: 'NIST Chemistry WebBook, SRD 69: Hydrogen',
        authors: 'National Institute of Standards and Technology',
        publicationDate: '2026 web edition',
        url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C1333740&Mask=1#Thermo-Gas',
        locator: 'Gas Phase Heat Capacity, Shomate Equation and coefficient table',
        applicability: ['analysis-method', 'correlation'],
        limitation: 'Ideal-gas standard-state thermochemistry; it does not supply the real-fluid inlet state or dissociation model.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-rp-1311',
        title: 'Computer Program for Calculation of Complex Chemical Equilibrium Compositions and Applications, Part I',
        authors: 'Sanford Gordon and Bonnie J. McBride',
        reportNumber: 'NASA-RP-1311',
        publicationDate: '1994',
        url: 'https://ntrs.nasa.gov/api/citations/19950013764/downloads/19950013764.pdf',
        locator: 'Section 6, Theoretical Rocket Performance',
        applicability: ['analysis-method', 'validation-guidance'],
        limitation: 'Referenced as a higher-fidelity replacement; NASA CEA is not implemented by this application.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-glenn-thrust',
        title: 'Rocket Thrust',
        authors: 'NASA Glenn Research Center',
        publicationDate: '2024',
        url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rocket-thrust/',
        locator: 'Generalized thrust equation',
        applicability: ['analysis-method'],
        limitation: 'General ideal rocket relation; property, chemistry, and nozzle-loss models remain separate requirements.',
        accessedDate: '2026-06-11',
    },
    {
        id: 'nasa-std-7009',
        title: 'Standard for Models and Simulations',
        authors: 'National Aeronautics and Space Administration',
        reportNumber: 'NASA-STD-7009B Change 1',
        publicationDate: '2024',
        url: 'https://standards.nasa.gov/standard/nasa/nasa-std-7009',
        locator: 'Credibility assessment and evidence traceability requirements',
        applicability: ['validation-guidance'],
        limitation: 'Used as organizational guidance only; this portfolio model has not completed an agency credibility assessment.',
        accessedDate: '2026-06-11',
    },
    ...[
        ['19930017763', 'Overview of NASA/DOE/DOD interagency modeling team and activities'],
        ['19930017764', 'Engine management during NTRE start up'],
        ['19930017765', 'Particle bed reactor modeling'],
        ['19930017766', 'Rocketdyne/Westinghouse nuclear thermal rocket engine modeling'],
        ['19930017767', 'Computational modeling of nuclear thermal rockets'],
        ['19930017768', 'NTP system simulation and detailed nuclear engine modeling'],
        ['19930017769', 'Nuclear Engine System Simulation (NESS) version 2.0'],
        ['19930017770', 'SAFSIM overview'],
        ['19930017771', 'Kinetic: A system code for analyzing nuclear thermal propulsion rocket engine transients'],
        ['19930017772', 'Next generation system modeling of NTR systems'],
        ['19930017773', 'Rocket engine numerical simulator'],
    ].map(([id, title]): ReferenceRecord => ({
        id: `nptr-${id}`,
        title,
        authors: 'Nuclear Propulsion Technical Interchange Meeting contributor',
        publicationDate: '1993',
        url: `https://ntrs.nasa.gov/api/citations/${id}/downloads/${id}.pdf`,
        locator: `NASA NTRS document ${id}`,
        applicability: ['system-architecture'],
        limitation: 'Presentation-level modeling provenance; not used as numerical authority unless a separate basis entry identifies an equation or value.',
        accessedDate: '2026-06-11',
    })),
];

export function getReferenceRecord(id: string): ReferenceRecord | undefined {
    return REFERENCE_RECORDS.find((record) => record.id === id);
}
