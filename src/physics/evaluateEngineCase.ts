import {
    type EngineInputs,
    type EngineOutputs,
    type ReferenceControlledEngineOutputs,
} from '../types/EngineState';
import type {
    CalculationNode,
    CalculationTerm,
    ModelAssumption,
    ModelEvaluation,
} from './calculationTrace';
import {evaluateNozzlePerformance} from './nozzlePerformance';
import {solveRepresentativeChannel} from './representativeChannelModel';
import type {BasisDiagnostic, ModelBasisSummary} from './referenceBasis';

const G0_M_PER_S2 = 9.80665;

const n = (value: number, digits = 3): string => Number(value.toFixed(digits)).toLocaleString();
const term = (
    symbol: string,
    label: string,
    value: number | string,
    unit: string,
    extra: Partial<CalculationTerm> = {},
): CalculationTerm => ({symbol, label, value, unit, ...extra});
const assumption = (label: string, detail: string, active = true): ModelAssumption =>
    ({label, detail, active});

export function evaluateEngineCase(inputs: EngineInputs): ModelEvaluation {
    const channel = solveRepresentativeChannel(inputs);
    const nozzle = evaluateNozzlePerformance({
        chamberTemperatureK: channel.outletTemperatureK,
        chamberPressureMpa: inputs.chamberPressureMpa,
        expansionRatio: inputs.nozzleExpansionRatio,
        massFlowKgPerSec: inputs.massFlowKgPerSec,
        nozzleEfficiency: inputs.nozzleEfficiency,
        ambientPressureKpa: inputs.ambientPressureKpa,
    });
    const diagnostics = deduplicate([...channel.diagnostics, ...nozzle.diagnostics]);
    const wallCriterionMarginK = inputs.channelWallCriterionK - channel.peakWallTemperatureK;
    const completeness = deriveCompleteness(diagnostics);
    const basisCompletenessPercent = completeness === 'incomplete' ? 0 : completeness === 'screening' ? 70 : 100;
    const reviewPosture: ReferenceControlledEngineOutputs['reviewPosture'] = wallCriterionMarginK < 0
        ? 'limit'
        : completeness === 'complete' ? 'nominal' : 'watch';
    const outputs: EngineOutputs = {
        outletTemperatureK: channel.outletTemperatureK,
        exhaustVelocityMPerSec: nozzle.deliveredExitVelocityMPerSec,
        specificImpulseSec: nozzle.specificImpulseSec,
        thrustKn: nozzle.thrustKn,
        peakChannelWallTemperatureK: channel.peakWallTemperatureK,
        channelWallCriterionMarginK: wallCriterionMarginK,
        pressureDropMpa: channel.pressureDropMpa,
        basisCompletenessPercent,
        reviewPosture,
    };
    const nodes = buildReferenceNodes(inputs, outputs, channel, nozzle, diagnostics);
    return {
        outputs,
        trace: {nodes},
        basis: buildBasisSummary(inputs, completeness, diagnostics),
        channel,
    };
}
function buildReferenceNodes(
    inputs: EngineInputs,
    outputs: EngineOutputs,
    channel: ReturnType<typeof solveRepresentativeChannel>,
    nozzle: ReturnType<typeof evaluateNozzlePerformance>,
    diagnostics: readonly BasisDiagnostic[],
): CalculationNode[] {
    const sharedChannel = {
        referenceId: 'nasa-tm-105867',
        sourceLocator: 'pp. 5-6, 11, 16-26; equations and program listing',
        validity: 'Representative one-dimensional steady channel; correlation ranges are checked by station.',
        diagnostics: channel.diagnostics,
    };
    const sharedNozzle = {
        referenceId: 'nasa-glenn-thrust',
        sourceLocator: 'Generalized thrust equation',
        validity: 'Ideal frozen molecular hydrogen with a user-visible lumped nozzle efficiency.',
        diagnostics: nozzle.diagnostics,
    };
    return [
        {
            id: 'outlet-temperature',
            outputKey: 'outletTemperatureK',
            label: 'Hydrogen outlet temperature',
            equationId: 'RC-TH-101',
            equationText: 'eta P = m_dot [h(T_out) - h(T_in)]',
            classification: 'physical-relation',
            dependencies: [],
            terms: [
                term('eta', 'Thermal coupling efficiency', channel.thermalCouplingEfficiency, '', {inputKey: 'thermalCouplingEfficiency'}),
                term('P', 'Reactor thermal power', inputs.thermalPowerMw, 'MWth', {inputKey: 'thermalPowerMw'}),
                term('m_dot', 'Hydrogen mass flow', inputs.massFlowKgPerSec, 'kg/s', {inputKey: 'massFlowKgPerSec'}),
                term('T_in', 'Gas-model inlet temperature', inputs.inletTemperatureK, 'K', {inputKey: 'inletTemperatureK'}),
            ],
            substitution: `${n(channel.thermalCouplingEfficiency, 5)} x ${n(inputs.thermalPowerMw)} MW = ${n(inputs.massFlowKgPerSec)} kg/s x Delta h -> ${n(outputs.outletTemperatureK)} K`,
            rawValue: outputs.outletTemperatureK,
            finalValue: outputs.outletTemperatureK,
            unit: 'K',
            assumptions: [
                assumption('NIST ideal-gas enthalpy', 'Hydrogen enthalpy uses the NIST Shomate equations from 298 to 6000 K.'),
                assumption('Benchmark closure', 'Efficiency is derived to close the 2550 K Pewee benchmark.', inputs.thermalCouplingMode === 'benchmarkClosure'),
            ],
            limitation: 'The inlet must be within the implemented ideal-gas range; cryogenic real-fluid behavior and dissociation are not solved.',
            basisId: 'nist-shomate-hydrogen',
            referenceId: 'nist-srd69-h2',
            sourceLocator: 'Gas Phase Heat Capacity, Shomate Equation coefficient table',
            validity: '298-6000 K ideal-gas standard-state thermochemistry.',
            diagnostics,
        },
        {
            id: 'fuel-temperature',
            outputKey: 'peakChannelWallTemperatureK',
            label: 'Peak channel-wall temperature',
            equationId: 'RC-TH-102',
            equationText: 'q = h_c A_s (T_wall - T_bulk)',
            classification: 'empirical-screening-correlation',
            dependencies: ['outlet-temperature'],
            terms: [
                term('q', 'Deposited channel power', channel.depositedPowerMw, 'MW'),
                term('D_h', 'Hydraulic diameter', inputs.channelHydraulicDiameterM, 'm', {inputKey: 'channelHydraulicDiameterM'}),
                term('N_ch', 'Channel count', inputs.channelCount, '', {inputKey: 'channelCount'}),
                term('L', 'Channel length', inputs.channelLengthM, 'm', {inputKey: 'channelLengthM'}),
            ],
            substitution: `${channel.stations.length} axial stations; peak T_wall = ${n(outputs.peakChannelWallTemperatureK)} K`,
            rawValue: outputs.peakChannelWallTemperatureK,
            finalValue: outputs.peakChannelWallTemperatureK,
            unit: 'K',
            assumptions: [assumption('Representative geometry', 'Channel geometry is a user-visible NERVA-family screening basis, not a Pewee reconstruction.')],
            limitation: 'Peak wall temperature is not peak fuel temperature. Solid conduction, coating, hot-channel factors, and material degradation are absent.',
            basisId: 'elm-modified-wolf-mccarthy',
            ...sharedChannel,
        },
        {
            id: 'thermal-margin',
            outputKey: 'channelWallCriterionMarginK',
            label: 'Channel wall criterion margin',
            equationId: 'RC-TH-103',
            equationText: 'M_wall = T_criterion - max(T_wall)',
            classification: 'derived-quantity',
            dependencies: ['fuel-temperature'],
            terms: [
                term('T_criterion', 'User-selected wall criterion', inputs.channelWallCriterionK, 'K', {inputKey: 'channelWallCriterionK'}),
                term('T_wall,max', 'Calculated peak channel-wall temperature', outputs.peakChannelWallTemperatureK, 'K', {sourceNodeId: 'fuel-temperature'}),
            ],
            substitution: `${n(inputs.channelWallCriterionK)} - ${n(outputs.peakChannelWallTemperatureK)} = ${n(outputs.channelWallCriterionMarginK)} K`,
            rawValue: outputs.channelWallCriterionMarginK,
            finalValue: outputs.channelWallCriterionMarginK,
            unit: 'K',
            assumptions: [assumption('Unqualified criterion', 'The selected criterion is not a qualified fuel or material allowable.')],
            limitation: 'This is a screening margin against a user-selected wall criterion, not a qualified fuel-performance margin.',
            basisId: 'channel-wall-criterion',
        },
        {
            id: 'pressure-drop',
            outputKey: 'pressureDropMpa',
            label: 'Representative channel pressure drop',
            equationId: 'RC-FL-101',
            equationText: 'Delta p = sum(Delta p_friction + Delta p_acceleration + Delta p_minor)',
            classification: 'physical-relation',
            dependencies: ['outlet-temperature'],
            terms: [
                term('K_in', 'Entrance loss coefficient', inputs.channelInletLossCoefficient, '', {inputKey: 'channelInletLossCoefficient'}),
                term('K_out', 'Exit loss coefficient', inputs.channelExitLossCoefficient, '', {inputKey: 'channelExitLossCoefficient'}),
                term('epsilon_r', 'Channel roughness', inputs.channelRoughnessM, 'm', {inputKey: 'channelRoughnessM'}),
            ],
            substitution: `Taylor friction + acceleration + entrance/exit losses = ${n(outputs.pressureDropMpa, 5)} MPa`,
            rawValue: outputs.pressureDropMpa,
            finalValue: outputs.pressureDropMpa,
            unit: 'MPa',
            assumptions: [assumption('Core channel only', 'Feed-system, pump, valve, manifold, and turbomachinery pressure losses are not included.')],
            limitation: 'A one-dimensional representative channel result; pressure basis remains incomplete without component maps and feed-system geometry.',
            basisId: 'elm-taylor-friction',
            ...sharedChannel,
        },
        {
            id: 'exhaust-velocity',
            outputKey: 'exhaustVelocityMPerSec',
            label: 'Delivered-equivalent exit velocity',
            equationId: 'RC-PR-101',
            equationText: 'V_e = M_e sqrt(gamma R T_e) sqrt(eta_n)',
            classification: 'physical-relation',
            dependencies: ['outlet-temperature'],
            terms: [
                term('epsilon', 'Nozzle area ratio', inputs.nozzleExpansionRatio, ':1', {inputKey: 'nozzleExpansionRatio'}),
                term('eta_n', 'Nozzle performance factor', inputs.nozzleEfficiency, '', {inputKey: 'nozzleEfficiency'}),
                term('M_e', 'Solved exit Mach number', nozzle.exitMach, ''),
            ],
            substitution: `${n(nozzle.idealExitVelocityMPerSec)} x sqrt(${n(inputs.nozzleEfficiency, 4)}) = ${n(outputs.exhaustVelocityMPerSec)} m/s`,
            rawValue: nozzle.idealExitVelocityMPerSec,
            finalValue: outputs.exhaustVelocityMPerSec,
            unit: 'm/s',
            assumptions: [assumption('Frozen ideal hydrogen', 'Equilibrium chemistry and dissociation require NASA CEA or equivalent.')],
            limitation: 'The loss factor is lumped and user-visible; cooling, divergence, and boundary-layer losses are not independently resolved.',
            basisId: 'isentropic-nozzle',
            ...sharedNozzle,
        },
        {
            id: 'thrust',
            outputKey: 'thrustKn',
            label: 'Generalized nozzle thrust',
            equationId: 'RC-PR-102',
            equationText: 'F = m_dot V_e + (p_e - p_a) A_e',
            classification: 'physical-relation',
            dependencies: ['exhaust-velocity'],
            terms: [
                term('m_dot', 'Hydrogen mass flow', inputs.massFlowKgPerSec, 'kg/s', {inputKey: 'massFlowKgPerSec'}),
                term('p_e', 'Exit pressure', nozzle.exitPressureKpa, 'kPa'),
                term('p_a', 'Ambient pressure', inputs.ambientPressureKpa, 'kPa', {inputKey: 'ambientPressureKpa'}),
                term('A_e', 'Exit area', nozzle.exitAreaM2, 'm2'),
            ],
            substitution: `${n(inputs.massFlowKgPerSec)} x ${n(outputs.exhaustVelocityMPerSec)} + ${n(nozzle.pressureThrustKn)} kN pressure thrust = ${n(outputs.thrustKn)} kN`,
            rawValue: outputs.thrustKn,
            finalValue: outputs.thrustKn,
            unit: 'kN',
            assumptions: [],
            limitation: 'Ideal one-dimensional exit state with a lumped nozzle performance factor.',
            basisId: 'generalized-thrust',
            ...sharedNozzle,
        },
        {
            id: 'specific-impulse',
            outputKey: 'specificImpulseSec',
            label: 'Specific impulse',
            equationId: 'RC-PR-103',
            equationText: 'I_sp = F / (m_dot g_0)',
            classification: 'derived-quantity',
            dependencies: ['thrust'],
            terms: [
                term('F', 'Calculated thrust', outputs.thrustKn, 'kN', {sourceNodeId: 'thrust'}),
                term('m_dot', 'Hydrogen mass flow', inputs.massFlowKgPerSec, 'kg/s', {inputKey: 'massFlowKgPerSec'}),
                term('g_0', 'Standard gravity', G0_M_PER_S2, 'm/s2'),
            ],
            substitution: `${n(outputs.thrustKn * 1_000)} / (${n(inputs.massFlowKgPerSec)} x ${G0_M_PER_S2}) = ${n(outputs.specificImpulseSec)} s`,
            rawValue: outputs.specificImpulseSec,
            finalValue: outputs.specificImpulseSec,
            unit: 's',
            assumptions: [],
            limitation: 'Inherits the ideal-gas and lumped nozzle-loss limitations of the thrust calculation.',
            basisId: 'specific-impulse',
            ...sharedNozzle,
        },
        {
            id: 'stability-score',
            outputKey: 'basisCompletenessPercent',
            label: 'Model-basis completeness',
            equationId: 'RC-QA-101',
            equationText: 'C_basis = classify(missing, out-of-range, screening closures)',
            classification: 'presentation-constraint',
            dependencies: ['thermal-margin', 'pressure-drop', 'thrust'],
            terms: [
                term('N_incomplete', 'Incomplete diagnostics', diagnostics.filter((item) => item.severity === 'incomplete').length, ''),
                term('N_warning', 'Screening warnings', diagnostics.filter((item) => item.severity === 'warning').length, ''),
            ],
            substitution: `${diagnostics.length} diagnostic(s) -> ${outputs.basisCompletenessPercent}% ${outputs.reviewPosture}`,
            rawValue: outputs.basisCompletenessPercent,
            finalValue: outputs.basisCompletenessPercent,
            unit: '%',
            assumptions: [assumption('Compatibility field', 'The former stability-score field now carries basis completeness; no synthetic stability index is produced.')],
            limitation: 'Completeness is a review-routing indicator, not engine stability or model validation.',
            basisId: 'basis-completeness',
            diagnostics,
        },
        {
            id: 'stability-posture',
            outputKey: 'reviewPosture',
            label: 'Reference-controlled review posture',
            equationId: 'RC-QA-102',
            equationText: 'posture = limit if M_wall < 0; nominal only if basis complete; otherwise watch',
            classification: 'presentation-constraint',
            dependencies: ['stability-score', 'thermal-margin'],
            terms: [
                term('M_wall', 'Channel wall criterion margin', outputs.channelWallCriterionMarginK, 'K', {sourceNodeId: 'thermal-margin'}),
                term('C_basis', 'Model-basis completeness', outputs.basisCompletenessPercent, '%', {sourceNodeId: 'stability-score'}),
            ],
            substitution: `${n(outputs.channelWallCriterionMarginK)} K margin; ${outputs.basisCompletenessPercent}% basis -> ${outputs.reviewPosture}`,
            rawValue: outputs.reviewPosture,
            finalValue: outputs.reviewPosture,
            unit: '',
            assumptions: [],
            limitation: 'A conservative review flag. Transient stability is unavailable and no qualified acceptance criterion is asserted.',
            basisId: 'review-posture',
            diagnostics,
        },
    ];
}

