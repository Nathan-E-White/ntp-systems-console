import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
    useAnalysisLinkRegistry,
    useEngineeringDataWorkspace,
} from './analysis';
import {
    buildEngineAssemblyModel,
    buildEngineVisualizationModel,
    buildSceneCalloutOverlayModel,
    buildSceneCanvasModel,
    buildSceneViewPresetModel,
    EngineAssembly,
    EngineVisualizationProvider,
    SceneCalloutOverlay,
    SceneCanvas,
    SceneSelectionMarkers,
    type SceneComponentDescriptor,
    type SceneComponentId,
    type SceneSelectionState,
    type ScenePresentationState,
    type SceneViewPresetId,
    type TheatrePlaybackStatus,
    useGuidedInvestigation,
    useScenePresentation,
    useTheatreDemoDirector,
} from './visualization';
import {type EngineVisualizationMode, useEngineStore} from '../state/EngineStore';
import {
    getGuidedDemoYaw,
    cancelGuidedDemoSequence,
    pauseGuidedDemoSequence,
    resumeGuidedDemoSequence,
    runGuidedDemoCue,
    subscribeToGuidedDemoYaw,
} from '../theatre/guidedDemoSequence';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ControlDrum} from './ControlDrum';
import {CoreViewer} from './CoreViewer';
import {HydrogenFlow} from './HydrogenFlow';
import {Nozzle} from './Nozzle';
import {Shield} from './Shield';

interface EngineSceneProps {
    inputs: EngineInputs;
    outputs: EngineOutputs;
}

const sceneCanvasModel = buildSceneCanvasModel();
const engineAssemblyModel = buildEngineAssemblyModel();
const calloutModel = buildSceneCalloutOverlayModel();
const viewPresetModel = buildSceneViewPresetModel();

