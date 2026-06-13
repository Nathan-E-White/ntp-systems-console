import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import type {BasisDiagnostic} from './referenceBasis';
import type {ChannelStation, RepresentativeChannelResult} from './representativeChannelModel';

export type AxialRegionId = 'core-a' | 'core-b' | 'core-c';
export type ReviewFlagSeverity = 'information' | 'watch' | 'limit' | 'incomplete';

export interface AxialRegionMapping {
    readonly id: AxialRegionId;
    readonly label: string;
    readonly normalizedStart: number;
    readonly normalizedEnd: number;
    readonly stationIndices: readonly number[];
    readonly evidenceLabel: string;
}

export interface EngineeringReviewFlag {
    readonly id: string;
    readonly severity: ReviewFlagSeverity;
    readonly title: string;
    readonly message: string;
    readonly source: string;
    readonly stationIndex?: number;
    readonly recommendedAction: string;
    readonly clearingCondition: string;
}

export interface EvidenceCorrelationRecord {
    readonly id: string;
    readonly discipline: 'neutronics' | 'thermal' | 'propulsion';
    readonly calculatedLabel: string;
    readonly calculatedValue: string;
    readonly fixtureArtifactId: string;
    readonly fixtureLabel: string;
    readonly interpretation: string;
    readonly claimBoundary: string;
}

export interface ChannelAnalysisResult {
    readonly stations: readonly ChannelStation[];
    readonly selectedStation: ChannelStation | null;
    readonly peakWallStation: ChannelStation | null;
    readonly axialRegions: readonly AxialRegionMapping[];
    readonly reviewFlags: readonly EngineeringReviewFlag[];
    readonly evidenceCorrelations: readonly EvidenceCorrelationRecord[];
    readonly claimBoundary: string;
}

export function buildChannelAnalysisResult(
    inputs: EngineInputs,
    outputs: EngineOutputs,
    channel: RepresentativeChannelResult | null,
    selectedStationIndex: number | null,
): ChannelAnalysisResult {
    const stations = channel?.stations ?? [];
    const peakWallStation = maxBy(stations, (station) => station.wallTemperatureK);
    const selectedStation = stations.find((station) => station.index === selectedStationIndex)
        ?? peakWallStation;
    return {
        stations,
        selectedStation,
        peakWallStation,
        axialRegions: buildAxialRegions(stations),
        reviewFlags: buildReviewFlags(inputs, outputs, channel, peakWallStation),
        evidenceCorrelations: buildEvidenceCorrelations(inputs, outputs, channel, peakWallStation),
        claimBoundary: 'One representative steady one-dimensional channel is correlated qualitatively with immutable synthetic fixture evidence. It is not a full-core reconstruction, transient solver, or validation result.',
    };
}

export function getAxialRegionForStation(station: ChannelStation | null): AxialRegionId | null {
    if (!station) return null;
    if (station.normalizedPosition < 1 / 3) return 'core-a';
    if (station.normalizedPosition < 2 / 3) return 'core-b';
    return 'core-c';
}

function buildAxialRegions(stations: readonly ChannelStation[]): AxialRegionMapping[] {
    const definitions: Array<Omit<AxialRegionMapping, 'stationIndices'>> = [
        {id: 'core-a', label: 'Core A', normalizedStart: 0, normalizedEnd: 1 / 3, evidenceLabel: 'MCNP cells 23-28 / F4:N'},
        {id: 'core-b', label: 'Core B', normalizedStart: 1 / 3, normalizedEnd: 2 / 3, evidenceLabel: 'MCNP cells 29-34 / F14:N'},
        {id: 'core-c', label: 'Core C', normalizedStart: 2 / 3, normalizedEnd: 1, evidenceLabel: 'MCNP cells 35-40 / F24:N'},
    ];
    return definitions.map((definition, index) => ({
        ...definition,
        stationIndices: stations
            .filter((station) => index === 2
                ? station.normalizedPosition >= definition.normalizedStart
                : station.normalizedPosition >= definition.normalizedStart
                    && station.normalizedPosition < definition.normalizedEnd)
            .map((station) => station.index),
    }));
}