function buildBasisSummary(
    inputs: EngineInputs,
    completeness: ModelBasisSummary['completeness'],
    diagnostics: readonly BasisDiagnostic[],
): ModelBasisSummary {
    return {
        profileId: inputs.modelProfileId,
        profileLabel: inputs.modelProfileId === 'peweeInspired'
            ? 'Pewee-Inspired Benchmark'
            : 'Thermal Margin Investigation',
        completeness,
        diagnostics,
        activeBasisIds: [
            'pewee-benchmark',
            'nist-shomate-hydrogen',
            'elm-pewee-power-shape',
            'elm-modified-wolf-mccarthy',
            'elm-taylor-friction',
            'isentropic-nozzle',
            'generalized-thrust',
        ],
        claimBoundary: 'Representative Pewee-scale engineering study; not a Pewee reconstruction, qualified material assessment, or validated engine model.',
    };
}

function deriveCompleteness(diagnostics: readonly BasisDiagnostic[]): ModelBasisSummary['completeness'] {
    if (diagnostics.some((item) => item.severity === 'incomplete')) return 'incomplete';
    if (diagnostics.some((item) => item.severity === 'warning')) return 'screening';
    return 'complete';
}

function deduplicate(diagnostics: readonly BasisDiagnostic[]): BasisDiagnostic[] {
    return [...new Map(diagnostics.map((item) => [item.id, item])).values()];
}
