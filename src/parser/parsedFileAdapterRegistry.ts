

import { adaptMcnpInputToViewModel } from "./mcnp.input.adapter";
import { adaptMcnpOutputToViewModel } from "./mcnp.output.adapter";
import { adaptMooseInputToViewModel } from "./moose.input.adapter";
import { adaptMooseOutputToViewModel } from "./moose.output.adapter";
import { createParsedFileViewModel } from "./parsedFileViewModel";
import type {
  ParsedFileViewModel,
  ParserDescriptor,
  ParserDirection,
  ParserExecutionResult,
  ParserFamily,
} from "./parserTypes";
import { adaptRocetsInputToViewModel } from "./rocets.input.adapter";
import { adaptRocetsOutputToViewModel } from "./rocets.output.adapter";

interface ParsedFileAdapterInput<TParsed = unknown> {
  id: string;
  filename: string;
  descriptor: ParserDescriptor<TParsed>;
  parsed: TParsed;
  diagnostics?: ParserExecutionResult<TParsed>["diagnostics"];
}

type ParsedFileAdapter<TParsed = unknown> = (
  input: ParsedFileAdapterInput<TParsed>,
) => ParsedFileViewModel<TParsed>;

type AdapterKey = `${ParserFamily}:${ParserDirection}`;

interface AdapterRegistryEntry {
  family: ParserFamily;
  direction: ParserDirection;
  adapter: ParsedFileAdapter;
}

const adapterKey = (family: ParserFamily, direction: ParserDirection): AdapterKey => `${family}:${direction}`;

const adapterEntries: AdapterRegistryEntry[] = [
  {
    family: "mcnp",
    direction: "input",
    adapter: adaptMcnpInputToViewModel,
  },
  {
    family: "mcnp",
    direction: "output",
    adapter: adaptMcnpOutputToViewModel,
  },
  {
    family: "moose",
    direction: "input",
    adapter: adaptMooseInputToViewModel,
  },
  {
    family: "moose",
    direction: "output",
    adapter: adaptMooseOutputToViewModel,
  },
  {
    family: "rocets",
    direction: "input",
    adapter: adaptRocetsInputToViewModel,
  },
  {
    family: "rocets",
    direction: "output",
    adapter: adaptRocetsOutputToViewModel,
  },
];

const adaptersByKey = new Map<AdapterKey, ParsedFileAdapter>(
  adapterEntries.map((entry) => [adapterKey(entry.family, entry.direction), entry.adapter]),
);

export const getParsedFileAdapter = (
  family: ParserFamily,
  direction: ParserDirection,
): ParsedFileAdapter | undefined => adaptersByKey.get(adapterKey(family, direction));

export const canAdaptParsedFile = (descriptor: ParserDescriptor): boolean =>
  getParsedFileAdapter(descriptor.family, descriptor.direction) !== undefined;

export const adaptParsedEngineeringFile = <TParsed = unknown>(input: {
  id: string;
  filename: string;
  result: ParserExecutionResult<TParsed>;
}): ParsedFileViewModel<TParsed> | undefined => {
  if (input.result.status !== "parsed") {
    return undefined;
  }

  const { descriptor, parsed, diagnostics } = input.result;
  const adapter = getParsedFileAdapter(descriptor.family, descriptor.direction) as
    | ParsedFileAdapter<TParsed>
    | undefined;

  if (!adapter) {
    return createParsedFileViewModel({
      id: input.id,
      filename: input.filename,
      descriptor,
      parsed,
      diagnostics,
    });
  }

  return adapter({
    id: input.id,
    filename: input.filename,
    descriptor,
    parsed,
    diagnostics,
  });
};

export const parsedFileAdapterRegistry = Object.freeze({
  entries: adapterEntries,
  canAdapt: canAdaptParsedFile,
  getAdapter: getParsedFileAdapter,
  adapt: adaptParsedEngineeringFile,
});