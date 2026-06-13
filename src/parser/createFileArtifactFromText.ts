

import { adaptParsedEngineeringFile } from "./parsedFileAdapterRegistry";
import { createParsedFileId } from "./parsedFileViewModel";
import { parseKnownEngineeringFile } from "./parserRegistry";
import type { FileArtifact, ParserDiagnostic } from "./parserTypes";

export interface CreateFileArtifactFromTextInput {
  filename: string;
  text: string;
  id?: string;
}

const normalizeFileText = (text: string): string => text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

const createEmptyFileDiagnostic = (filename: string): ParserDiagnostic => ({
  severity: "warning",
  message: `${filename} is empty and cannot be parsed.`,
  source: "createFileArtifactFromText",
  hint: "Provide MCNP, MOOSE, or ROCETS input/output text before parsing.",
});

const createAdaptationFailureDiagnostic = (filename: string): ParserDiagnostic => ({
  severity: "error",
  message: `${filename} parsed successfully, but no parsed-file view model could be created.`,
  source: "createFileArtifactFromText",
  hint: "Check that the parser descriptor has a supported family and direction, and that the adapter registry is wired correctly.",
});

export const createFileArtifactFromText = ({
  filename,
  text,
  id,
}: CreateFileArtifactFromTextInput): FileArtifact<unknown> => {
  const normalizedText = normalizeFileText(text);
  const artifactId = id ?? createParsedFileId(filename, normalizedText);

  if (normalizedText.trim().length === 0) {
    const diagnostics = [createEmptyFileDiagnostic(filename)];

    return {
      id: artifactId,
      filename,
      text: normalizedText,
      parserStatus: "unsupported",
      diagnostics,
      error: diagnostics[0].message,
    };
  }

  const result = parseKnownEngineeringFile(normalizedText, filename);

  if (result.status === "unsupported") {
    return {
      id: artifactId,
      filename,
      text: normalizedText,
      parserStatus: "unsupported",
      diagnostics: result.diagnostics,
      error: result.diagnostics.at(0)?.message,
    };
  }

  if (result.status === "error") {
    return {
      id: artifactId,
      filename,
      text: normalizedText,
      parserStatus: "error",
      diagnostics: result.diagnostics,
      error: result.error,
    };
  }

  const parsed = adaptParsedEngineeringFile({
    id: artifactId,
    filename,
    result,
  });

  if (!parsed) {
    const diagnostics = [createAdaptationFailureDiagnostic(filename), ...result.diagnostics];

    return {
      id: artifactId,
      filename,
      text: normalizedText,
      parserStatus: "error",
      diagnostics,
      error: diagnostics[0].message,
    };
  }

  return {
    id: artifactId,
    filename,
    text: normalizedText,
    parserStatus: "parsed",
    parsed,
    diagnostics: parsed.diagnostics,
  };
};