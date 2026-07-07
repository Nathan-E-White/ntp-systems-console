export interface McnpParseResult {
    cells: McnpCellCard[];
    surfaces: McnpSurfaceCard[];
    materials: McnpMaterialCard[];
    tallies: McnpTallyCard[];
    sourceCards: McnpSourceCard[];
    distributions: McnpDistributionCard[];
    metadata: Record<string, string>;
    maps: McnpMapCard[];
    phases: McnpPhaseCard[];
    edges: McnpEdgeCard[];
    views: McnpViewCard[];
    diagnostics: McnpParserDiagnostic[];
}

export interface McnpCellCard {
    kind: "cell";
    lineNumber: number;
    cellId: number;
    materialId: number;
    density?: number;
    geometry: string;
    importance?: Record<string, number>;
    label?: string;
    raw: string;
}

export interface McnpSurfaceCard {
    kind: "surface";
    lineNumber: number;
    surfaceId: number;
    surfaceType: string;
    parameters: number[];
    label?: string;
    raw: string;
}

export interface McnpMaterialCard {
    kind: "material";
    lineNumber: number;
    materialId: number;
    nuclides: Array<{ zaid: string; fraction: number }>;
    label?: string;
    raw: string;
}

export interface McnpTallyCard {
    kind: "tally";
    lineNumber: number;
    tallyId: number;
    particle: string;
    cells: number[];
    label?: string;
    raw: string;
}

export interface McnpSourceCard {
    kind: "source";
    lineNumber: number;
    name: string;
    parameters: Record<string, string>;
    raw: string;
}

export interface McnpDistributionCard {
    kind: "distribution";
    lineNumber: number;
    distributionType: "SI" | "SP";
    distributionId: number;
    mode?: string;
    values: string[];
    raw: string;
}

export interface McnpMapCard {
    kind: "map";
    lineNumber: number;
    cells?: number[];
    component?: string;
    tag?: string;
    panel?: string;
    attributes: Record<string, string>;
    raw: string;
}

export interface McnpPhaseCard {
    kind: "phase";
    lineNumber: number;
    name: string;
    start: number;
    stop: number;
    mode: string;
    attributes: Record<string, string>;
    raw: string;
}

export interface McnpEdgeCard {
    kind: "edge";
    lineNumber: number;
    from: string;
    to: string;
    edge?: string;
    attributes: Record<string, string>;
    raw: string;
}

export interface McnpViewCard {
    kind: "view";
    lineNumber: number;
    attributes: Record<string, string>;
    raw: string;
}

export interface McnpParserDiagnostic {
    severity: "info" | "warning" | "error";
    lineNumber: number;
    message: string;
    raw?: string;
}

type Section = "cells" | "surfaces" | "data" | "metadata";
type LabelableCard = McnpCellCard | McnpSurfaceCard | McnpMaterialCard | McnpTallyCard;

const COMMENT_RE = /^\s*[cC](?:\s+|$)/;
const CELL_RE = /^\s*(\d+)\s+(-?\d+)\s+(.*)$/;
const SURFACE_RE = /^\s*(\d+)\s+([A-Za-z]+)\s*(.*)$/;
const MATERIAL_RE = /^\s*[mM](\d+)\s+(.*)$/;
const TALLY_RE = /^\s*[fF](\d+):([A-Za-z]+)\s+(.*)$/;
const SOURCE_RE = /^\s*(SDEF)\s+(.*)$/i;
const DIST_RE = /^\s*(SI|SP)(\d+)\s+(.*)$/i;
const META_RE = /^\s*[cC]\s+META\s+(\S+)=(.*)$/;
const MAP_RE = /^\s*[cC]\s+MAP\s+(.*)$/;
const PHASE_RE = /^\s*[cC]\s+PHASE\s+(\S+)\s+(.*)$/;
const EDGE_RE = /^\s*[cC]\s+EDGE\s+(\S+)\s*->\s*(\S+)\s*(.*)$/;
const VIEW_RE = /^\s*[cC]\s+VIEW\s+(.*)$/;

