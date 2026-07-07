import type {VisualizationBoundary} from '../visualizationTypes';

export type FeedComponentKind = 'tank' | 'valve' | 'pump' | 'manifold' | 'regen-jacket' | 'conditioner';

export interface FeedComponentModel {
    readonly id: string;
    readonly kind: FeedComponentKind;
    readonly label: string;
}

export interface FeedSystemAssemblyModel {
    readonly id: string;
    readonly components: readonly FeedComponentModel[];
    readonly boundary: VisualizationBoundary;
}

export function buildFeedSystemAssemblyModel(
    overrides: Partial<FeedSystemAssemblyModel> = {},
): FeedSystemAssemblyModel {
    return {
        id: 'feed-system-assembly',
        components: [
            {id: 'lh2-supply', kind: 'tank', label: 'LH2 supply boundary'},
            {id: 'isolation-valve', kind: 'valve', label: 'Tank isolation valve'},
            {id: 'boost-pump', kind: 'pump', label: 'Boost pump'},
            {id: 'main-turbopump', kind: 'pump', label: 'Main turbopump'},
            {id: 'discharge-manifold', kind: 'manifold', label: 'Discharge manifold'},
            {id: 'regen-jacket', kind: 'regen-jacket', label: 'Nozzle regenerative jacket'},
            {id: 'ortho-para-conditioner', kind: 'conditioner', label: 'Hydrogen conditioner'},
        ],
        boundary: {
            scope: 'Represents the ROCETS-like cold-side feed path before reactor inlet.',
            owns: ['feed-component geometry', 'cold-side ordering', 'pump-state emphasis'],
            excludes: ['pump maps', 'fluid-property solution', 'mass-flow editing'],
        },
        ...overrides,
    };
}
