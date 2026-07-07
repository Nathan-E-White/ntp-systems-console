

import {ReactNode, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedSection, ParserDirection} from '../../../parser/parserTypes';
import {
    ParsedSectionsPanel,
    ParsedSectionsPanelHeader,
    ParsedSectionsPanelList,
    ParsedSectionsPanelProvider,
    ParsedSectionsPanelScope,
    type ParsedSectionsPanelProps,
} from '../ParsedSectionsPanel';

export interface ParsedMCNPSectionsPanelProps
    extends Omit<ParsedSectionsPanelProps, 'parsed' | 'sections' | 'title' | 'eyebrow' | 'description'> {
    readonly parsed: ParsedFileViewModel;
    readonly direction?: ParserDirection;
    readonly preferredSectionIds?: readonly string[];
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly sections?: readonly ParsedSection[];
    readonly children?: ReactNode;
}

export const ParsedMCNPSectionsPanelState = Object.freeze({
    expectedFamily: 'mcnp' as const,
    defaultTitle: 'MCNP Sections',
    defaultEyebrow: 'MCNP parsed sections',
    defaultDescription: 'Review parsed MCNP section records selected for this viewer.',
    inputPreferredSectionIds: [
        'problem-summary',
        'mode',
        'source',
        'criticality',
        'geometry',
        'materials',
    ] as const,
    outputPreferredSectionIds: [
        'run-summary',
        'criticality',
        'particle-balance',
        'performance',
    ] as const,
});

const isExpectedMCNPFile = (parsed: ParsedFileViewModel, direction?: ParserDirection): boolean => {
    if (parsed.family !== ParsedMCNPSectionsPanelState.expectedFamily) {
        return false;
    }

    return !direction || parsed.direction === direction;
};

const defaultPreferredSectionIdsForDirection = (direction?: ParserDirection): readonly string[] => {
    if (direction === 'input') {
        return ParsedMCNPSectionsPanelState.inputPreferredSectionIds;
    }

    if (direction === 'output') {
        return ParsedMCNPSectionsPanelState.outputPreferredSectionIds;
    }

    return [
        ...ParsedMCNPSectionsPanelState.inputPreferredSectionIds,
        ...ParsedMCNPSectionsPanelState.outputPreferredSectionIds,
    ];
};

const selectMcnpSections = (
    parsed: ParsedFileViewModel,
    direction?: ParserDirection,
    sections?: readonly ParsedSection[],
    preferredSectionIds?: readonly string[],
): readonly ParsedSection[] => {
    if (sections) {
        return sections;
    }

    const preferredIds = new Set<string>(preferredSectionIds ?? defaultPreferredSectionIdsForDirection(direction));
    const selectedSections = parsed.sections.filter((section) => preferredIds.has(section.id));

    return selectedSections.length > 0 ? selectedSections : parsed.sections;
};

export function ParsedMCNPSectionsPanelGuard({
    direction,
    parsed,
}: {
    readonly direction?: ParserDirection;
    readonly parsed: ParsedFileViewModel;
}) {
    if (isExpectedMCNPFile(parsed, direction)) {
        return null;
    }

    const expected = direction ? `MCNP · ${direction}` : 'MCNP';

    return (
        <section className="section-panel" role="alert" aria-live="polite">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">MCNP sections panel</p>
                    <h3>Unexpected parsed file type</h3>
                </div>
            </div>
            <p>
                This panel expects <strong>{expected}</strong> data, but the supplied parsed file is{' '}
                <strong>{parsed.family.toUpperCase()} · {parsed.direction}</strong>.
            </p>
        </section>
    );
}

export function ParsedMCNPSectionsPanel({
    children,
    description = ParsedMCNPSectionsPanelState.defaultDescription,
    direction,
    eyebrow = ParsedMCNPSectionsPanelState.defaultEyebrow,
    parsed,
    preferredSectionIds,
    sections,
    title = ParsedMCNPSectionsPanelState.defaultTitle,
    ...sectionsPanelProps
}: ParsedMCNPSectionsPanelProps) {
    const selectedSections = useMemo(
        () => selectMcnpSections(parsed, direction, sections, preferredSectionIds),
        [direction, parsed, preferredSectionIds, sections],
    );

    if (!isExpectedMCNPFile(parsed, direction)) {
        return <ParsedMCNPSectionsPanelGuard direction={direction} parsed={parsed}/>;
    }

    if (children) {
        return (
            <ParsedSectionsPanelProvider
                {...sectionsPanelProps}
                description={description}
                eyebrow={eyebrow}
                parsed={parsed}
                sections={selectedSections}
                title={title}
            >
                <ParsedSectionsPanelScope>
                    <ParsedSectionsPanelHeader/>
                    {children}
                </ParsedSectionsPanelScope>
            </ParsedSectionsPanelProvider>
        );
    }

    return (
        <ParsedSectionsPanel
            {...sectionsPanelProps}
            description={description}
            eyebrow={eyebrow}
            parsed={parsed}
            sections={selectedSections}
            title={title}
        >
            <ParsedSectionsPanelList/>
        </ParsedSectionsPanel>
    );
}