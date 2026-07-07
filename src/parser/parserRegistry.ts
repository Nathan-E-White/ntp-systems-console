import * as bisonInputParser from "./bison/bison.input.parser";
import * as bisonOutputParser from "./bison/bison.output.parser";
import * as mcnpInputParser from "./mcnp/mcnp.input.parser";
import * as mcnpOutputParser from "./mcnp/mcnp.output.parser";
import * as mooseInputParser from "./moose/moose.input.parser";
import * as mooseOutputParser from "./moose/moose.output.parser";
import * as rocetsInputParser from "./rocets/rocets.input.parser";
import * as rocetsOutputParser from "./rocets/rocets.output.parser";

import type {
    ParserDescriptor,
    ParserDetectionContext,
    ParserDiagnostic,
    ParserExecutionResult,
    ParserFamily,
} from "./parserTypes";

type ParserModule = Record<string, unknown>;

type ParserFunction<TParsed = unknown> = (text: string) => TParsed;

const unsupportedFileDiagnostic = (filename?: string): ParserDiagnostic => ({
    severity: "warning",
    message: filename
        ? `No registered parser recognized ${filename}.`
        : "No registered parser recognized the supplied file text.",
    source: "parserRegistry",
    hint: "Check the file extension or choose MCNP, MOOSE, BISON, or ROCETS input/output text.",
});

const parserFailureDiagnostic = (displayName: string, error: string): ParserDiagnostic => ({
    severity: "error",
    message: `${displayName} failed to parse the supplied file.`,
    source: "parserRegistry",
    hint: error,
});

const resolveParserFunction = (
    module: ParserModule,
    candidateNames: string[],
): ParserFunction => {
    const parser = candidateNames
        .map((candidateName) => module[candidateName])
        .find((candidateExport): candidateExport is ParserFunction => typeof candidateExport === "function");

    if (!parser) {
        throw new Error(`Parser module did not export one of: ${candidateNames.join(", ")}.`);
    }

    return parser;
};

const includesAny = (text: string, patterns: RegExp[]): boolean =>
    patterns.some((pattern) => pattern.test(text));

const hasExtension = (context: ParserDetectionContext, extensions: string[]): boolean => {
    const extension = context.extension ?? extractExtension(context.filename);

    return extension !== undefined && extensions.includes(extension);
};

const extractExtension = (filename?: string): string | undefined => {
    if (!filename) {
        return undefined;
    }

    const normalizedFilename = filename.toLowerCase().trim();
    const extensionStart = normalizedFilename.lastIndexOf(".");

    if (extensionStart < 0 || extensionStart === normalizedFilename.length - 1) {
        return undefined;
    }

    return normalizedFilename.slice(extensionStart + 1);
};

const normalizeText = (text: string): string => text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

const buildDetectionContext = (text: string, filename?: string): ParserDetectionContext => ({
    filename,
    extension: extractExtension(filename),
    text: normalizeText(text),
});

const createParserDescriptor = <TParsed = unknown>(input: {
    family: ParserFamily;
    direction: "input" | "output";
    displayName: string;
    extensions: string[];
    module: ParserModule;
    candidateNames: string[];
    detect: (context: ParserDetectionContext) => boolean;
}): ParserDescriptor<TParsed> => ({
    family: input.family,
    direction: input.direction,
    displayName: input.displayName,
    extensions: input.extensions,
    detect: input.detect,
    parse: (text: string): TParsed =>
        resolveParserFunction(input.module, input.candidateNames)(normalizeText(text)) as TParsed,
});

const mcnpInputDescriptor = createParserDescriptor({
    family: "mcnp",
    direction: "input",
    displayName: "MCNP input deck",
    extensions: ["inp", "i"],
    module: mcnpInputParser,
    candidateNames: ["parseMcnpInput", "parseMCNPInput", "parseInput", "parse"],
    detect: (context) => {
        const text = context.text.toLowerCase();

        return (
            hasExtension(context, ["inp", "i"]) &&
            includesAny(text, [/^\s*m\d+\s+/m, /^\s*f\d+:/m, /^\s*sdef\b/m, /^\s*imp:[np]/m])
        );
    },
});

const mcnpOutputDescriptor = createParserDescriptor({
    family: "mcnp",
    direction: "output",
    displayName: "MCNP output",
    extensions: ["out", "o", "txt"],
    module: mcnpOutputParser,
    candidateNames: ["parseMcnpOutput", "parseMCNPOutput", "parseOutput", "parse"],
    detect: (context) => {
        const text = context.text.toLowerCase();

        return includesAny(text, [
            /^\s*1\s+message\s+summary/m,
            /^\s*1\s+problem\s+controls/m,
            /^\s*1\s+tally\s+results/m,
            /mcnp\s+output/,
            /run\s+termination/,
        ]);
    },
});

const mooseInputDescriptor = createParserDescriptor({
    family: "moose",
    direction: "input",
    displayName: "MOOSE input file",
    extensions: ["i", "inp"],
    module: mooseInputParser,
    candidateNames: ["parseMooseInput", "parseMOOSEInput", "parseInput", "parse"],
    detect: (context) => {
        const text = context.text;

        return includesAny(text, [
            /^\s*\[Mesh]\s*$/m,
            /^\s*\[Variables]\s*$/m,
            /^\s*\[Kernels]\s*$/m,
            /^\s*\[Materials]\s*$/m,
            /^\s*\[Executioner]\s*$/m,
        ]);
    },
});