function buildReviewFlags(
    inputs: EngineInputs,
    outputs: EngineOutputs,
    channel: RepresentativeChannelResult | null,
    peakWallStation: ChannelStation | null,
): EngineeringReviewFlag[] {
    if (!channel) {
        return [{
            id: 'legacy-channel-unavailable',
            severity: 'incomplete',
            title: 'Channel result unavailable',
            message: 'The legacy regression profile does not produce a reference-controlled channel solution.',
            source: 'Legacy profile boundary',
            recommendedAction: 'Return to the Pewee-inspired benchmark or thermal-margin investigation.',
            clearingCondition: 'Select a reference-controlled profile.',
        }];
    }

    const flags: EngineeringReviewFlag[] = [];
    if (outputs.channelWallCriterionMarginK < 0) {
        flags.push({
            id: 'wall-criterion-exceeded',
            severity: 'limit',
            title: 'Channel wall criterion exceeded',
            message: `Peak wall temperature exceeds the selected criterion by ${Math.abs(outputs.channelWallCriterionMarginK).toFixed(0)} K.`,
            source: 'Representative channel solution',
            stationIndex: peakWallStation?.index,
            recommendedAction: 'Trade power, flow, channel geometry, and the material basis before emphasizing performance.',
            clearingCondition: 'Restore positive criterion margin with an applicable qualified limit.',
        });
    }
    flags.push({
        id: 'pressure-basis-incomplete',
        severity: 'incomplete',
        title: 'Whole-engine pressure basis incomplete',
        message: 'The calculated pressure drop covers the representative heated channel, not valves, manifolds, pumps, turbine branches, or regenerative hardware.',
        source: 'ELM-style channel momentum balance',
        recommendedAction: 'Add component maps or user-controlled pressure losses before making a feed-system conclusion.',
        clearingCondition: 'Resolve and cite the remaining system pressure-loss terms.',
    });
    addDiagnosticFlag(flags, channel.diagnostics, 'taylor-range-', {
        id: 'friction-correlation-range',
        title: 'Friction correlation outside range',
        source: 'Taylor smooth-tube correlation',
        recommendedAction: 'Select an applicable correlation or revise the channel basis.',
        clearingCondition: 'All station Reynolds numbers fall within the encoded applicability range.',
    });
    addDiagnosticFlag(flags, channel.diagnostics, 'wolf-range-', {
        id: 'heat-transfer-correlation-range',
        title: 'Heat-transfer correlation outside range',
        source: 'Modified Wolf-McCarthy correlation',
        recommendedAction: 'Review wall-to-bulk temperature ratio and replace the correlation when necessary.',
        clearingCondition: 'All stations satisfy the encoded correlation limits.',
    });
    if (channel.diagnostics.some((diagnostic) => diagnostic.id === 'transport-property-closure')) {
        flags.push({
            id: 'transport-property-screening',
            severity: 'watch',
            title: 'Transport properties use screening closures',
            message: 'Hydrogen viscosity and thermal conductivity are approximate closures rather than a validated high-pressure property package.',
            source: 'Hydrogen transport-property provider',
            recommendedAction: 'Replace screening closures with a validated real-gas property source.',
            clearingCondition: 'Validated transport properties cover the complete pressure-temperature envelope.',
        });
    }
    flags.push({
        id: 'transient-model-unavailable',
        severity: 'information',
        title: 'Transient channel response unavailable',
        message: 'The axial solution is steady; the displayed mission timeline is an illustrative sequence of independently evaluated points.',
        source: 'Model scope',
        recommendedAction: 'Use a time-integrated thermal-hydraulic model for startup, shutdown, and restart conclusions.',
        clearingCondition: 'A transient conservation model and validation basis are supplied.',
    });
    if (inputs.overrideRationale.trim()) {
        flags.push({
            id: 'user-override-active',
            severity: 'watch',
            title: 'User override active',
            message: inputs.overrideRationale.trim(),
            source: 'Operator-entered rationale',
            recommendedAction: 'Include the override and its source in the focused review record.',
            clearingCondition: 'Restore the cited profile value or disposition the override in review.',
        });
    }
    return flags;
}

