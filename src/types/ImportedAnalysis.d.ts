import {PropulsionAnalysis} from "./PropulsionAnalysis";
import {NeutronicsSummary} from "./NeutronicsSummary";
import {MooseThermomechanicsSummary} from "./MooseThermomechanicalSummary";

export interface ImportedAnalysis {
    caseId: string;

    neutronics: NeutronicsSummary;
    propulsion: PropulsionAnalysis;
    thermomechanics: MooseThermomechanicsSummary;

    timeHistory: []

    review: {
        criticalityPosture: string;
        thermalPosture: string;
        propulsionPosture: string;
        recommendedFollowup: string[];
    };
}