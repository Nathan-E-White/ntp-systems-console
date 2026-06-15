import {useMemo, useState} from 'react';

import {inputFiles, outputFiles} from '../parser/file_inputs';
import type {ParserDirection, ParserFamily} from '../parser/parserTypes';
import {StructuredCodeViewer} from './StructuredCodeViewer';
import {ParsedArtifactViewer} from './ParsedArtifactViewer';

export type RawOutputDocumentId = 'mcnp-input' | 'mcnp-output' | 'rocets-output' | 'moose-output' | 'json';

export interface RawOutputDocument {
    id: RawOutputDocumentId;
    label: string;
    sourceLabel: string;
    family: ParserFamily;
    direction: ParserDirection;
    content: string;
    language: 'text' | 'json';
}

export interface RawOutputViewerProps {
    documents?: RawOutputDocument[];
    initialDocumentId?: RawOutputDocumentId;
}

const DEFAULT_DOCUMENTS: RawOutputDocument[] = [
    {
        id: 'mcnp-output',
        label: 'MCNP-like',
        sourceLabel: 'Synthetic neutronics fixture',
        family: 'mcnp',
        direction: 'output',
        language: 'text',
        content: outputFiles.mcnp,
    },
    {
        id: 'mcnp-input',
        label: 'MCNP-like input',
        sourceLabel: 'Synthetic MCNP-like fixture input',
        family: 'mcnp',
        direction: 'input',
        language: 'text',
        content: inputFiles.mcnp,
    },
    {
        id: 'rocets-output',
        label: 'ROCETS-like',
        sourceLabel: 'Synthetic propulsion fixture',
        family: 'rocets',
        direction: 'output',
        language: 'text',
        content: outputFiles.rocets,
    },
    {
        id: 'moose-output',
        label: 'MOOSE-like',
        sourceLabel: 'Synthetic thermomechanics fixture',
        family: 'moose',
        direction: 'output',
        language: 'text',
        content: outputFiles.moose,
    },
    {
        id: 'json',
        label: 'Parsed JSON',
        sourceLabel: 'Normalized imported-analysis object',
        family: 'mcnp',
        direction: 'output',
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

export function RawOutputViewer({documents = DEFAULT_DOCUMENTS, initialDocumentId = 'mcnp-output'}: Readonly<RawOutputViewerProps>) {
    const fallbackDocument = documents[0] ?? DEFAULT_DOCUMENTS[0];
    const initialDocument = documents.find((document) => document.id === initialDocumentId) ?? fallbackDocument;
    const [activeDocumentId, setActiveDocumentId] = useState<RawOutputDocumentId>(initialDocument.id);

    const activeDocument = useMemo(() => {
        return documents.find((document) => document.id === activeDocumentId) ?? fallbackDocument;
    }, [activeDocumentId, documents, fallbackDocument]);

    return (
        <section className="panel raw-output-viewer">
            <div className="panel-heading">
                <p className="eyebrow">source files</p>
                <h2>Fixture Explorer</h2>
            </div>

            <p className="muted-copy">
                Read-only fixture explorer: raw and structured views only.
            </p>

            <div className="raw-output-tabs" role="tablist" aria-label="Raw output documents">
                    {documents.map((document) => {
                        const active = document.id === activeDocument.id;

                    return (
                        <button
                            aria-selected={active}
                            className={active ? 'raw-output-tab active' : 'raw-output-tab'}
                            key={`${document.id}-${document.direction}`}
                            onClick={() => setActiveDocumentId(document.id)}
                            role="tab"
                            type="button"
                        >
                            {document.label} · {document.direction}
                        </button>
                    );
                })}
                </div>

            <details className="fixture-metadata">
                <summary>Fixture metadata</summary>
                <dl className="raw-output-meta">
                    <div>
                        <dt>Source</dt>
                        <dd>{activeDocument.sourceLabel}</dd>
                    </div>
                    <div>
                        <dt>Fixture format</dt>
                        <dd>{activeDocument.language === 'json' ? 'normalized JSON' : 'plain text fixture'}</dd>
                    </div>
                    <div>
                        <dt>Direction</dt>
                        <dd>{activeDocument.direction}</dd>
                    </div>
                    <div>
                        <dt>Family</dt>
                        <dd>{activeDocument.family.toUpperCase()}-like</dd>
                    </div>
                </dl>
            </details>
            {activeDocument.language === 'json' ? (
                <details className="structured-json-block">
                    <summary>Show parsed JSON</summary>
                    <ParsedArtifactViewer
                        artifactTitle={`${activeDocument.label} parsed JSON`}
                        className="parsed-json-panel"
                        data={activeDocument.content}
                        direction={activeDocument.direction}
                        family={activeDocument.family}
                        rawText={activeDocument.content}
                    />
                </details>
            ) : (
                <StructuredCodeViewer
                    ariaLabel={`${activeDocument.label} raw output`}
                    className="raw-output-console"
                    content={activeDocument.content}
                    direction={activeDocument.direction}
                    family={activeDocument.family}
                    language={activeDocument.language}
                />
            )}
        </section>
    );
}