export function parseMcnpInput(input: string): McnpParseResult {
    const result: McnpParseResult = {
        cells: [],
        surfaces: [],
        materials: [],
        tallies: [],
        sourceCards: [],
        distributions: [],
        metadata: {},
        maps: [],
        phases: [],
        edges: [],
        views: [],
        diagnostics: [],
    };

    let section: Section = "cells";
    let cardAwaitingCommentMetadataLabel: LabelableCard | undefined;

    input
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .forEach((raw, index) => {
            const lineNumber = index + 1;
            const trimmed = raw.trim();

            section = updateSection(section, raw);

            if (trimmed.length === 0) {
                cardAwaitingCommentMetadataLabel = undefined;
                return;
            }

            if (COMMENT_RE.test(raw)) {
                const label = parseCommentLineMetadataLabel(raw);

                if (label !== undefined) {
                    // MCNP ignores the entire C-line; this is app fixture metadata, not active input syntax.
                    const metadataTarget = cardAwaitingCommentMetadataLabel;
                    if (metadataTarget !== undefined && metadataTarget.label === undefined) {
                        metadataTarget.label = label;
                        cardAwaitingCommentMetadataLabel = undefined;
                        return;
                    }

                    return;
                }

                cardAwaitingCommentMetadataLabel = undefined;
                parseStructuredComment(raw, lineNumber, result);
                return;
            }

            const body = stripInlineComment(raw).trim();
            const eolCommentLabel = parseEndOfLineCommentLabel(raw);

            if (body.length === 0) {
                return;
            }

            const label = eolCommentLabel;

            const parsed =
                parseMaterial(body, raw, lineNumber, label) ??
                parseTally(body, raw, lineNumber, label) ??
                parseSource(body, raw, lineNumber) ??
                parseDistribution(body, raw, lineNumber);

            if (parsed?.kind === "material") {
                result.materials.push(parsed);
                cardAwaitingCommentMetadataLabel = parsed.label === undefined ? parsed : undefined;
            } else if (parsed?.kind === "tally") {
                result.tallies.push(parsed);
                cardAwaitingCommentMetadataLabel = parsed.label === undefined ? parsed : undefined;
            } else {
                if (parsed?.kind === "source") result.sourceCards.push(parsed);
                else if (parsed?.kind === "distribution") result.distributions.push(parsed);
                else if (section === "surfaces") {
                    const surface = parseSurface(body, raw, lineNumber, label, result);
                    result.surfaces.push(surface);
                    cardAwaitingCommentMetadataLabel = surface.label === undefined ? surface : undefined;
                    return;
                } else if (section === "cells") {
                    const cell = parseCell(body, raw, lineNumber, label, result);
                    result.cells.push(cell);
                    cardAwaitingCommentMetadataLabel = cell.label === undefined ? cell : undefined;
                    return;
                }

                cardAwaitingCommentMetadataLabel = undefined;
            }
        });

    return result;
}

export function summarizeMcnpInput(result: McnpParseResult): Record<string, number> {
    return {
        cells: result.cells.length,
        surfaces: result.surfaces.length,
        materials: result.materials.length,
        tallies: result.tallies.length,
        sourceCards: result.sourceCards.length,
        distributions: result.distributions.length,
        metadata: Object.keys(result.metadata).length,
        maps: result.maps.length,
        phases: result.phases.length,
        edges: result.edges.length,
        views: result.views.length,
        diagnostics: result.diagnostics.length,
    };
}

function updateSection(section: Section, raw: string): Section {
    const lower = raw.toLowerCase();

    if (lower.includes("cell cards")) return "cells";
    if (lower.includes("surface cards")) return "surfaces";
    if (lower.includes("data cards")) return "data";
    if (lower.includes("app / parser metadata")) return "metadata";

    return section;
}

function stripInlineComment(raw: string): string {
    const commentIndex = raw.indexOf("$");
    return commentIndex < 0 ? raw : raw.slice(0, commentIndex);
}

function parseEndOfLineCommentLabel(raw: string): string | undefined {
    const commentIndex = raw.indexOf("$");
    if (commentIndex < 0) return undefined;

    const label = raw.slice(commentIndex + 1).trim();
    return label.length > 0 ? label : undefined;
}

