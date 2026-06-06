export interface MooseThermomechanicsSummary {
    converged: boolean;
    meshElements: number;
    nonlinearIterations: number;
    peakFuelTemperatureK: number;
    peakWebTemperatureK: number;
    maxVonMisesStressMpa: number;
    thermalStrainPercent: number;
    minimumThermalMarginK: number;
    hotChannelFactor: number;
    peakStressAxialStation: string;
    peakTemperatureRegion: string;
    posture: 'nominal' | 'watch' | 'limit' | 'non-converged';
}