import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ChartWorkspace} from './ChartWorkspace';
import {buildChartWorkspaceModel, chartSeriesFromTransientPoints} from './ChartWorkspace.model';

describe('ChartWorkspace', () => {
    it('normalizes reduced-order series without binding the contract to Recharts', () => {
        const series = chartSeriesFromTransientPoints([{
            timeSec: 0,
            powerMw: 0,
            outletTemperatureK: 120,
            channelWallCriterionMarginK: 500,
            thrustKn: 0,
            basisCompletenessPercent: 100,
        }]);
        render(<ChartWorkspace model={buildChartWorkspaceModel([series])}/>);
        expect(screen.getByRole('region', {name: 'Engineering charts'}))
            .toHaveAttribute('data-series-count', '1');
    });
});
