import {create} from 'zustand';

import type {EngineInputs} from '../types/EngineState';
import {MODEL_PROFILES} from '../physics/modelProfiles';
import {derivePeweeClosureEfficiency} from '../physics/representativeChannelModel';

export type EngineVisualizationMode = 'systems' | 'thermal' | 'flow' | 'review';
export type EngineWorkspace = 'reactor' | 'propulsion' | 'transients' | 'review';
export type EnginePresetId = 'baselineStartup' | 'thermalMarginInvestigation';
export type EngineCaseSelection = EnginePresetId | 'customWhatIf';

export interface EngineStoreState {
    inputs: EngineInputs;
    selectedPresetId: EngineCaseSelection;
    basePresetId: EnginePresetId;
    selectedChannelStationIndex: number | null;
    visualizationMode: EngineVisualizationMode;
    activeWorkspace: EngineWorkspace;
    demoResetRevision: number;
    setInput: <Key extends keyof EngineInputs>(key: Key, value: EngineInputs[Key]) => void;
    setSelectedChannelStationIndex: (stationIndex: number | null) => void;
    setVisualizationMode: (visualizationMode: EngineVisualizationMode) => void;
    focusWorkspace: (activeWorkspace: EngineWorkspace) => void;
    loadPreset: (presetId: EnginePresetId) => void;
    resetDemo: () => void;
}

export const ENGINE_INPUT_PRESETS: Record<EnginePresetId, EngineInputs> = {
    baselineStartup: MODEL_PROFILES.peweeInspired.inputs,
    thermalMarginInvestigation: MODEL_PROFILES.thermalInvestigation.inputs,
};

export const DEFAULT_ENGINE_PRESET_ID: EnginePresetId = 'baselineStartup';
export const DEFAULT_ENGINE_INPUTS: EngineInputs = ENGINE_INPUT_PRESETS[DEFAULT_ENGINE_PRESET_ID];

export const useEngineStore = create<EngineStoreState>((set) => ({
    inputs: DEFAULT_ENGINE_INPUTS,
    selectedPresetId: DEFAULT_ENGINE_PRESET_ID,
    basePresetId: DEFAULT_ENGINE_PRESET_ID,
    selectedChannelStationIndex: null,
    visualizationMode: 'systems',
    activeWorkspace: 'reactor',
    demoResetRevision: 0,
    setInput: (key, value) => {
        set((state) => {
            const closingEfficiency = state.inputs.thermalCouplingMode === 'benchmarkClosure'
                ? derivePeweeClosureEfficiency(state.inputs) ?? state.inputs.thermalCouplingEfficiency
                : state.inputs.thermalCouplingEfficiency;
            return {
                inputs: {
                    ...state.inputs,
                    thermalCouplingMode: key === 'thermalCouplingMode'
                        ? value as EngineInputs['thermalCouplingMode']
                        : 'fixedEfficiency',
                    thermalCouplingEfficiency: key === 'thermalCouplingEfficiency'
                        ? value as number
                        : closingEfficiency,
                    [key]: value,
                },
                selectedPresetId: 'customWhatIf',
            };
        });
    },
    setSelectedChannelStationIndex: (selectedChannelStationIndex) => set({selectedChannelStationIndex}),
    setVisualizationMode: (visualizationMode) => set({visualizationMode}),
    focusWorkspace: (activeWorkspace) => set({activeWorkspace}),
    loadPreset: (presetId) => {
        set({
            inputs: ENGINE_INPUT_PRESETS[presetId],
            selectedPresetId: presetId,
            basePresetId: presetId,
            visualizationMode: presetId === 'thermalMarginInvestigation' ? 'thermal' : 'systems',
            selectedChannelStationIndex: null,
        });
    },
    resetDemo: () => {
        set((state) => ({
            inputs: DEFAULT_ENGINE_INPUTS,
            selectedPresetId: DEFAULT_ENGINE_PRESET_ID,
            basePresetId: DEFAULT_ENGINE_PRESET_ID,
            visualizationMode: 'systems',
            activeWorkspace: 'reactor',
            selectedChannelStationIndex: null,
            demoResetRevision: state.demoResetRevision + 1,
        }));
    },
}));
