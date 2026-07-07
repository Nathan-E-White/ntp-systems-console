import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {appSections} from './AppSections';
import {AppSectionTabs} from './AppSectionTabs';

describe('AppSectionTabs', () => {
    it('uses the v3 nuclear-first primary flow without a standalone stability tab', () => {
        const onSectionChange = vi.fn();

        render(<AppSectionTabs activeSectionId="operating-case" onSectionChange={onSectionChange}/>);

        expect(appSections.map((section) => section.id)).toEqual([
            'operating-case',
            'nuclear-fuel-performance',
            'model-evidence',
            'review',
        ]);
        expect(screen.getByRole('button', {name: /Nuclear Fuel Performance/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /^Stability/i})).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /Nuclear Fuel Performance/i}));
        expect(onSectionChange).toHaveBeenCalledWith('nuclear-fuel-performance');
    });
});
