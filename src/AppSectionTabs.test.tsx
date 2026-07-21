import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {appSections} from './AppSections';
import {AppSectionTabs} from './AppSectionTabs';

describe('AppSectionTabs', () => {
    it('uses the nuclear-first primary flow with an explicit review-packet export tab', () => {
        const onSectionChange = vi.fn();

        render(<AppSectionTabs activeSectionId="operating-case" onSectionChange={onSectionChange}/>);

        expect(appSections.map((section) => section.id)).toEqual([
            'operating-case',
            'nuclear-fuel-performance',
            'model-evidence',
            'review',
            'review-packet',
        ]);
        expect(screen.getByRole('button', {name: /Nuclear Fuel Performance/i})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /^Stability/i})).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /Nuclear Fuel Performance/i}));
        expect(onSectionChange).toHaveBeenCalledWith('nuclear-fuel-performance');

        fireEvent.click(screen.getByRole('button', {name: /Review Packet/i}));
        expect(onSectionChange).toHaveBeenCalledWith('review-packet');
    });
});
