import {create} from 'zustand';

import type {EngineInputs, MissionMode} from '../types/EngineState';

export type EngineVisualizationMode = 'systems' | 'thermal' | 'flow' | 'review';
export type EngineWorkspace = 'reactor' | 'propulsion' | 'transients' | 'review';
export type EnginePresetId = 'baselineStartup' | 'highThrustBurn' | 'thermalMarginWatch' | 'cooldownReview';

export interface EngineStoreState {
    inputs: EngineInputs;
    selectedPresetId: EnginePresetId;
    selectedTransientTimeSec: number;
    visualizationMode: EngineVisualizationMode;
    activeWorkspace: EngineWorkspace;
    setInput: <Key extends keyof EngineInputs>(key: Key, value: EngineInputs[Key]) => void;
    setInputs: (updates: Partial<EngineInputs>) => void;
    setMissionMode: (missionMode: MissionMode) => void;
    setSelectedTransientTimeSec: (selectedTransientTimeSec: number) => void;
    setVisualizationMode: (visualizationMode: EngineVisualizationMode) => void;
    setActiveWorkspace: (activeWorkspace: EngineWorkspace) => void;
    focusWorkspace: (activeWorkspace: EngineWorkspace) => void;
    loadPreset: (presetId: EnginePresetId) => void;
    resetInputs: () => void;
}

export const ENGINE_INPUT_PRESETS: Record<EnginePresetId, EngineInputs> = {
    baselineStartup: {
        thermalPowerMw: 450,
        massFlowKgPerSec: 14,
        inletTemperatureK: 120,
        chamberPressureMpa: 4.1,
        nozzleExpansionRatio: 80,
        controlDrumAngleDeg: 45,
        fuelTemperatureLimitK: 2850,
        shieldingMassFraction: 0.08,
        missionMode: 'startup',
    },
    highThrustBurn: {
        thermalPowerMw: 520,
        massFlowKgPerSec: 17,
        inletTemperatureK: 130,
        chamberPressureMpa: 4.8,
        nozzleExpansionRatio: 90,
        controlDrumAngleDeg: 72,
        fuelTemperatureLimitK: 2875,
        shieldingMassFraction: 0.07,
        missionMode: 'steadyBurn',
    },
    thermalMarginWatch: {
        thermalPowerMw: 535,
        massFlowKgPerSec: 11.8,
        inletTemperatureK: 135,
        chamberPressureMpa: 4.7,
        nozzleExpansionRatio: 82,
        controlDrumAngleDeg: 78,
        fuelTemperatureLimitK: 2800,
        shieldingMassFraction: 0.09,
        missionMode: 'steadyBurn',
    },
    cooldownReview: {
        thermalPowerMw: 165,
        massFlowKgPerSec: 7.2,
        inletTemperatureK: 115,
        chamberPressureMpa: 2.4,
        nozzleExpansionRatio: 65,
        controlDrumAngleDeg: 18,
        fuelTemperatureLimitK: 2850,
        shieldingMassFraction: 0.1,
        missionMode: 'cooldown',
    },
};

export const DEFAULT_ENGINE_PRESET_ID: EnginePresetId = 'baselineStartup';
export const DEFAULT_ENGINE_INPUTS: EngineInputs = ENGINE_INPUT_PRESETS[DEFAULT_ENGINE_PRESET_ID];

const WORKSPACE_VISUALIZATION_MODE: Record<EngineWorkspace, EngineVisualizationMode> = {
    reactor: 'thermal',
    propulsion: 'flow',
    transients: 'systems',
    review: 'review',
};

export const useEngineStore = create<EngineStoreState>((set) => ({
    inputs: DEFAULT_ENGINE_INPUTS,
    selectedPresetId: DEFAULT_ENGINE_PRESET_ID,
    selectedTransientTimeSec: 0,
    visualizationMode: 'systems',
    activeWorkspace: 'reactor',
    setInput: (key, value) => {
        set((state) => ({
            inputs: {
                ...state.inputs,
                [key]: value,
            },
        }));
    },
    setInputs: (updates) => {
        set((state) => ({
            inputs: {
                ...state.inputs,
                ...updates,
            },
        }));
    },
    setMissionMode: (missionMode) => {
        set((state) => ({
            inputs: {
                ...state.inputs,
                missionMode,
            },
        }));
    },
    setSelectedTransientTimeSec: (selectedTransientTimeSec) => {
        set({selectedTransientTimeSec: Math.max(0, selectedTransientTimeSec)});
    },
    setVisualizationMode: (visualizationMode) => {
        set({visualizationMode});
    },
    setActiveWorkspace: (activeWorkspace) => {
        set({activeWorkspace});
    },
    focusWorkspace: (activeWorkspace) => {
        set({
            activeWorkspace,
            visualizationMode: WORKSPACE_VISUALIZATION_MODE[activeWorkspace],
        });
    },
    loadPreset: (presetId) => {
        set({
            inputs: ENGINE_INPUT_PRESETS[presetId],
            selectedPresetId: presetId,
            selectedTransientTimeSec: 0,
        });
    },
    resetInputs: () => {
        set({
            inputs: DEFAULT_ENGINE_INPUTS,
            selectedPresetId: DEFAULT_ENGINE_PRESET_ID,
            selectedTransientTimeSec: 0,
            visualizationMode: 'systems',
            activeWorkspace: 'reactor',
        });
    },
}));