function addDiagnosticFlag(
    flags: EngineeringReviewFlag[],
    diagnostics: readonly BasisDiagnostic[],
    diagnosticPrefix: string,
    basis: Omit<EngineeringReviewFlag, 'severity' | 'message' | 'stationIndex'>,
) {
    const matches = diagnostics.filter((diagnostic) => diagnostic.id.startsWith(diagnosticPrefix));
    if (!matches.length) return;
    const stationNumber = Number(matches[0].id.slice(diagnosticPrefix.length));
    flags.push({
        ...basis,
        severity: 'watch',
        message: `${matches.length} axial station(s) exceed the encoded applicability range.`,
        stationIndex: Number.isFinite(stationNumber) ? stationNumber : undefined,
    });
}

function buildEvidenceCorrelations(
    inputs: EngineInputs,
    outputs: EngineOutputs,
    channel: RepresentativeChannelResult | null,
    peakWallStation: ChannelStation | null,
): EvidenceCorrelationRecord[] {
    if (!channel) return [];
    const peakRegion = getAxialRegionForStation(peakWallStation)?.replace('core-', 'Core ').toUpperCase() ?? 'unknown';
    return [
        {
            id: 'channel-to-mcnp-axial',
            discipline: 'neutronics',
            calculatedLabel: 'Axial deposited-power shape',
            calculatedValue: `Peak channel wall response in ${peakRegion}`,
            fixtureArtifactId: 'mcnp-output',
            fixtureLabel: 'ntp_mcnp.out axial flux totals',
            interpretation: 'Use the shared A/B/C axial partition to ask whether the synthetic transport peaking and the channel hot location are directionally consistent.',
            claimBoundary: 'Flux proxy and deposited heat are not interchangeable; no transport-to-thermal normalization is asserted.',
        },
        {
            id: 'channel-to-moose-temperature',
            discipline: 'thermal',
            calculatedLabel: 'Peak channel wall temperature',
            calculatedValue: `${outputs.peakChannelWallTemperatureK.toFixed(0)} K at station ${(peakWallStation?.index ?? 0) + 1}`,
            fixtureArtifactId: 'moose-output',
            fixtureLabel: 'ntp_moose.out thermal constraints',
            interpretation: 'Compare location, trend, and limiting discipline before requesting a coupled hot-channel calculation.',
            claimBoundary: 'The fixture peak fuel and stress values are synthetic and describe different quantities than the calculated fluid-channel wall.',
        },
        {
            id: 'channel-to-rocets-flow',
            discipline: 'propulsion',
            calculatedLabel: 'Channel flow and pressure loss',
            calculatedValue: `${inputs.massFlowKgPerSec.toFixed(2)} kg/s; ${outputs.pressureDropMpa.toFixed(3)} MPa channel drop`,
            fixtureArtifactId: 'rocets-output',
            fixtureLabel: 'ntp_rocet.out feed and stability channels',
            interpretation: 'Use the immutable engine-system trace to identify the pump, turbine, and stability records needed to close the whole-path pressure basis.',
            claimBoundary: 'The reduced-order channel result is not substituted into or overlaid with the ROCETS-like fixture.',
        },
    ];
}

function maxBy<T>(values: readonly T[], selector: (value: T) => number): T | null {
    return values.reduce<T | null>((best, value) =>
        best === null || selector(value) > selector(best) ? value : best, null);
}