function parseCommentLineMetadataLabel(raw: string): string | undefined {
    const text = raw.replace(COMMENT_RE, "").trim();

    if (!text.startsWith("$")) {
        return undefined;
    }

    return text.replace(/^\$\s*/, "").trim();
}

function parseCell(
    body: string,
    raw: string,
    lineNumber: number,
    label: string | undefined,
    result: McnpParseResult,
): McnpCellCard {
    const match = body.match(CELL_RE);

    if (match === null) {
        result.diagnostics.push({
            severity: "warning",
            lineNumber,
            message: "Could not parse MCNP cell card.",
            raw,
        });

        return {
            kind: "cell",
            lineNumber,
            cellId: -1,
            materialId: -1,
            geometry: body,
            label,
            raw,
        };
    }

    const cellId = Number.parseInt(match[1], 10);
    const materialId = Number.parseInt(match[2], 10);
    const tokens = match[3].trim().split(/\s+/);
    const possibleDensity = Number.parseFloat(tokens[0]);
    const hasDensity = Number.isFinite(possibleDensity) && /^[-+]?\d/.test(tokens[0]);

    const geometry = hasDensity ? tokens.slice(1).join(" ") : tokens.join(" ");

    return {
        kind: "cell",
        lineNumber,
        cellId,
        materialId,
        density: hasDensity ? possibleDensity : undefined,
        geometry: geometry.replace(/\s*imp:[a-zA-Z]+=\S+/g, "").trim(),
        importance: parseImportance(geometry),
        label,
        raw,
    };
}

function parseSurface(
    body: string,
    raw: string,
    lineNumber: number,
    label: string | undefined,
    result: McnpParseResult,
): McnpSurfaceCard {
    const match = body.match(SURFACE_RE);

    if (match === null) {
        result.diagnostics.push({
            severity: "warning",
            lineNumber,
            message: "Could not parse MCNP surface card.",
            raw,
        });

        return {
            kind: "surface",
            lineNumber,
            surfaceId: -1,
            surfaceType: "unknown",
            parameters: [],
            label,
            raw,
        };
    }

    return {
        kind: "surface",
        lineNumber,
        surfaceId: Number.parseInt(match[1], 10),
        surfaceType: match[2].toLowerCase(),
        parameters: match[3]
            .trim()
            .split(/\s+/)
            .map(Number)
            .filter(Number.isFinite),
        label,
        raw,
    };
}

function parseMaterial(
    body: string,
    raw: string,
    lineNumber: number,
    label?: string,
): McnpMaterialCard | undefined {
    const match = body.match(MATERIAL_RE);
    if (match === null) return undefined;

    const tokens = match[2].trim().split(/\s+/);
    const nuclides: Array<{ zaid: string; fraction: number }> = [];

    for (let index = 0; index < tokens.length; index += 2) {
        const fraction = Number.parseFloat(tokens[index + 1] ?? "");

        if (Number.isFinite(fraction)) {
            nuclides.push({ zaid: tokens[index], fraction });
        }
    }

    return {
        kind: "material",
        lineNumber,
        materialId: Number.parseInt(match[1], 10),
        nuclides,
        label,
        raw,
    };
}

function parseTally(
    body: string,
    raw: string,
    lineNumber: number,
    label?: string,
): McnpTallyCard | undefined {
    const match = body.match(TALLY_RE);
    if (match === null) return undefined;

    return {
        kind: "tally",
        lineNumber,
        tallyId: Number.parseInt(match[1], 10),
        particle: match[2].toUpperCase(),
        cells: match[3]
            .trim()
            .split(/\s+/)
            .map((token) => Number.parseInt(token, 10))
            .filter(Number.isFinite),
        label,
        raw,
    };
}

function parseSource(body: string, raw: string, lineNumber: number): McnpSourceCard | undefined {
    const match = body.match(SOURCE_RE);
    if (match === null) return undefined;

    return {
        kind: "source",
        lineNumber,
        name: match[1].toUpperCase(),
        parameters: parseSourceParameters(match[2]),
        raw,
    };
}

