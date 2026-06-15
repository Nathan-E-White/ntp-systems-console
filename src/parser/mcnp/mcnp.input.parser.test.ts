import {describe, expect, it} from 'vitest';

import {parseMcnpInput} from './mcnp.input.parser';

describe('parseMcnpInput', () => {
    it('attaches comment-line metadata labels to the preceding cell card', () => {
        const parsed = parseMcnpInput(`
C CELL CARDS
1      1   -7.000E-02     -101 300 -301                    imp:n=1
C      $ lh2_supply_tank_proxy; ROCETS BOUNDARY lh2_supply_tank
2      1   -6.800E-02     -102 301 -302                    imp:n=1
C      $ tank_isolation_valve_hydrogen
`);

        expect(parsed.cells).toMatchObject([
            {
                cellId: 1,
                label: 'lh2_supply_tank_proxy; ROCETS BOUNDARY lh2_supply_tank',
                materialId: 1,
            },
            {
                cellId: 2,
                label: 'tank_isolation_valve_hydrogen',
                materialId: 1,
            },
        ]);
    });

    it('extracts active-line end-of-line comments as surface labels', () => {
        const parsed = parseMcnpInput(`
C SURFACE CARDS
101    cz   0.260     $ lh2_supply_proxy_radius
102    cz   0.050     $ feed_line_inner_radius
`);

        expect(parsed.surfaces).toMatchObject([
            {
                surfaceId: 101,
                label: 'lh2_supply_proxy_radius',
                surfaceType: 'cz',
            },
            {
                surfaceId: 102,
                label: 'feed_line_inner_radius',
                surfaceType: 'cz',
            },
        ]);
    });

    it('attaches comment-line metadata labels to the preceding material card', () => {
        const parsed = parseMcnpInput(`
C DATA CARDS
MODE N
M1     1001.70c  1.000
C      $ hydrogen_placeholder; lh2/hot_h2 flow regions
M2     92235.70c 0.050  92238.70c 0.200  6000.70c 0.750
C      $ fuel_graphite_composite_placeholder
`);

        expect(parsed.materials).toMatchObject([
            {
                materialId: 1,
                label: 'hydrogen_placeholder; lh2/hot_h2 flow regions',
                nuclides: [{zaid: '1001.70c', fraction: 1}],
            },
            {
                materialId: 2,
                label: 'fuel_graphite_composite_placeholder',
                nuclides: [
                    {zaid: '92235.70c', fraction: 0.05},
                    {zaid: '92238.70c', fraction: 0.2},
                    {zaid: '6000.70c', fraction: 0.75},
                ],
            },
        ]);
    });

    it('attaches comment-line metadata labels to the preceding tally card', () => {
        const parsed = parseMcnpInput(`
C DATA CARDS
MODE N
F4:N    23 24 25 26 27 28
C       $ core_axial_segment_A_flux_proxy
F14:N   29 30 31 32 33 34
C       $ core_axial_segment_B_flux_proxy
F24:N   35 36 37 38 39 40
C       $ core_axial_segment_C_flux_proxy
`);

        expect(parsed.tallies).toMatchObject([
            {
                tallyId: 4,
                label: 'core_axial_segment_A_flux_proxy',
                cells: [23, 24, 25, 26, 27, 28],
            },
            {
                tallyId: 14,
                label: 'core_axial_segment_B_flux_proxy',
                cells: [29, 30, 31, 32, 33, 34],
            },
            {
                tallyId: 24,
                label: 'core_axial_segment_C_flux_proxy',
                cells: [35, 36, 37, 38, 39, 40],
            },
        ]);
    });

    it('does not carry unrelated comment-line metadata forward onto later parsed cards', () => {
        const parsed = parseMcnpInput(`
C DATA CARDS
BURNUP 0.00  0.01  0.05
C      $ normalization=notional_power_history_only
F4:N    23 24 25 26 27 28
C       $ crit_core_axial_segment_A_flux_proxy
`);

        expect(parsed.tallies).toMatchObject([
            {
                tallyId: 4,
                label: 'crit_core_axial_segment_A_flux_proxy',
            },
        ]);
    });
});
