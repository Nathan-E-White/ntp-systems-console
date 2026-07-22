import type {AppSectionId} from '../AppSections';
import type {SceneComponentId} from '../components/visualization/GuidedInvestigation/GuidedInvestigation.model';

export interface ReviewRoute {
    readonly section: AppSectionId;
    readonly focus: SceneComponentId | null;
}

const sections: readonly AppSectionId[] = ['operating-case', 'nuclear-fuel-performance', 'model-evidence', 'review'];
const focusValues: readonly SceneComponentId[] = ['engine-overview', 'reactor-transport', 'reactor-criticality', 'fuel-performance', 'thermal-margin', 'feed-system', 'main-turbopump', 'power-conversion', 'nozzle-performance', 'propulsion-stability'];

export function parseReviewRoute(search: string): ReviewRoute {
    const params = new URLSearchParams(search);
    const section = params.get('section');
    const focus = params.get('focus');
    return {
        section: sections.includes(section as AppSectionId) ? section as AppSectionId : 'operating-case',
        focus: focusValues.includes(focus as SceneComponentId) ? focus as SceneComponentId : null,
    };
}

export function reviewRouteSearch(route: ReviewRoute): string {
    const params = new URLSearchParams({section: route.section});
    if (route.focus) params.set('focus', route.focus);
    return `?${params.toString()}`;
}
