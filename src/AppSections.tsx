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
        description: 'Set the operating point and inspect the calculated response.',
    },
    {
        id: 'model-evidence',
        label: 'Model Evidence',
        eyebrow: 'Synthetic model handoff',
        description: 'Inspect the MCNP-, MOOSE-, and ROCETS-like evidence set.',
    },
    {
        id: 'stability',
        label: 'Stability',
        eyebrow: 'Systems investigation',
        description: 'Compare prepared cases and review the controlling flags.',
    },
    {
        id: 'review',
        label: 'Review',
        eyebrow: 'Milestone review',
        description: 'Resolve the case into an engineering recommendation.',
    },
];
