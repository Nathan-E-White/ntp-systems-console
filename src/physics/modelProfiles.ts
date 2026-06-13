import type {EngineInputs} from '../types/EngineState';
import type {ParameterBasis} from './referenceBasis';

export type ModelProfileId = 'peweeInspired' | 'thermalInvestigation' | 'legacyDemo';

export interface ReferenceProfile {
    readonly id: ModelProfileId;
    readonly label: string;
    readonly description: string;
    readonly inputs: EngineInputs;
    readonly expectedPosture: 'nominal' | 'watch' | 'limit';
    readonly basis: readonly ParameterBasis[];
}

export const PEWEE_THRUST_KN = 25_000 * 4.4482216152605 / 1_000;
export const PEWEE_IDEAL_ISP_SEC = 875;
export const PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC = PEWEE_THRUST_KN * 1_000
    / (PEWEE_IDEAL_ISP_SEC * 9.80665);

const representativeChannelInputs: Pick<EngineInputs,
    | 'channelLengthM'
    | 'channelHydraulicDiameterM'
    | 'channelCount'
    | 'channelRoughnessM'
    | 'channelInletLossCoefficient'
    | 'channelExitLossCoefficient'
    | 'channelWallCriterionK'
    | 'nozzleEfficiency'
    | 'ambientPressureKpa'
    | 'thermalCouplingMode'
    | 'thermalCouplingEfficiency'
    | 'overrideRationale'
> = {
    channelLengthM: 1.3716,
    channelHydraulicDiameterM: 0.00254,
    channelCount: 19 * 402,
    channelRoughnessM: 0,
    channelInletLossCoefficient: 0.5,
    channelExitLossCoefficient: 1,
    channelWallCriterionK: 2750,
    nozzleEfficiency: 0.965,
    ambientPressureKpa: 0,
    thermalCouplingMode: 'benchmarkClosure',
    thermalCouplingEfficiency: 0.78,
    overrideRationale: '',
};

export const MODEL_PROFILES: Readonly<Record<ModelProfileId, ReferenceProfile>> = {
    peweeInspired: {
        id: 'peweeInspired',
        label: 'Pewee-Inspired Rated Point',
        description: 'Public Pewee-scale benchmark with representative NERVA-family channel geometry.',
        expectedPosture: 'watch',
        inputs: {
            modelProfileId: 'peweeInspired',
            thermalPowerMw: 500,
            massFlowKgPerSec: PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC,
            inletTemperatureK: 298.15,
            chamberPressureMpa: 5.17,
            nozzleExpansionRatio: 100,
            controlDrumAngleDeg: 45,
            fuelTemperatureLimitK: 2750,
            shieldingMassFraction: 0.08,
            missionMode: 'steadyBurn',
            ...representativeChannelInputs,
        },
        basis: [
            basis('pewee-power', 'Thermal power', 'published', 500, 'MWth', 'nasem-25977-ch2', 'Table 2.1'),
            basis('pewee-thrust', 'Thrust', 'published', PEWEE_THRUST_KN, 'kN', 'nasem-25977-ch2', 'Table 2.1'),
            basis('pewee-propellant-exit', 'Propellant exit temperature', 'published', 2550, 'K', 'nasem-25977-ch2', 'Table 2.1'),
            basis('pewee-peak-fuel', 'Peak fuel comparison temperature', 'published', 2750, 'K', 'nasem-25977-ch2', 'Table 2.1'),
            basis('pewee-ideal-isp', 'Ideal vacuum specific impulse', 'published', 875, 's', 'nasem-25977-ch2', 'Table 2.1'),
            {
                id: 'pewee-derived-flow',
                label: 'Mass flow derived from published thrust and ideal Isp',
                classification: 'derived',
                originalValue: PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC,
                unit: 'kg/s',
                rationale: 'm_dot = F / (Isp g0); this is a closure value, not a reported Pewee measurement.',
            },
            basis('representative-channel-length', 'Representative fuel-element length', 'published', 1.3716, 'm', 'nasa-tm-105867', 'p. 3: 54-inch NERVA elements'),
            {
                id: 'representative-channel-geometry',
                label: 'Representative channel diameter and total channel count',
                classification: 'user-supplied',
                rationale: 'Presentation-scale NERVA-family geometry; not asserted as the Pewee core configuration.',
            },
        ],
    },
    thermalInvestigation: {
        id: 'thermalInvestigation',
        label: 'Thermal Margin Investigation',
        description: 'Pewee-inspired benchmark with an analyst-selected higher power-to-flow ratio.',
        expectedPosture: 'limit',
        inputs: {
            ...representativeChannelInputs,
            modelProfileId: 'thermalInvestigation',
            thermalPowerMw: 535,
            massFlowKgPerSec: 11.8,
            inletTemperatureK: 298.15,
            chamberPressureMpa: 5.17,
            nozzleExpansionRatio: 100,
            controlDrumAngleDeg: 60,
            fuelTemperatureLimitK: 2750,
            shieldingMassFraction: 0.09,
            missionMode: 'steadyBurn',
            thermalCouplingMode: 'fixedEfficiency',
            thermalCouplingEfficiency: 0.78,
            channelWallCriterionK: 2500,
            overrideRationale: 'Analyst-defined high power-to-flow condition with a 2500 K screening wall criterion; external fixtures were not rerun.',
        },
        basis: [{
            id: 'thermal-investigation-definition',
            label: 'Investigation input changes',
            classification: 'user-supplied',
            rationale: 'Deliberate what-if departure from the public benchmark for workflow demonstration.',
        }],
    },
    legacyDemo: {
        id: 'legacyDemo',
        label: 'Legacy Demo Model',
        description: 'Preserved unsupported coefficients for regression comparison only.',
        expectedPosture: 'nominal',
        inputs: {
            ...representativeChannelInputs,
            modelProfileId: 'legacyDemo',
            thermalPowerMw: 450,
            massFlowKgPerSec: 14,
            inletTemperatureK: 120,
            chamberPressureMpa: 4.1,
            nozzleExpansionRatio: 80,
            controlDrumAngleDeg: 45,
            fuelTemperatureLimitK: 2850,
            shieldingMassFraction: 0.08,
            missionMode: 'startup',
            thermalCouplingMode: 'fixedEfficiency',
            thermalCouplingEfficiency: 0.82,
            overrideRationale: 'Legacy regression profile only.',
        },
        basis: [{
            id: 'legacy-model',
            label: 'Legacy demonstration coefficients',
            classification: 'legacy-unsupported',
            rationale: 'Retained only to show the prior implementation and protect regression comparisons.',
        }],
    },
};

function basis(
    id: string,
    label: string,
    classification: ParameterBasis['classification'],
    originalValue: number,
    unit: string,
    referenceId: string,
    locator: string,
): ParameterBasis {
    return {id, label, classification, originalValue, unit, referenceId, locator, rationale: 'Public benchmark value.'};
}
