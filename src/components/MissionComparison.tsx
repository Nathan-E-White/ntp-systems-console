export function MissionComparison() {
  return (
    <section className="comparison-grid">
      <article className="panel comparison-card">
        <p className="eyebrow">nuclear thermal propulsion</p>
        <h2>NTP / Rover-NERVA Heritage</h2>
        <p>Reactor heat is transferred directly to hydrogen propellant for comparatively high thrust and fast burns.</p>
        <ul>
          <li>Core thermal margin and hydrogen compatibility dominate the story.</li>
          <li>Startup, shutdown, and cooldown transients are central systems-analysis concerns.</li>
          <li>Natural handoffs: MCNP/OpenMC, MOOSE, ROCETS-style system models.</li>
        </ul>
      </article>
      <article className="panel comparison-card">
        <p className="eyebrow">nuclear electric propulsion</p>
        <h2>NEP / SR-1-like Contrast</h2>
        <p>Reactor heat is converted to electricity, then used by electric thrusters for low-thrust, high-efficiency missions.</p>
        <ul>
          <li>Power conversion, radiators, and electric thruster lifetime become major trades.</li>
          <li>Excellent for long-duration deep-space mission architectures.</li>
          <li>Useful comparison card, but not the primary SNP demo model.</li>
        </ul>
      </article>
    </section>
  );
}
