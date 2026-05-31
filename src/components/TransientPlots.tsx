import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TransientPoint } from '../types/TransientPoint';

interface TransientPlotsProps {
  data: TransientPoint[];
}

export function TransientPlots({ data }: TransientPlotsProps) {
  return (
    <section className="panel plot-panel">
      <div className="panel-heading">
        <p className="eyebrow">startup / shutdown trace</p>
        <h2>Transient Overview</h2>
      </div>
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={data} margin={{ top: 12, right: 18, bottom: 6, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="timeSec" stroke="#94a3b8" label={{ value: 'time (s)', position: 'insideBottomRight', offset: -2 }} />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.3)' }} />
          <Legend />
          <Line type="monotone" dataKey="powerMw" name="Power MW" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="thrustKn" name="Thrust kN" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="thermalMarginK" name="Thermal margin K" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="stabilityScore" name="Stability" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