function parseDistribution(
    body: string,
    raw: string,
    lineNumber: number,
): McnpDistributionCard | undefined {
    const match = body.match(DIST_RE);
    if (match === null) return undefined;

    const tokens = match[3].trim().split(/\s+/);
    const mode = /^[A-Za-z]$/.test(tokens[0] ?? "") ? tokens[0] : undefined;

    return {
        kind: "distribution",
        lineNumber,
        distributionType: match[1].toUpperCase() as "SI" | "SP",
        distributionId: Number.parseInt(match[2], 10),
        mode,
        values: mode === undefined ? tokens : tokens.slice(1),
        raw,
    };
}

function parseStructuredComment(raw: string, lineNumber: number, result: McnpParseResult): void {
    const metaMatch = raw.match(META_RE);
    if (metaMatch !== null) {
        result.metadata[metaMatch[1]] = metaMatch[2].trim();
        return;
    }

    const mapMatch = raw.match(MAP_RE);
    if (mapMatch !== null) {
        const attributes = parseAttributes(mapMatch[1]);
        const cellAttribute = attributes.cell ?? attributes.cells;

        result.maps.push({
            kind: "map",
            lineNumber,
            cells: cellAttribute === undefined ? undefined : parseCellRange(cellAttribute),
            component: attributes.component,
            tag: attributes.tag,
            panel: attributes.panel,
            attributes,
            raw,
        });
        return;
    }

    const phaseMatch = raw.match(PHASE_RE);
    if (phaseMatch !== null) {
        const attributes = parseAttributes(phaseMatch[2]);

        result.phases.push({
            kind: "phase",
            lineNumber,
            name: phaseMatch[1],
            start: Number.parseFloat(attributes.start ?? "NaN"),
            stop: Number.parseFloat(attributes.stop ?? "NaN"),
            mode: attributes.mode ?? "unknown",
            attributes,
            raw,
        });
        return;
    }

    const edgeMatch = raw.match(EDGE_RE);
    if (edgeMatch !== null) {
        const attributes = parseAttributes(edgeMatch[3]);

        result.edges.push({
            kind: "edge",
            lineNumber,
            from: edgeMatch[1],
            to: edgeMatch[2],
            edge: attributes.edge,
            attributes,
            raw,
        });
        return;
    }

    const viewMatch = raw.match(VIEW_RE);
    if (viewMatch !== null) {
        result.views.push({
            kind: "view",
            lineNumber,
            attributes: parseAttributes(viewMatch[1]),
            raw,
        });
    }
}

function parseImportance(geometry: string): Record<string, number> | undefined {
    const importance: Record<string, number> = {};

    for (const match of geometry.matchAll(/imp:([a-zA-Z]+)=(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g)) {
        importance[match[1].toLowerCase()] = Number.parseFloat(match[2]);
    }

    return Object.keys(importance).length === 0 ? undefined : importance;
}

function parseSourceParameters(input: string): Record<string, string> {
    const parameters: Record<string, string> = {};
    const tokens = input.trim().split(/\s+/);
    let index = 0;

    while (index < tokens.length) {
        const match = tokens[index].match(/^([A-Za-z][A-Za-z0-9_]*)=(.*)$/);

        if (match === null) {
            index += 1;
            continue;
        }

        const key = match[1].toLowerCase();
        const values = [match[2]];
        index += 1;

        while (index < tokens.length && !/^[A-Za-z][A-Za-z0-9_]*=/.test(tokens[index])) {
            values.push(tokens[index]);
            index += 1;
        }

        parameters[key] = values.join(" ").trim();
    }

    return parameters;
}

function parseAttributes(input: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    for (const token of input.trim().split(/\s+/)) {
        const separatorIndex = token.indexOf("=");

        if (separatorIndex > 0) {
            attributes[token.slice(0, separatorIndex)] = token.slice(separatorIndex + 1);
        }
    }

    return attributes;
}

function parseCellRange(input: string): number[] {
    const range = input.match(/^(\d+)-(\d+)$/);

    if (range === null) {
        return input
            .split(/\s+/)
            .map((token) => Number.parseInt(token, 10))
            .filter(Number.isFinite);
    }

    const start = Number.parseInt(range[1], 10);
    const stop = Number.parseInt(range[2], 10);
    const cells: number[] = [];

    for (let cell = start; cell <= stop; cell += 1) {
        cells.push(cell);
    }

    return cells;
}