export function EngineScene({inputs, outputs}: Readonly<EngineSceneProps>) {
    const visualizationMode = useEngineStore((state) => state.visualizationMode);
    const setVisualizationMode = useEngineStore((state) => state.setVisualizationMode);
    const selectedChannelStationIndex = useEngineStore((state) => state.selectedChannelStationIndex);
    const setSelectedChannelStationIndex = useEngineStore((state) => state.setSelectedChannelStationIndex);
    const links = useAnalysisLinkRegistry();
    const workspace = useEngineeringDataWorkspace();
    const director = useTheatreDemoDirector();
    const investigation = useGuidedInvestigation();
    const sceneWorkspace = useScenePresentation();
    const {activateLink} = links;
    const {
        model: investigationModel,
        restoreSelection: restoreInvestigationSelection,
        selectComponent: selectInvestigationComponent,
        state: investigationState,
    } = investigation;
    const priorSelection = useRef<SceneSelectionState | null>(null);
    const {
        activePresetId: activeViewPresetId,
        cameraOwner,
        detailsVisible: overlaysVisible,
        explodedViewProgress,
        transition,
    } = sceneWorkspace.state;
    const {
        captureManualPose,
        completeTransition,
        requestTheatrePose,
        restoreTourSnapshot,
        saveTourSnapshot,
        selectPreset,
        setDetailsVisible,
        setExploded,
    } = sceneWorkspace;
    const caseIdRef = useRef(workspace.model.caseId);
    const outputsRef = useRef(outputs);
    caseIdRef.current = workspace.model.caseId;
    outputsRef.current = outputs;
    const effectiveMode = links.state.activeLinkId === 'thermal-margin'
        ? 'thermal'
        : links.state.activeLinkId === 'propulsion-stability'
            ? 'flow'
            : visualizationMode;
    const [theatreYaw, setTheatreYaw] = useState(getGuidedDemoYaw);
    const reducedMotion = useReducedMotion();
    const activeCue = director.model.cues.find((cue) => cue.id === director.state.activeCueId);
    const selectedComponent = investigationModel.components.find(
        (component) => component.id === investigationState.selectedComponentId,
    ) ?? investigationModel.components[0];
    const activeLink = links.model.links.find((link) => link.id === links.state.activeLinkId);
    const selectedTargets = selectedComponent.targetIds;
    const channelEvaluation = useMemo(() => evaluateEngineCase(inputs).channel, [inputs]);
    const selectedChannelStation = channelEvaluation?.stations.find(
        (station) => station.index === selectedChannelStationIndex,
    );
    const selectedAxialRegionIndex = selectedChannelStation
        ? Math.min(Math.floor(selectedChannelStation.normalizedPosition * 3), 2)
        : null;
    const highlightedTargetIds = Array.from(new Set([
        ...(activeLink?.visualizationTargetIds ?? []),
        ...selectedTargets,
    ]));
    const cameraTarget = transition.pose.target;
    const cameraPosition = transition.pose.position;
    const cameraTransitionKey = `${transition.owner}-${transition.id}`;

    useEffect(() => subscribeToGuidedDemoYaw(setTheatreYaw), []);
    useEffect(() => {
        const clearSelection = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isTourActive(director.state.playbackStatus)) {
                selectInvestigationComponent('engine-overview');
                activateLink(null);
            }
        };
        window.addEventListener('keydown', clearSelection);
        return () => window.removeEventListener('keydown', clearSelection);
    }, [activateLink, director.state.playbackStatus, selectInvestigationComponent]);

    const presentation = useMemo<ScenePresentationState>(() => ({
        mode: effectiveMode,
        activeCueId: director.state.activeCueId,
        highlightedTargetIds,
        thermalPower: normalize(inputs.thermalPowerMw, 350, 600),
        flowRate: normalize(inputs.massFlowKgPerSec, 9, 17),
        thermalMargin: normalize(outputs.channelWallCriterionMarginK, 0, 650),
        controlDrumAngleDegrees: inputs.controlDrumAngleDeg,
        shieldingMassFraction: inputs.shieldingMassFraction,
        yawRadians: theatreYaw,
        reducedMotion,
        selectedComponentId: investigationState.selectedComponentId,
        cueProgress: director.state.cueProgress,
        playbackOwner: investigationState.owner,
        focusIntensity: investigationState.owner === 'theatre' ? 1 : 0.72,
        cameraPosition,
        activeViewPresetId,
        explodedViewProgress,
        cameraTransitionOwner: cameraOwner,
        overlaysVisible,
        selectedAxialRegionIndex,
    }), [
        activeViewPresetId,
        cameraPosition,
        cameraOwner,
        director.state.activeCueId,
        director.state.cueProgress,
        effectiveMode,
        explodedViewProgress,
        highlightedTargetIds,
        inputs.controlDrumAngleDeg,
        inputs.massFlowKgPerSec,
        inputs.shieldingMassFraction,
        inputs.thermalPowerMw,
        outputs.channelWallCriterionMarginK,
        overlaysVisible,
        reducedMotion,
        theatreYaw,
        investigationState.owner,
        investigationState.selectedComponentId,
        selectedAxialRegionIndex,
    ]);
    const visualizationModel = useMemo(() => buildEngineVisualizationModel({
        caseLabel: workspace.model.caseLabel,
        mode: effectiveMode,
    }), [effectiveMode, workspace.model.caseLabel]);
    const visibleCalloutIds = getVisibleCalloutIds(effectiveMode);
    const legacyScene = import.meta.env.DEV
        && typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).has('legacyScene');

    const selectComponent = useCallback((componentId: SceneComponentId, owner: SceneSelectionState['owner'] = 'user') => {
        const descriptor = investigationModel.components.find((component) => component.id === componentId);
        selectInvestigationComponent(componentId, owner);
        activateLink(descriptor?.analysisLinkId ?? null);
        if (descriptor?.analysisLinkId === 'thermal-margin') setVisualizationMode('thermal');
        if (descriptor?.analysisLinkId === 'propulsion-stability') setVisualizationMode('flow');
        if (owner === 'user') selectPreset(getComponentViewPreset(componentId));
    }, [activateLink, investigationModel.components, selectInvestigationComponent, selectPreset, setVisualizationMode]);

    const restoreManualSelection = useCallback(() => {
        if (!priorSelection.current) return;
        restoreInvestigationSelection(priorSelection.current);
        const descriptor = investigationModel.components.find(
            (component) => component.id === priorSelection.current?.selectedComponentId,
        );
        activateLink(descriptor?.analysisLinkId ?? null);
        restoreTourSnapshot();
        priorSelection.current = null;
    }, [activateLink, investigationModel.components, restoreInvestigationSelection, restoreTourSnapshot]);

    useEffect(() => {
        if (director.state.activeCueIndex === null
            || !activeCue
            || director.state.playbackStatus !== 'animating') return;
        setVisualizationMode(activeCue.mode);
        selectComponent(getAdaptiveCueFocus(activeCue.id, caseIdRef.current, outputsRef.current), 'theatre');
        if (activeCue.id === 'inspect-channel' || activeCue.id === 'inspect-core') {
            const peakStation = channelEvaluation?.stations.length
                ? channelEvaluation.stations.reduce((peak, station) =>
                    station.wallTemperatureK > peak.wallTemperatureK ? station : peak)
                : undefined;
            setSelectedChannelStationIndex(peakStation?.index ?? null);
        }
        requestTheatrePose(
            {position: activeCue.cameraPosition, target: activeCue.cameraTarget},
            activeCue.explodedViewProgress,
        );
        if (reducedMotion) {
            director.setCueProgress(1);
            director.completeCueAnimation();
            return;
        }
        let current = true;
        void runGuidedDemoCue(activeCue, {onProgress: director.setCueProgress})
            .then((result) => {
                if (current && result === 'complete') director.completeCueAnimation();
            })
            .catch((error) => {
                console.error('Theatre.js guided visualization failed.', error);
                if (current) director.fail();
            });
        return () => {
            current = false;
        };
    }, [
        activeCue?.id,
        director.completeCueAnimation,
        director.fail,
        director.setCueProgress,
        director.state.activeCueIndex,
        director.state.playbackStatus,
        reducedMotion,
        selectComponent,
        requestTheatrePose,
        setVisualizationMode,
        channelEvaluation,
        setSelectedChannelStationIndex,
    ]);

    useEffect(() => {
        if (director.state.playbackStatus === 'complete') restoreManualSelection();
    }, [director.state.playbackStatus, restoreManualSelection]);

    const startTour = () => {
        if (!priorSelection.current) priorSelection.current = investigationState;
        saveTourSnapshot();
        director.replay();
    };

    const pausePlayback = () => {
        pauseGuidedDemoSequence();
        director.pause();
    };

    const resumePlayback = () => {
        resumeGuidedDemoSequence();
        director.resume();
    };

    const stopPlayback = () => {
        cancelGuidedDemoSequence();
        director.stop();
        restoreManualSelection();
    };

    const clearSelection = () => {
        if (isTourActive(director.state.playbackStatus)) return;
        selectComponent('engine-overview');
    };
    const cueInterpretation = activeCue
        ? getCueInterpretation(activeCue.interpretation, workspace.model.caseId)
        : null;
    const chooseViewPreset = (presetId: SceneViewPresetId) => {
        selectPreset(presetId);
    };
    const resetView = () => {
        selectPreset(viewPresetModel.defaultPresetId);
        setExploded(false);
    };

    return (
        <EngineVisualizationProvider initialStatus="ready" model={visualizationModel}>
            <Fragment>
                <header className="scene-command-bar">
                    <div className="scene-command-bar__identity">
                        <p className="eyebrow">interactive engineering cutaway</p>
                        <h2>Representative SNP Engine</h2>
                        <p className="scene-case-label">{workspace.model.caseLabel}</p>
                    </div>
                    <label className="scene-focus-selector">
                        Evidence focus
                        <select
                            aria-label="Engineering focus"
                            disabled={isTourActive(director.state.playbackStatus)}
                            onChange={(event) => selectComponent(event.target.value as SceneComponentId)}
                            value={investigationState.selectedComponentId}
                        >
                            {investigationModel.components.map((component) => (
                                <option key={component.id} value={component.id}>{component.label}</option>
                            ))}
                        </select>
                    </label>
                    <div className="scene-view-toolbar" aria-label="Cutaway view controls">
                        {viewPresetModel.presets.map((preset) => (
                            <button
                                aria-pressed={activeViewPresetId === preset.id}
                                disabled={isTourActive(director.state.playbackStatus)}
                                key={preset.id}
                                onClick={() => chooseViewPreset(preset.id)}
                                type="button"
                            >
                                {preset.label}
                            </button>
                        ))}
                        <button
                            aria-pressed={explodedViewProgress > 0}
                            disabled={isTourActive(director.state.playbackStatus)}
                            onClick={() => setExploded(explodedViewProgress === 0)}
                            type="button"
                        >
                            Exploded
                        </button>
                        <button disabled={isTourActive(director.state.playbackStatus)} onClick={resetView} type="button">
                            Reset View
                        </button>
                        <button
                            aria-pressed={overlaysVisible}
                            onClick={() => setDetailsVisible(!overlaysVisible)}
                            type="button"
                        >
                            {overlaysVisible ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                    <div className="theatre-controls" aria-label="Guided visualization controls">
                        {!isTourActive(director.state.playbackStatus) && (
                            <button className="theatre-smoke-button" onClick={startTour} type="button">
                                {director.state.playbackStatus === 'complete' ? 'Replay' : 'Play guided visualization'}
                            </button>
                        )}
                        {director.state.playbackStatus === 'animating' && (
                            <button className="theatre-secondary-button" onClick={pausePlayback} type="button">Pause</button>
                        )}
                        {director.state.playbackStatus === 'paused' && (
                            <button className="theatre-secondary-button" onClick={resumePlayback} type="button">Resume</button>
                        )}
                        {director.state.playbackStatus === 'waiting' && (director.state.activeCueIndex ?? 0) > 0 && (
                            <button className="theatre-secondary-button" onClick={director.previousCue} type="button">Back</button>
                        )}
                        {director.state.playbackStatus === 'waiting' && (
                            <button className="theatre-smoke-button" onClick={director.advanceCue} type="button">
                                {(director.state.activeCueIndex ?? 0) === director.model.cues.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        )}
                        {isTourActive(director.state.playbackStatus) && (
                            <button className="theatre-secondary-button" onClick={stopPlayback} type="button">Stop</button>
                        )}
                    </div>
                </header>

                <div
                    className="scene-stage"
                    data-camera-owner={cameraOwner}
                    data-camera-position={sceneWorkspace.state.cameraPose.position.join(',')}
                    data-camera-target={sceneWorkspace.state.cameraPose.target.join(',')}
                    data-presentation-preset={activeViewPresetId}
                >
                    {activeCue && isTourActive(director.state.playbackStatus) && (
                        <div className="theatre-cue-card" role="status">
                            <span>Step {(director.state.activeCueIndex ?? 0) + 1} of {director.model.cues.length}</span>
                            <strong>{activeCue.label}</strong>
                            <p>{cueInterpretation}</p>
                            <small>{director.state.playbackStatus}</small>
                            <progress
                                aria-label="Guided visualization progress"
                                max={1}
                                value={director.state.cueProgress}
                            />
                        </div>
                    )}

                    <SceneCanvas
                    cameraPosition={cameraPosition}
                    cameraTarget={cameraTarget}
                    cameraTransitionKey={cameraTransitionKey}
                    cameraTransitionPaused={director.state.playbackStatus === 'paused'}
                    controlsEnabled={!['animating', 'paused'].includes(director.state.playbackStatus)}
                    immediateCameraTransition={reducedMotion}
                    initialStatus="ready"
                    model={sceneCanvasModel}
                    onCameraTransitionComplete={completeTransition}
                    onManualCameraPoseChange={captureManualPose}
                    onPointerMissed={clearSelection}
                >
                    {legacyScene
                        ? <LegacyEngineGeometry inputs={inputs} outputs={outputs} yaw={theatreYaw}/>
                        : (
                            <>
                                <EngineAssembly
                                    model={engineAssemblyModel}
                                    onSelectComponent={selectComponent}
                                    presentation={presentation}
                                />
                                <SceneSelectionMarkers
                                    components={investigationModel.components}
                                    onSelectComponent={selectComponent}
                                    selectedComponentId={investigationState.selectedComponentId}
                                />
                            </>
                        )}
                    </SceneCanvas>

                {overlaysVisible && (
                    <SceneCalloutOverlay
                        metricOverrides={{
                            core: `${inputs.thermalPowerMw.toFixed(0)} MW reduced-order operating input`,
                            regen: `${inputs.massFlowKgPerSec.toFixed(1)} kg/s flow; ${outputs.pressureDropMpa.toFixed(2)} MPa calculated pressure drop`,
                            'fuel-margin': `${outputs.channelWallCriterionMarginK.toFixed(0)} K calculated channel-wall criterion margin`,
                        }}
                        model={calloutModel}
                        visibleCalloutIds={visibleCalloutIds}
                    />
                )}
                {!overlaysVisible && (
                    <p className="scene-claim-boundary scene-claim-boundary--compact">
                        Representative engineering visualization, not a design schematic
                    </p>
                )}

                {overlaysVisible && (
                    <SelectedComponentCard
                        component={selectedComponent}
                        fixtureNames={workspace.model.fixtures.fixtures
                            .filter((fixture) => selectedComponent.fixtureIds.includes(fixture.id))
                            .map((fixture) => `${fixture.filename} (${fixture.validationLabel})`)}
                        metric={getCurrentMetric(selectedComponent, outputs)}
                        whatIfNotice={workspace.model.caseId === 'customWhatIf'}
                    />
                )}

                    {activeCue && isTourActive(director.state.playbackStatus) && (
                        <div className="scene-caption">
                            {cueInterpretation}
                            {links.state.activeLinkId ? ` Linked concern: ${links.state.activeLinkId}.` : ''}
                        </div>
                    )}
                </div>
            </Fragment>
        </EngineVisualizationProvider>
    );
}

function LegacyEngineGeometry({
    inputs,
    outputs,
    yaw,
}: Readonly<EngineSceneProps & {yaw: number}>) {
    const hotScale = Math.min(Math.max((outputs.outletTemperatureK - 800) / 2_200, 0.15), 1);
    return (
        <group rotation={[0.1, yaw, 0]}>
            <CoreViewer
                fuelTemperatureMarginK={outputs.channelWallCriterionMarginK}
                outletTemperatureK={outputs.outletTemperatureK}
                thermalPowerMw={inputs.thermalPowerMw}
            />
            <Nozzle emphasis={1} hotScale={hotScale}/>
            {[0, 60, 120, 180, 240, 300].map((azimuthDegrees) => (
                <ControlDrum
                    angleDegrees={inputs.controlDrumAngleDeg}
                    azimuthDegrees={azimuthDegrees}
                    drumRadius={0.13}
                    emphasis={1}
                    height={2.4}
                    key={azimuthDegrees}
                    radius={1.45}
                />
            ))}
            <HydrogenFlow emphasis={1} hotScale={hotScale}/>
            <Shield emphasis={1} massFraction={inputs.shieldingMassFraction}/>
        </group>
    );
}

function getVisibleCalloutIds(mode: EngineVisualizationMode): readonly string[] {
    switch (mode) {
        case 'thermal':
            return ['core', 'fuel-margin'];
        case 'flow':
            return ['regen'];
        case 'review':
            return ['core'];
        case 'systems':
        default:
            return ['core', 'regen'];
    }
}

function getComponentViewPreset(componentId: SceneComponentId): SceneViewPresetId {
    if (componentId === 'nozzle-performance') return 'nozzle';
    if (componentId === 'feed-system' || componentId === 'main-turbopump'
        || componentId === 'power-conversion' || componentId === 'propulsion-stability') {
        return 'flow-path';
    }
    if (componentId === 'reactor-transport' || componentId === 'reactor-criticality' || componentId === 'thermal-margin') {
        return 'reactor';
    }
    return 'fit-engine';
}

function getAdaptiveCueFocus(
    cueId: string,
    caseId: string,
    outputs: EngineOutputs,
): SceneComponentId {
    if (cueId === 'follow-flow') return 'propulsion-stability';
    if (cueId === 'inspect-channel') {
        if (caseId === 'baselineStartup') return 'reactor-transport';
        if (caseId === 'thermalMarginInvestigation') return 'thermal-margin';
        return outputs.channelWallCriterionMarginK < 220 ? 'thermal-margin' : 'propulsion-stability';
    }
    if (cueId === 'correlate-evidence') return 'reactor-transport';
    return 'engine-overview';
}

function getCueInterpretation(
    interpretation: {
        readonly baseline: string;
        readonly investigation: string;
        readonly custom: string;
    },
    caseId: string,
): string {
    if (caseId === 'baselineStartup') return interpretation.baseline;
    if (caseId === 'thermalMarginInvestigation') return interpretation.investigation;
    return interpretation.custom;
}

function isTourActive(status: TheatrePlaybackStatus): boolean {
    return status === 'animating' || status === 'waiting' || status === 'paused';
}

function getCurrentMetric(component: SceneComponentDescriptor, outputs: EngineOutputs): string {
    const key = component.outputKeys[0];
    const value = outputs[key];
    return typeof value === 'number'
        ? `${key}: ${value.toLocaleString(undefined, {maximumFractionDigits: 2})}`
        : 'No reduced-order comparison is assigned.';
}

function SelectedComponentCard({
    component,
    fixtureNames,
    metric,
    whatIfNotice,
}: Readonly<{
    component: SceneComponentDescriptor;
    fixtureNames: readonly string[];
    metric: string;
    whatIfNotice: boolean;
}>) {
    return (
        <aside className="scene-selection-card" aria-live="polite">
            <p className="eyebrow">selected component</p>
            <h3>{component.label}</h3>
            <dl>
                <div><dt>Discipline</dt><dd>{component.discipline}</dd></div>
                <div><dt>Fixture evidence</dt><dd>{fixtureNames.join(', ') || 'Integrated review set'}</dd></div>
                <div><dt>Current calculation</dt><dd>{metric}</dd></div>
                <div><dt>Boundary</dt><dd>{component.claimBoundary}</dd></div>
            </dl>
            {whatIfNotice && <p>Custom What-If: bundled fixtures remain unchanged and were not rerun.</p>}
        </aside>
    );
}

function normalize(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max((value - minimum) / (maximum - minimum), 0), 1);
}

function useReducedMotion(): boolean {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(media.matches);
        update();
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, []);

    return reducedMotion;
}
