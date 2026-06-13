import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TransientPoint } from '../types/TransientPoint';
import {useAnalysisLinkRegistry, useChartWorkspace} from './analysis';
import {useEngineStore} from '../state/EngineStore';

interface TransientPlotsProps {
  data: TransientPoint[];
}

const TRACE_STYLES = {
  power: {
    stroke: '#38bdf8',
  },
  thermalMargin: {
    stroke: '#f59e0b',
    strokeDasharray: '7 3',
  },
  thrust: {
    stroke: '#22c55e',
    strokeDasharray: '3 3',
  },
  stability: {
    stroke: '#a78bfa',
    strokeDasharray: '10 4 2 4',
  },
} as const;


type TraceName = 'Power MW' | 'Wall criterion margin K' | 'Thrust kN' | 'Basis completeness';

interface TooltipPayloadItem {
  color?: string;
  name?: unknown;
  value?: unknown;
}

interface PlotTooltipProps {
  active?: boolean;
  label?: unknown;
  payload?: TooltipPayloadItem[];
}

const TRACE_METADATA: Record<TraceName, { label: string; unit: string; fractionDigits: number }> = {
  'Power MW': { label: 'Power', unit: 'MW', fractionDigits: 1 },
  'Wall criterion margin K': { label: 'Wall criterion margin', unit: 'K', fractionDigits: 0 },
  'Thrust kN': { label: 'Thrust', unit: 'kN', fractionDigits: 1 },
  'Basis completeness': { label: 'Basis completeness', unit: '%', fractionDigits: 0 },
};

function formatPlotValue(value: unknown, name: unknown): [string, string] {
  const numericValue = typeof value === 'number' ? value : Number(value);
  const traceName = normalizeTraceName(name);
  const metadata = TRACE_METADATA[traceName];

  if (!Number.isFinite(numericValue)) {
    return [String(value), metadata.label];
  }

  const formattedValue = numericValue.toFixed(metadata.fractionDigits);
  const valueWithUnit = metadata.unit ? `${formattedValue} ${metadata.unit}` : formattedValue;

  return [valueWithUnit, metadata.label];
}

function normalizeTraceName(name: unknown): TraceName {
  const candidate = typeof name === 'string' ? name : String(name);

  if (candidate in TRACE_METADATA) {
    return candidate as TraceName;
  }

  return 'Basis completeness';
}

function formatLegendLabel(value: string): string {
  const traceName = normalizeTraceName(value);
  const axisLabel = traceName === 'Power MW' || traceName === 'Wall criterion margin K' ? 'left' : 'right';

  return `${TRACE_METADATA[traceName].label} [${axisLabel}]`;
}

function PlotTooltip({ active, label, payload }: PlotTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '0.75rem',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.35)',
        minWidth: '13rem',
        padding: '0.75rem',
      }}
    >
      <div
        style={{
          color: '#cbd5e1',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: '0.45rem',
          textTransform: 'uppercase',
        }}
      >
        {`time: ${Number(label).toFixed(1)} s`}
      </div>

      <div style={{ display: 'grid', gap: '0.32rem' }}>
        {payload.map((item) => {
          const traceName = normalizeTraceName(item.name);
          const metadata = TRACE_METADATA[traceName];
          const [formattedValue] = formatPlotValue(item.value, item.name);

          return (
            <div
              key={traceName}
              style={{
                alignItems: 'baseline',
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'minmax(7.5rem, 1fr) max-content',
              }}
            >
              <span style={{ color: item.color ?? '#cbd5e1', fontSize: '0.82rem' }}>{metadata.label}</span>
              <span
                style={{
                  color: '#f8fafc',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.82rem',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TransientPlots({ data }: TransientPlotsProps) {
  const charts = useChartWorkspace();
  const links = useAnalysisLinkRegistry();
  const selectedTransientTimeSec = useEngineStore((state) => state.selectedTransientTimeSec);
  const setSelectedTransientTimeSec = useEngineStore((state) => state.setSelectedTransientTimeSec);

  const selectConcern = (linkId: 'thermal-margin' | 'propulsion-stability') => {
    charts.selectSeries('reduced-order-transient');
    links.activateLink(linkId);
  };

  return (
    <section className="panel plot-panel">
      <div className="panel-heading">
        <p className="eyebrow">startup / shutdown trace</p>
        <h2>Transient Overview</h2>
        <div className="trace-link-buttons">
          <button className={links.state.activeLinkId === 'thermal-margin' ? 'active' : ''}
                  onClick={() => selectConcern('thermal-margin')} type="button">
            Wall criterion trace
          </button>
          <button className={links.state.activeLinkId === 'propulsion-stability' ? 'active' : ''}
                  onClick={() => selectConcern('propulsion-stability')} type="button">
            Propulsion / basis traces
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={data} margin={{ top: 12, right: 28, bottom: 8, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="timeSec" stroke="#94a3b8" label={{ value: 'time (s)', position: 'insideBottomRight', offset: -2 }} />
          <YAxis
            stroke="#94a3b8"
            yAxisId="primary"
            label={{ value: 'Power / margin', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            orientation="right"
            stroke="#94a3b8"
            yAxisId="secondary"
            label={{ value: 'Thrust / basis', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<PlotTooltip />} />
          <Legend formatter={formatLegendLabel} />
          <Line
            type="monotone"
            dataKey="powerMw"
            name="Power MW"
            dot={false}
            stroke={TRACE_STYLES.power.stroke}
            strokeWidth={2.4}
            yAxisId="primary"
          />
          <Line
            type="monotone"
            dataKey="channelWallCriterionMarginK"
            name="Wall criterion margin K"
            dot={false}
            stroke={TRACE_STYLES.thermalMargin.stroke}
            strokeDasharray={TRACE_STYLES.thermalMargin.strokeDasharray}
            strokeWidth={2.2}
            yAxisId="primary"
          />
          <Line
            type="monotone"
            dataKey="thrustKn"
            name="Thrust kN"
            dot={false}
            stroke={TRACE_STYLES.thrust.stroke}
            strokeDasharray={TRACE_STYLES.thrust.strokeDasharray}
            strokeWidth={2.2}
            yAxisId="secondary"
          />
          <Line
            type="monotone"
            dataKey="basisCompletenessPercent"
            name="Basis completeness"
            dot={false}
            stroke={TRACE_STYLES.stability.stroke}
            strokeDasharray={TRACE_STYLES.stability.strokeDasharray}
            strokeWidth={2.1}
            yAxisId="secondary"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="transient-time-control">
        <span>Inspect generated transient point</span>
        <span className="transient-time-control__buttons">
          <button
            type="button"
            disabled={selectedTransientTimeSec <= 0}
            onClick={() => setSelectedTransientTimeSec(Math.max(0, selectedTransientTimeSec - 5))}
          >
            Previous 5 s
          </button>
          <strong>{selectedTransientTimeSec} s</strong>
          <button
            type="button"
            disabled={selectedTransientTimeSec >= 200}
            onClick={() => setSelectedTransientTimeSec(Math.min(200, selectedTransientTimeSec + 5))}
          >
            Next 5 s
          </button>
        </span>
        <input
          aria-label="Selected transient time"
          type="range"
          min={0}
          max={200}
          step={5}
          value={selectedTransientTimeSec}
          onChange={(event) => setSelectedTransientTimeSec(Number(event.target.value))}
        />
        <small>Each point regenerates power and drum position, then runs the same traceable steady-case evaluator.</small>
      </div>
    </section>
  );
}
