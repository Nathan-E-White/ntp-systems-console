import type {ParserFamily, ParserStatus} from '../../parser/parserTypes';
import type {
    EngineInputs,
    LegacyEngineOutputAliases,
    ReferenceControlledEngineOutputs,
} from '../../types/EngineState';

export type EngineeringValueSource = 'fixture' | 'reduced-order' | 'operator' | 'derived';
export type NumericInputKey = {
    [Key in keyof EngineInputs]: EngineInputs[Key] extends number ? Key : never;
}[keyof EngineInputs];
export type NumericOutputKey = {
    [Key in keyof ReferenceControlledEngineOutputs]:
    ReferenceControlledEngineOutputs[Key] extends number ? Key : never;
}[keyof ReferenceControlledEngineOutputs] & Exclude<string, keyof LegacyEngineOutputAliases>;

export interface EngineeringFixtureReference {
    readonly id: string;
    readonly family: ParserFamily;
    readonly direction: 'input' | 'output';
    readonly filename: string;
    readonly parserStatus: ParserStatus;
    readonly provenance: string;
    readonly validationLabel: string;
}

export interface AnalysisBoundary {
    readonly scope: string;
    readonly owns: readonly string[];
    readonly excludes: readonly string[];
}
