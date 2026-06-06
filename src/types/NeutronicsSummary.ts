export interface NeutronicsSummary {
    keff: number;
    keffStdDev: number;
    reactivityPcm: number;
    shutdownMarginPcm: number;
    controlDrumAngleDeg: number;
    drumWorthPcm: number;
    temperatureFeedbackPcm: number;
    leakageFraction: number;
    powerPeakingFactor: number;
    posture: 'subcritical' | 'critical-band' | 'excess-reactivity' | 'shutdown-margin-concern'
}