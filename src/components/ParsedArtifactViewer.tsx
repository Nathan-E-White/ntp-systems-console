import {useId, useMemo, useState} from 'react';

import type {ParserDirection, ParserFamily} from '../parser/parserTypes';
import {ParsedDomainStructuredView} from './ParsedDomainStructuredView';
import {StructuredCodeViewer} from './StructuredCodeViewer';

export interface ParsedArtifactViewerProps {
    readonly artifactTitle: string;
    readonly data: unknown;
    readonly rawText: string;
    readonly family: ParserFamily;
    readonly direction: ParserDirection;
    readonly language?: 'json' | 'text';
    readonly showRaw?: boolean;
    readonly className?: string;
}

export function ParsedArtifactViewer({
    artifactTitle,
    data,
    rawText,
    family,
    direction,
    language = 'json',
    showRaw = true,
    className = '',
}: ParsedArtifactViewerProps) {
    const [mode, setMode] = useState<'structured' | 'raw'>(showRaw ? 'structured' : 'raw');
    const headingId = useId();
    const modeId = `${headingId}-mode`;
    const normalizedData = useMemo(() => {
        if (language !== 'json' || typeof data !== 'string') {
            return data;
        }
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }, [data, language]);

    return (
        <div className={`parsed-artifact-viewer ${className}`}>
            <div aria-label={`${artifactTitle} view mode`} className="parsed-artifact-viewer__modes" role="tablist">
                <button
                    aria-controls={modeId}
                    aria-pressed={mode === 'structured'}
                    className={mode === 'structured' ? 'raw-output-tab active' : 'raw-output-tab'}
                    onClick={() => setMode('structured')}
                    type="button"
                >
                    Structured
                </button>
                {showRaw ? (
                    <button
                        aria-controls={modeId}
                        aria-pressed={mode === 'raw'}
                        className={mode === 'raw' ? 'raw-output-tab active' : 'raw-output-tab'}
                        onClick={() => setMode('raw')}
                        type="button"
                    >
                        Raw JSON
                    </button>
                ) : null}
            </div>
            <div id={modeId}>
                {mode === 'structured' ? (
                    <ParsedDomainStructuredView
                        data={normalizedData}
                        direction={direction}
                        family={family}
                        heading={artifactTitle}
                    />
                ) : (
                    <StructuredCodeViewer
                        ariaLabel={`${artifactTitle} parsed source`}
                        className={`parsed-json-panel${className ? ` ${className}` : ''}`}
                        content={rawText}
                        direction={direction}
                        family={family}
                        language={language}
                    />
                )}
            </div>
        </div>
    );
}
