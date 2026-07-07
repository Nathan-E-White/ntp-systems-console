import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {FeedSystemAssembly} from './FeedSystemAssembly';
import {buildFeedSystemAssemblyModel} from './FeedSystemAssembly.model';

describe('FeedSystemAssembly', () => {
    it('retains the ordered cold-side component inventory', () => {
        render(<FeedSystemAssembly model={buildFeedSystemAssemblyModel()}/>);
        expect(screen.getByRole('group', {name: 'Representative feed-system assembly'}))
            .toHaveAttribute('data-component-count', '7');
    });
});
