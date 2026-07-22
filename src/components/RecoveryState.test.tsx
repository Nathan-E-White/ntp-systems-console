import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {RecoveryState, type RecoveryKind} from './RecoveryState';

describe('RecoveryState', () => {
    (['loading', 'empty', 'parser-error', 'projection-error', 'webgl-fallback'] as const satisfies readonly RecoveryKind[]).forEach((kind) => {
        it(`gives ${kind} an actionable recovery path`, () => { render(<RecoveryState kind={kind}/>); expect(screen.getByRole('status')).toHaveTextContent('recovery'); });
    });
});
