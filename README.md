# NTP Systems Console

A reduced-order, public-domain educational systems-analysis dashboard for a generic solid-core nuclear thermal propulsion concept, inspired by public Rover/NERVA heritage.

This is **not** a reproduction of the historical NERVA engine and is **not** a design or safety-analysis tool. The goal is to demonstrate software architecture, visualization, transient reasoning, and design-review communication patterns relevant to space nuclear propulsion modeling and simulation workflows.

## What it demonstrates

- React + TypeScript single-page app architecture
- Three.js / React Three Fiber interactive engine schematic
- Reduced-order propulsion calculations
- Startup/shutdown transient visualization
- Thermal margin and toy stability indicators
- Design-review style analyst notes
- NTP vs NEP/SR-1-like mission architecture contrast

## Run

```bash
bun install
bun run dev
```

or with npm:

```bash
npm install
npm run dev
```

## Build and test

```bash
bun run build
bun run test
```

## Reduced-order model scope

The simplified model estimates propellant heating, exhaust velocity, specific impulse, thrust, fuel temperature margin, pressure drop, and a toy transient stability score. It intentionally avoids detailed geometry, neutronics, materials, fuel-performance, or flight-design claims.

## Future extensions

- Mock ROCETS transient import
- OpenMC/MCNP-style flux profile viewer
- MOOSE/fuel-performance handoff panel
- Shielding/dose-cone mass trade visualization
- One-click design-review slide export