const bisonInputDescriptor = createParserDescriptor({
    family: "bison",
    direction: "input",
    displayName: "BISON input scaffold",
    extensions: ["i", "inp"],
    module: bisonInputParser,
    candidateNames: ["parseBisonInput", "parseBISONInput", "parseInput", "parse"],
    detect: (context) => {
        const text = context.text.toLowerCase();
        const filename = context.filename?.toLowerCase() ?? "";

        return (
            (filename.includes("bison") && hasExtension(context, ["i", "inp"])) ||
            includesAny(text, [
                /bison\/moose fuel-performance scaffold/,
                /bison split discussed/,
                /hydrogen_attack_margin_proxy/,
                /burnup_proxy/,
            ])
        );
    },
});

const bisonOutputDescriptor = createParserDescriptor({
    family: "bison",
    direction: "output",
    displayName: "BISON output fixture",
    extensions: ["out", "o", "txt"],
    module: bisonOutputParser,
    candidateNames: ["parseBisonOutput", "parseBISONOutput", "parseOutput", "parse"],
    detect: (context) => {
        const text = context.text.toLowerCase();
        const filename = context.filename?.toLowerCase() ?? "";

        return (
            (filename.includes("bison") && hasExtension(context, ["out", "o", "txt"])) ||
            includesAny(text, [
                /bison-moose output fixture/,
                /bison-like fuel performance scaffold/,
                /postprocessor output: ntp\.bison_out\.csv/,
                /final review summary/,
            ])
        );
    },
});

const mooseOutputDescriptor = createParserDescriptor({
    family: "moose",
    direction: "output",
    displayName: "MOOSE output",
    extensions: ["out", "txt"],
    module: mooseOutputParser,
    candidateNames: ["parseMooseOutput", "parseMOOSEOutput", "parseOutput", "parse"],
    detect: (context) => {
        const text = context.text.toLowerCase();

        return includesAny(text, [
            /inputvalidation/,
            /meshsummary/,
            /postprocessor\s+time\s+history/,
            /final\s+postprocessor\s+values/,
            /finished\s+executing/,
        ]);
    },
});

const rocetsInputDescriptor = createParserDescriptor({
    family: "rocets",
    direction: "input",
    displayName: "ROCETS input deck",
    extensions: ["inp", "rocets", "txt"],
    module: rocetsInputParser,
    candidateNames: [
        "parseRocetsInput",
        "parseRocetsInputDeck",
        "parseRocetsDeck",
        "parseRocetsFile",
        "parseRocetsInputFile",
        "parseROCETSInput",
        "parseROCETSInputDeck",
        "parseInput",
        "parse",
        "default",
    ],
    detect: (context) => {
        const text = context.text.toUpperCase();

        return includesAny(text, [
            /^\s*CASE\b/m,
            /^\s*TITLE\b/m,
            /^\s*TIME_CONTROL\b/m,
            /^\s*SOLVER_CONTROL\b/m,
            /^\s*COMPONENT\b/m,
            /^\s*CONNECT\b/m,
            /^\s*END_CASE\b/m,
        ]);
    },
});

const rocetsOutputDescriptor = createParserDescriptor({
    family: "rocets",
    direction: "output",
    displayName: "ROCETS output",
    extensions: ["out", "txt"],
    module: rocetsOutputParser,
    candidateNames: [
        "parseRocetsOutput",
        "parseRocetsOutputFile",
        "parseRocetsRunOutput",
        "parseROCETSOutput",
        "parseROCETSOutputFile",
        "parseOutput",
        "parse",
        "default",
    ],
    detect: (context) => {
        const text = context.text.toUpperCase();

        return includesAny(text, [
            /ROCETS-LIKE\s+SYSTEM\s+SOLVER\s+OUTPUT/,
            /INPUT\s+DECK\s+ECHO/,
            /STEADY\s+INITIALIZATION/,
            /TRANSIENT\s+INTEGRATION\s+LOG/,
            /FINAL\s+RUN\s+SUMMARY/,
            /END\s+ROCETS-LIKE\s+SYSTEM\s+SOLVER\s+OUTPUT/,
        ]);
    },
});

export const parserDescriptors: ParserDescriptor[] = [
    bisonOutputDescriptor,
    mcnpOutputDescriptor,
    mooseOutputDescriptor,
    rocetsOutputDescriptor,
    bisonInputDescriptor,
    mooseInputDescriptor,
    rocetsInputDescriptor,
    mcnpInputDescriptor,
];

export const detectParser = (text: string, filename?: string): ParserDescriptor | undefined => {
    const context = buildDetectionContext(text, filename);

    return parserDescriptors.find((descriptor) => descriptor.detect(context));
};

export const canParseKnownEngineeringFile = (text: string, filename?: string): boolean =>
    detectParser(text, filename) !== undefined;

export const parseKnownEngineeringFile = (
    text: string,
    filename?: string,
): ParserExecutionResult => {
    const normalizedText = normalizeText(text);
    const descriptor = detectParser(normalizedText, filename);

    if (!descriptor) {
        return {
            status: "unsupported",
            diagnostics: [unsupportedFileDiagnostic(filename)],
        };
    }

    try {
        return {
            status: "parsed",
            descriptor,
            parsed: descriptor.parse(normalizedText),
            diagnostics: [],
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            status: "error",
            descriptor,
            error: errorMessage,
            diagnostics: [parserFailureDiagnostic(descriptor.displayName, errorMessage)],
        };
    }
};
