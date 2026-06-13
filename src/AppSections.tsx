export type AppSectionId = 'operating-case' | 'model-evidence' | 'stability' | 'review';

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
        description: 'Define the reactor operating phase and inspect the reduced-order engine response.',
    },
    {
        id: 'model-evidence',
        label: 'Model Evidence',
        eyebrow: 'Synthetic model handoff',
        description: 'Trace MCNP-like, MOOSE-like, and ROCETS-like fixture evidence through one review case.',
    },
    {
        id: 'stability',
        label: 'Stability',
        eyebrow: 'Systems investigation',
        description: 'Compare operating cases and interpret channel hydraulics, basis completeness, and review flags.',
    },
    {
        id: 'review',
        label: 'Review',
        eyebrow: 'Milestone review',
        description: 'Turn the operating point and model evidence into an integrated engineering recommendation.',
    },
];
