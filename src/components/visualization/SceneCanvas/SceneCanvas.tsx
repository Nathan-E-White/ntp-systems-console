import {ContactShadows, Grid, OrbitControls} from '@react-three/drei';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {
    Component,
    createContext,
    type ErrorInfo,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {Vector3} from 'three';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib';

import type {SceneCameraPose} from '../ScenePresentationWorkspace/ScenePresentationWorkspace.model';
import type {Vector3Tuple, VisualizationStatus} from '../visualizationTypes';
import type {SceneCanvasModel} from './SceneCanvas.model';
import {RecoveryState} from '../../RecoveryState';

export interface SceneCanvasProps {
    readonly model: SceneCanvasModel;
    readonly initialStatus?: VisualizationStatus;
    readonly cameraTarget?: Vector3Tuple;
    readonly children?: ReactNode;
    readonly controlsEnabled?: boolean;
    readonly onPointerMissed?: () => void;
    readonly cameraPosition?: Vector3Tuple;
    readonly cameraTransitionKey?: string;
    readonly immediateCameraTransition?: boolean;
    readonly cameraTransitionPaused?: boolean;
    readonly onCameraTransitionComplete?: (pose: SceneCameraPose) => void;
    readonly onManualCameraPoseChange?: (pose: SceneCameraPose) => void;
}

export interface SceneCanvasState {
    readonly status: VisualizationStatus;
    readonly errorMessage: string | null;
}

export interface SceneCanvasContextValue {
    readonly model: SceneCanvasModel;
    readonly state: SceneCanvasState;
    readonly reportError: (message: string) => void;
}

export interface SceneCanvasProviderProps extends SceneCanvasProps {
    readonly children: ReactNode;
}

const SceneCanvasContext = createContext<SceneCanvasContextValue | undefined>(undefined);

/** Boundary: browser/WebGL capability handling. Scope: render infrastructure, never domain interpretation. */
export function SceneCanvasProvider({
    model,
    initialStatus = 'stub',
    children,
}: Readonly<SceneCanvasProviderProps>) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const value = useMemo<SceneCanvasContextValue>(() => ({
        model,
        state: {status: errorMessage ? 'error' : initialStatus, errorMessage},
        reportError: setErrorMessage,
    }), [errorMessage, initialStatus, model]);

    return <SceneCanvasContext.Provider value={value}>{children}</SceneCanvasContext.Provider>;
}

export function useSceneCanvas(): SceneCanvasContextValue {
    const context = useContext(SceneCanvasContext);
    if (!context) throw new Error('useSceneCanvas must be used inside SceneCanvasProvider.');
    return context;
}

function CameraRig({
    target,
    position,
    transitionKey,
    immediate,
    paused,
    onComplete,
}: Readonly<{
    target: Vector3Tuple;
    position: Vector3Tuple;
    transitionKey: string;
    immediate: boolean;
    paused: boolean;
    onComplete?: (pose: SceneCameraPose) => void;
}>) {
    const getThree = useThree((state) => state.get);
    const camera = useThree((state) => state.camera);
    const targetVector = useMemo(() => new Vector3(...target), [target]);
    const positionVector = useMemo(() => new Vector3(...position), [position]);
    const transition = useRef({
        active: true,
        initialized: false,
        elapsed: 0,
        startPosition: new Vector3(),
        startTarget: new Vector3(),
    });

    useEffect(() => {
        transition.current.active = true;
        transition.current.initialized = false;
        transition.current.elapsed = 0;
        camera.lookAt(targetVector);
    }, [camera, targetVector, transitionKey]);

    useFrame((_, delta) => {
        if (paused) return;
        if (!transition.current.active) return;
        const controls = getThree().controls;
        const orbitControls = controls && 'target' in controls
            ? controls as unknown as {target: Vector3; update: () => void}
            : null;
        if (!transition.current.initialized) {
            transition.current.startPosition.copy(camera.position);
            transition.current.startTarget.copy(orbitControls?.target ?? targetVector);
            transition.current.initialized = true;
        }
        transition.current.elapsed += immediate ? 1 : delta;
        const duration = immediate ? 0 : 0.85;
        const linearProgress = duration === 0 ? 1 : Math.min(transition.current.elapsed / duration, 1);
        const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
        camera.position.lerpVectors(transition.current.startPosition, positionVector, progress);
        if (orbitControls) {
            orbitControls.target.lerpVectors(transition.current.startTarget, targetVector, progress);
            orbitControls.update();
        } else {
            camera.lookAt(targetVector);
        }
        if (linearProgress >= 1) {
            transition.current.active = false;
            onComplete?.({
                position: camera.position.toArray() as unknown as Vector3Tuple,
                target: orbitControls?.target.toArray() as unknown as Vector3Tuple ?? target,
            });
        }
    });

    return null;
}

