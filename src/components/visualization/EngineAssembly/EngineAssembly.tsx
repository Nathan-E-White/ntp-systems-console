import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import {FeedSystemAssembly} from '../FeedSystemAssembly/FeedSystemAssembly';
import {
    buildFeedSystemAssemblyModel,
    type FeedSystemAssemblyModel,
} from '../FeedSystemAssembly/FeedSystemAssembly.model';
import {FlowPathOverlay} from '../FlowPathOverlay/FlowPathOverlay';
import {
    buildFlowPathOverlayModel,
    type FlowPathOverlayModel,
} from '../FlowPathOverlay/FlowPathOverlay.model';
import {NozzleAssembly} from '../NozzleAssembly/NozzleAssembly';
import {
    buildNozzleAssemblyModel,
    type NozzleAssemblyModel,
} from '../NozzleAssembly/NozzleAssembly.model';
import {PowerConversionAssembly} from '../PowerConversionAssembly/PowerConversionAssembly';
import {
    buildPowerConversionAssemblyModel,
    type PowerConversionAssemblyModel,
} from '../PowerConversionAssembly/PowerConversionAssembly.model';
import {ReactorAssembly} from '../ReactorAssembly/ReactorAssembly';
import {
    buildReactorAssemblyModel,
    type ReactorAssemblyModel,
} from '../ReactorAssembly/ReactorAssembly.model';
import type {ScenePresentationState} from '../visualizationTypes';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';
import type {EngineAssemblyModel} from './EngineAssembly.model';

export interface EngineAssemblyProps {
    readonly model: EngineAssemblyModel;
    readonly presentation?: ScenePresentationState;
    readonly reactorModel?: ReactorAssemblyModel;
    readonly feedModel?: FeedSystemAssemblyModel;
    readonly powerConversionModel?: PowerConversionAssemblyModel;
    readonly nozzleModel?: NozzleAssemblyModel;
    readonly flowPathModel?: FlowPathOverlayModel;
    readonly initiallyExploded?: boolean;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface EngineAssemblyState {
    readonly exploded: boolean;
}

export interface EngineAssemblyContextValue {
    readonly model: EngineAssemblyModel;
    readonly state: EngineAssemblyState;
    readonly setExploded: (exploded: boolean) => void;
}

export interface EngineAssemblyProviderProps extends EngineAssemblyProps {
    readonly children: ReactNode;
}

const EngineAssemblyContext = createContext<EngineAssemblyContextValue | undefined>(undefined);

/** Boundary: major scene graph composition. Scope: transforms and assembly membership only. */
export function EngineAssemblyProvider({
    model,
    initiallyExploded = false,
    children,
}: Readonly<EngineAssemblyProviderProps>) {
    const [exploded, setExploded] = useState(initiallyExploded);
    const value = useMemo(() => ({model, state: {exploded}, setExploded}), [exploded, model]);
    return <EngineAssemblyContext.Provider value={value}>{children}</EngineAssemblyContext.Provider>;
}

export function useEngineAssembly(): EngineAssemblyContextValue {
    const context = useContext(EngineAssemblyContext);
    if (!context) throw new Error('useEngineAssembly must be used inside EngineAssemblyProvider.');
    return context;
}

export function EngineAssemblyView({
    presentation,
    reactorModel = buildReactorAssemblyModel(),
    feedModel = buildFeedSystemAssemblyModel(),
    powerConversionModel = buildPowerConversionAssemblyModel(),
    nozzleModel = buildNozzleAssemblyModel(),
    flowPathModel = buildFlowPathOverlayModel(),
    onSelectComponent,
}: Readonly<Omit<EngineAssemblyProps, 'model' | 'initiallyExploded'>>) {
    const {model, state} = useEngineAssembly();
    const explodedProgress = presentation?.explodedViewProgress ?? (state.exploded ? 1 : 0);

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Representative engine assembly"
                data-exploded={state.exploded}
                data-exploded-progress={explodedProgress}
                data-part-count={model.childAssemblyIds.length}
                data-scope="engine-assembly"
                role="group"
            >
                <FeedSystemAssembly model={feedModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
                <ReactorAssembly model={reactorModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
                <PowerConversionAssembly model={powerConversionModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
                <NozzleAssembly model={nozzleModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
                <FlowPathOverlay model={flowPathModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
            </div>
        );
    }

    return (
        <group
            name={model.id}
            position={[...model.origin]}
            rotation={[0.05, presentation?.yawRadians ?? 0, 0]}
            scale={model.scale}
        >
            <group position={[-0.3 * explodedProgress, 0.12 * explodedProgress, 0]}>
                <FeedSystemAssembly model={feedModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
            </group>
            <ReactorAssembly model={reactorModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
            <group position={[0.3 * explodedProgress, 0.08 * explodedProgress, 0]}>
                <PowerConversionAssembly model={powerConversionModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
            </group>
            <group position={[0, -0.25 * explodedProgress, 0]}>
                <NozzleAssembly model={nozzleModel} onSelectComponent={onSelectComponent} presentation={presentation}/>
            </group>
            <FlowPathOverlay
                initiallyAnimated={import.meta.env.MODE !== 'test'}
                model={flowPathModel}
                onSelectComponent={onSelectComponent}
                presentation={presentation}
            />
        </group>
    );
}

export function EngineAssembly({
    presentation,
    reactorModel,
    feedModel,
    powerConversionModel,
    nozzleModel,
    flowPathModel,
    onSelectComponent,
    ...props
}: Readonly<EngineAssemblyProps>) {
    return (
        <EngineAssemblyProvider {...props}>
            <EngineAssemblyView
                feedModel={feedModel}
                flowPathModel={flowPathModel}
                nozzleModel={nozzleModel}
                onSelectComponent={onSelectComponent}
                powerConversionModel={powerConversionModel}
                presentation={presentation}
                reactorModel={reactorModel}
            />
        </EngineAssemblyProvider>
    );
}
