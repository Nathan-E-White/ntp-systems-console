import {useMemo} from 'react';

import {buildDesignReviewModel} from '../components/DesignReviewPanel';
import {computeEngineOutputs} from '../physics/propulsionModel';
import {generateTransient} from '../physics/transientModel';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {useEngineStore} from './EngineStore';

export function useEngineInputs(): EngineInputs {
    return useEngineStore((state) => state.inputs);
}

export function useEngineOutputs(): EngineOutputs {
    const inputs = useEngineInputs();

    return useMemo(() => computeEngineOutputs(inputs), [inputs]);
}

export function useEngineTransient() {
    const inputs = useEngineInputs();

    return useMemo(() => generateTransient(inputs), [inputs]);
}

export function useSelectedTransientPoint() {
    const transient = useEngineTransient();
    const selectedTransientTimeSec = useEngineStore((state) => state.selectedTransientTimeSec);

    return useMemo(() => {
        if (transient.length === 0) {
            return undefined;
        }

        return transient.reduce((nearestPoint, candidatePoint) => {
            const nearestDistance = Math.abs(nearestPoint.timeSec - selectedTransientTimeSec);
            const candidateDistance = Math.abs(candidatePoint.timeSec - selectedTransientTimeSec);

            return candidateDistance < nearestDistance ? candidatePoint : nearestPoint;
        }, transient[0]);
    }, [selectedTransientTimeSec, transient]);
}

export function useDesignReviewModel() {
    const outputs = useEngineOutputs();

    return useMemo(() => buildDesignReviewModel(outputs), [outputs]);
}