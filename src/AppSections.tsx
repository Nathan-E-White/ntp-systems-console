export type AppSectionId = 'operating-case' | 'nuclear-fuel-performance' | 'model-evidence' | 'review' | 'review-packet';

export interface AppSectionDefinition {
    id: AppSectionId;
    label: string;
    eyebrow: string;
    description: string;
}

export const appSections: AppSectionDefinition[] = [
    {
        id: 'operating-case',
        label: 'Operating Case',
        eyebrow: 'Engine operations',
        description: 'Set the operating point and inspect the calculated response.',
    },
    {
        id: 'nuclear-fuel-performance',
        label: 'Nuclear Fuel Performance',
        eyebrow: 'Fuel and burnup evidence',
        description: 'Inspect BISON fuel-performance and MCNP burnup/restart evidence.',
    },
    {
        id: 'model-evidence',
        label: 'Model Evidence',
        eyebrow: 'Synthetic model handoff',
        description: 'Inspect the MCNP-, BISON-, MOOSE-, and ROCETS-like evidence set.',
    },
    {
        id: 'review',
        label: 'Review',
        eyebrow: 'Milestone review',
        description: 'Resolve the case into an engineering recommendation.',
    },
    {
        id: 'review-packet',
        label: 'Review Packet',
        eyebrow: 'Portfolio export',
        description: 'Export a browser-session review packet with its stated evidence boundary.',
    },
];
