import {computePowerProfilePeak} from './computePowerProfilePeak';
import {computeReactivityPcm} from './computeReactivityPcm';
import {computeTwoSigmaKeffBand} from './computeTwoSigmaKeffBand';
import {estimateInsertedDrumWorthPcm} from './estimateInsertedDrumWorthPcm';
import {estimateTemperatureFeedbackPcm} from './estimateTemperatureFeedbackPcm';
import {type ReactorPhysicsResult} from './reactorPhysicsModel';
import {classifyReactorPosture} from "./classifyReactorPosture";
import {computeNeutronAccountingSubtotal} from "./computeNeutronAccountingSubtotal";

import {ReactorPhysicsInputs} from "../types/ReactorPhysicsInputs";

/**
 * Evaluates the reduced-order reactor-physics interpretation model.
 *
 * This function intentionally does not solve transport, diffusion, depletion, or
 * thermal-hydraulics. It performs dashboard-level neutronics bookkeeping from
 * synthetic/imported fixture quantities: k-effective, uncertainty, control-drum
 * worth, temperature feedback, neutron balance, and normalized power profiles.
 */
export function evaluateReactorPhysics(inputs: ReactorPhysicsInputs): ReactorPhysicsResult {
    const reactivityPcm = computeReactivityPcm(inputs.keff);
    const twoSigmaKeffBand = computeTwoSigmaKeffBand(inputs.keff, inputs.keffStdDev);
    const insertedDrumWorthPcm = estimateInsertedDrumWorthPcm(
        inputs.controlDrumAngleDeg,
        inputs.totalDrumWorthPcm,
    );
    const remainingShutdownWorthPcm = inputs.totalDrumWorthPcm - insertedDrumWorthPcm;
    const temperatureFeedbackPcm = estimateTemperatureFeedbackPcm({
        fuelTemperatureK: inputs.fuelTemperatureK,
        referenceFuelTemperatureK: inputs.referenceFuelTemperatureK,
        coefficientPcmPerK: inputs.fuelTemperatureCoefficientPcmPerK,
    });
    const axialPeak = computePowerProfilePeak(inputs.axialPowerProfile);
    const radialPeak = computePowerProfilePeak(inputs.radialPowerProfile);
    const neutronAccountingSubtotal = computeNeutronAccountingSubtotal(inputs);
    const untrackedBalanceFraction = 1 - neutronAccountingSubtotal;
    const posture = classifyReactorPosture({
        keff: inputs.keff,
        twoSigmaUpperKeff: twoSigmaKeffBand.upper,
        reactivityPcm,
        shutdownMarginPcm: inputs.shutdownMarginPcm,
    });

    return {
        reactivityPcm,
        twoSigmaLowerKeff: twoSigmaKeffBand.lower,
        twoSigmaUpperKeff: twoSigmaKeffBand.upper,
        insertedDrumWorthPcm,
        remainingShutdownWorthPcm,
        temperatureFeedbackPcm,
        axialPeakFactor: axialPeak.peakingFactor,
        radialPeakFactor: radialPeak.peakingFactor,
        axialPeakLabel: axialPeak.peak.label,
        radialPeakLabel: radialPeak.peak.label,
        neutronAccountingSubtotal,
        untrackedBalanceFraction,
        posture,
    };
}