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

export function useDesignReviewModel() {
    const outputs = useEngineOutputs();

    return useMemo(() => buildDesignReviewModel(outputs), [outputs]);
}
