import {describe, expect, it} from 'vitest';

import {
    evaluateHydrogenGasProperties,
    hydrogenEnthalpyJPerKg,
} from '../physics/hydrogenProperties';
import {
    MODEL_PROFILES,
    PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC,
    PEWEE_IDEAL_ISP_SEC,
    PEWEE_THRUST_KN,
} from '../physics/modelProfiles';
import {evaluateNozzlePerformance} from '../physics/nozzlePerformance';
import {
    derivePeweeClosureEfficiency,
    modifiedWolfMcCarthyNusselt,
    peweePowerShape,
    solveRepresentativeChannel,
    taylorFanningFrictionFactor,
} from '../physics/representativeChannelModel';
import {REFERENCE_RECORDS} from '../physics/referenceBasis';

describe('reference-controlled Pewee-inspired basis', () => {
    it('locks published benchmark conversions and derived flow', () => {
        expect(PEWEE_THRUST_KN).toBeCloseTo(111.20554, 5);
        expect(PEWEE_IDEAL_ISP_SEC).toBe(875);
        expect(PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC).toBeCloseTo(12.959782, 6);
        expect(MODEL_PROFILES.peweeInspired.inputs.thermalPowerMw).toBe(500);
    });

    it('evaluates NIST Shomate heat capacity and enthalpy at controlled temperatures', () => {
        expect(evaluateHydrogenGasProperties(298.15, 101_325).cpJPerKgK).toBeCloseTo(14_305.0676, 2);
        expect(evaluateHydrogenGasProperties(1_000, 101_325).cpJPerKgK).toBeCloseTo(14_984.4644, 2);
        expect(hydrogenEnthalpyJPerKg(2_500)).toBeCloseTo(34_971_123.98, 0);
    });

    it('locks the ELM Pewee polynomial and benchmark closure', () => {
        expect(peweePowerShape(0)).toBeCloseTo(0.315263743551, 12);
        expect(peweePowerShape(0.5)).toBeCloseTo(1.391451319236, 12);
        expect(peweePowerShape(1)).toBeCloseTo(0.031342285829, 12);
        expect(derivePeweeClosureEfficiency(MODEL_PROFILES.peweeInspired.inputs))
            .toBeCloseTo(0.929517537, 8);
    });

    it('checks correlation behavior and channel conservation', () => {
        expect(modifiedWolfMcCarthyNusselt(100_000, 0.69, 1.2, 0.5, 0.00254)).toBeGreaterThan(100);
        expect(taylorFanningFrictionFactor(100_000, 2_000, 2_500)).toBeGreaterThan(0);
        const channel = solveRepresentativeChannel(MODEL_PROFILES.peweeInspired.inputs);
        expect(channel.converged).toBe(true);
        expect(channel.outletTemperatureK).toBeCloseTo(2_550, 6);
        expect(channel.pressureDropMpa).toBeGreaterThan(0);
        channel.stations.slice(1).forEach((station, index) => {
            expect(station.pressureMpa).toBeLessThanOrEqual(channel.stations[index].pressureMpa);
            expect(station.bulkTemperatureK).toBeGreaterThan(channel.stations[index].bulkTemperatureK);
        });
    });

    it('uses area ratio, pressure thrust, ambient pressure, and nozzle loss factor', () => {
        const common = {
            chamberTemperatureK: 2_550,
            chamberPressureMpa: 5.17,
            expansionRatio: 100,
            massFlowKgPerSec: PEWEE_DERIVED_MASS_FLOW_KG_PER_SEC,
        };
        const base = evaluateNozzlePerformance({...common, nozzleEfficiency: 0.965, ambientPressureKpa: 0});
        const degraded = evaluateNozzlePerformance({...common, nozzleEfficiency: 0.9, ambientPressureKpa: 101.325});
        expect(base.exitMach).toBeGreaterThan(1);
        expect(base.pressureThrustKn).toBeGreaterThan(0);
        expect(degraded.thrustKn).toBeLessThan(base.thrustKn);
    });

    it('keeps source locators and catalogs technical-interchange papers separately', () => {
        expect(REFERENCE_RECORDS.find((record) => record.id === 'nasa-tm-105867')?.locator)
            .toContain('Pewee-1 power-shape');
        const interchange = REFERENCE_RECORDS.filter((record) => record.id.startsWith('nptr-'));
        expect(interchange).toHaveLength(11);
        expect(interchange.every((record) => record.applicability.includes('system-architecture'))).toBe(true);
    });
});
