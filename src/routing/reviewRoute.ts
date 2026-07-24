import type {AppSectionId} from '../AppSections';
import type {SceneComponentId} from '../components/visualization/GuidedInvestigation/GuidedInvestigation.model';
import {ENGINE_INPUT_PRESETS, type EngineCaseSelection, type EnginePresetId} from '../state/EngineStore';
import type {EngineInputs} from '../types/EngineState';

export interface ReviewRoute {
    readonly section: AppSectionId;
    readonly focus: SceneComponentId | null;
    readonly caseSelection: EngineCaseSelection;
    readonly basePresetId: EnginePresetId;
    readonly inputChanges: Readonly<Partial<EngineInputs>>;
}

const sections: readonly AppSectionId[] = ['operating-case', 'nuclear-fuel-performance', 'model-evidence', 'review'];
const focusValues: readonly SceneComponentId[] = ['engine-overview', 'reactor-transport', 'reactor-criticality', 'fuel-performance', 'thermal-margin', 'feed-system', 'main-turbopump', 'power-conversion', 'nozzle-performance', 'propulsion-stability'];
const presetIds: readonly EnginePresetId[] = ['baselineStartup', 'thermalMarginInvestigation'];

export function parseReviewRoute(search: string): ReviewRoute {
    const params = new URLSearchParams(search);
    const section = params.get('section');
    const focus = params.get('focus');
    const requestedCase = params.get('case');
    const caseSelection = requestedCase === 'customWhatIf'
        ? 'customWhatIf'
        : isPresetId(requestedCase) ? requestedCase : 'baselineStartup';
    const requestedBase = params.get('base');
    const basePresetId = caseSelection === 'customWhatIf'
        ? isPresetId(requestedBase) ? requestedBase : 'baselineStartup'
        : caseSelection;
    return {
        section: sections.includes(section as AppSectionId) ? section as AppSectionId : 'operating-case',
        focus: focusValues.includes(focus as SceneComponentId) ? focus as SceneComponentId : null,
        caseSelection,
        basePresetId,
        inputChanges: caseSelection === 'customWhatIf' ? parseInputChanges(params.get('inputs'), basePresetId) : {},
    };
}

export function reviewRouteSearch(route: ReviewRoute): string {
    const params = new URLSearchParams({section: route.section, case: route.caseSelection});
    if (route.focus) params.set('focus', route.focus);
    if (route.caseSelection === 'customWhatIf') {
        params.set('base', route.basePresetId);
        const changes = route.inputChanges ?? {};
        if (Object.keys(changes).length > 0) params.set('inputs', JSON.stringify(changes));
    }
    return `?${params.toString()}`;
}

export function changedEngineInputs(inputs: EngineInputs, basePresetId: EnginePresetId): Partial<EngineInputs> {
    const baseline = ENGINE_INPUT_PRESETS[basePresetId];
    return Object.fromEntries(Object.entries(inputs).filter(([key, value]) => value !== baseline[key as keyof EngineInputs])) as Partial<EngineInputs>;
}

function isPresetId(value: string | null): value is EnginePresetId {
    return presetIds.includes(value as EnginePresetId);
}

function parseInputChanges(encoded: string | null, basePresetId: EnginePresetId): Partial<EngineInputs> {
    if (!encoded) return {};
    try {
        const candidate: unknown = JSON.parse(encoded);
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return {};
        const baseline = ENGINE_INPUT_PRESETS[basePresetId];
        return Object.fromEntries(Object.entries(candidate).filter(([key, value]) => isValidInputValue(key, value, baseline))) as Partial<EngineInputs>;
    } catch {
        return {};
    }
}

function isValidInputValue(key: string, value: unknown, baseline: EngineInputs): boolean {
    if (!(key in baseline)) return false;
    const expected = baseline[key as keyof EngineInputs];
    if (typeof expected === 'number') return typeof value === 'number' && Number.isFinite(value);
    if (key === 'modelProfileId') return value === 'peweeInspired' || value === 'thermalInvestigation';
    if (key === 'missionMode') return value === 'startup' || value === 'steadyBurn' || value === 'shutdown' || value === 'cooldown';
    if (key === 'thermalCouplingMode') return value === 'benchmarkClosure' || value === 'fixedEfficiency';
    return typeof value === 'string';
}