function PresenterOrbitControls({
    enabled,
    onManualCameraPoseChange,
}: Readonly<{
    enabled: boolean;
    onManualCameraPoseChange?: (pose: SceneCameraPose) => void;
}>) {
    const camera = useThree((state) => state.camera);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const reportPose = useCallback(() => {
        const controls = controlsRef.current;
        if (!controls) return;
        onManualCameraPoseChange?.({
            position: camera.position.toArray() as unknown as Vector3Tuple,
            target: controls.target.toArray() as unknown as Vector3Tuple,
        });
    }, [camera, onManualCameraPoseChange]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableDamping
            enabled={enabled}
            enablePan={false}
            makeDefault
            maxDistance={18}
            minDistance={6}
            onEnd={reportPose}
        />
    );
}

class SceneErrorBoundary extends Component<
    Readonly<{children: ReactNode; fallback: ReactNode; onError: (message: string) => void}>,
    Readonly<{failed: boolean}>
> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        this.props.onError(`${error.message}\n${info.componentStack ?? ''}`);
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

function SceneFallback({message}: Readonly<{message: string}>) {
    return <div className="scene-webgl-fallback"><RecoveryState detail={message} kind="webgl-fallback"/></div>;
}

export function SceneCanvasView({
    children,
    cameraTarget = [0, -0.45, 0],
    cameraPosition,
    controlsEnabled = true,
    onPointerMissed,
    cameraTransitionKey = 'initial',
    immediateCameraTransition = false,
    cameraTransitionPaused = false,
    onCameraTransitionComplete,
    onManualCameraPoseChange,
}: Readonly<Pick<SceneCanvasProps, 'children' | 'cameraTarget' | 'cameraPosition' | 'controlsEnabled' | 'onPointerMissed' | 'cameraTransitionKey' | 'immediateCameraTransition' | 'cameraTransitionPaused' | 'onCameraTransitionComplete' | 'onManualCameraPoseChange'>>) {
    const {model, state, reportError} = useSceneCanvas();

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="3D scene canvas"
                data-camera-fov={model.fieldOfViewDegrees}
                data-scope="scene-canvas"
                data-status={state.status}
                role="img"
            >
                {children}
            </div>
        );
    }

    return (
        <SceneErrorBoundary
            fallback={<SceneFallback message="WebGL could not initialize in this browser."/>}
            onError={reportError}
        >
            <Canvas
                aria-label="3D scene canvas"
                camera={{position: [...model.cameraPosition], fov: model.fieldOfViewDegrees}}
                dpr={[1, 1.75]}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: true,
                }}
                onCreated={({gl}) => gl.setClearColor(model.background)}
                onPointerMissed={onPointerMissed}
                role="img"
                shadows="basic"
            >
                <ambientLight intensity={0.28}/>
                <hemisphereLight args={['#d8e8ef', '#111820', 0.48]}/>
                <directionalLight castShadow intensity={2.4} position={[6, 9, 7]} shadow-mapSize={[1024, 1024]}/>
                <directionalLight color="#72a9c3" intensity={1.05} position={[-6, 2, -5]}/>
                <pointLight color="#e77638" intensity={0.8} position={[0, 0.3, 1.2]}/>
                <Grid
                    args={[24, 24]}
                    cellColor="#31404c"
                    cellSize={0.5}
                    cellThickness={0.45}
                    fadeDistance={18}
                    fadeStrength={1.8}
                    position={[0, -3.55, 0]}
                    sectionColor="#536979"
                    sectionSize={2}
                    sectionThickness={0.8}
                />
                <ContactShadows
                    blur={2.8}
                    far={8}
                    opacity={0.42}
                    position={[0, -3.48, 0]}
                    resolution={512}
                    scale={14}
                />
                {children}
                <PresenterOrbitControls
                    enabled={controlsEnabled}
                    onManualCameraPoseChange={onManualCameraPoseChange}
                />
                <CameraRig
                    immediate={immediateCameraTransition}
                    onComplete={onCameraTransitionComplete}
                    paused={cameraTransitionPaused}
                    position={cameraPosition ?? model.cameraPosition}
                    target={cameraTarget}
                    transitionKey={cameraTransitionKey}
                />
            </Canvas>
        </SceneErrorBoundary>
    );
}

export function SceneCanvas({
    children,
    cameraTarget,
    cameraPosition,
    cameraTransitionKey,
    immediateCameraTransition,
    cameraTransitionPaused,
    onCameraTransitionComplete,
    onManualCameraPoseChange,
    controlsEnabled,
    onPointerMissed,
    ...props
}: Readonly<SceneCanvasProps>) {
    return (
        <SceneCanvasProvider {...props}>
            <SceneCanvasView
                cameraPosition={cameraPosition}
                cameraTarget={cameraTarget}
                cameraTransitionKey={cameraTransitionKey}
                cameraTransitionPaused={cameraTransitionPaused}
                controlsEnabled={controlsEnabled}
                immediateCameraTransition={immediateCameraTransition}
                onCameraTransitionComplete={onCameraTransitionComplete}
                onManualCameraPoseChange={onManualCameraPoseChange}
                onPointerMissed={onPointerMissed}
            >
                {children}
            </SceneCanvasView>
        </SceneCanvasProvider>
    );
}
