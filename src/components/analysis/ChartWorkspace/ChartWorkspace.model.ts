import type {ParsedTimeSeries} from '../../../parser/parserTypes';
import type {TransientPoint} from '../../../types/TransientPoint';
import type {AnalysisBoundary, EngineeringValueSource} from '../analysisTypes';

export interface ChartPoint {
    readonly x: number;
    readonly values: Readonly<Record<string, number | null>>;
}

export interface ChartSeriesModel {
    readonly id: string;
    readonly title: string;
    readonly xLabel: string;
    readonly xUnit: string;
    readonly source: EngineeringValueSource;
    readonly sourceId: string;
    readonly points: readonly ChartPoint[];
}

export interface ChartWorkspaceModel {
    readonly series: readonly ChartSeriesModel[];
    readonly boundary: AnalysisBoundary;
}

export function chartSeriesFromTransientPoints(points: readonly TransientPoint[]): ChartSeriesModel {
    return {
        id: 'reduced-order-transient',
        title: 'Reduced-Order Operating Transient',
        xLabel: 'Time',
        xUnit: 's',
        source: 'reduced-order',
        sourceId: 'transient-model',
        points: points.map(({timeSec, ...values}) => ({x: timeSec, values})),
    };
}

export function chartSeriesFromFixture(series: ParsedTimeSeries, fixtureId: string): ChartSeriesModel {
    return {
        id: `${fixtureId}:${series.id}`,
        title: series.title,
        xLabel: 'Time',
        xUnit: series.timeUnit ?? '',
        source: 'fixture',
        sourceId: fixtureId,
        points: series.points.map((point) => ({x: point.time, values: point.values})),
    };
}

export function buildChartWorkspaceModel(
    series: readonly ChartSeriesModel[] = [],
    overrides: Partial<ChartWorkspaceModel> = {},
): ChartWorkspaceModel {
    return {
        series,
        boundary: {
            scope: 'Normalizes fixture and reduced-order time series into renderer-neutral chart data.',
            owns: ['series normalization', 'source identity', 'chart selection', 'cursor position'],
            excludes: ['Recharts configuration', 'model execution', 'parameter editing'],
        },
        ...overrides,
    };
}
