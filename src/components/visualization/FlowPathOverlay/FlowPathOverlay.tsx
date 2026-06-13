import {Line} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {
    createContext,
    type ReactNode,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import type {Group} from 'three';

import type {ScenePresentationState, Vector3Tuple} from '../visualizationTypes';
import type {
    FlowPathOverlayModel,
    FlowPathTemperatureClass,
} from './FlowPathOverlay.model';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export interface FlowPathOverlayProps {
    readonly model: FlowPathOverlayModel;
    readonly presentation?: ScenePresentationState;
    readonly initiallyAnimated?: boolean;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface FlowPathOverlayState {
    readonly animated: boolean;
    readonly progress: number;
}

export interface FlowPathOverlayContextValue {
    readonly model: FlowPathOverlayModel;
    readonly state: FlowPathOverlayState;
    readonly setAnimated: (animated: boolean) => void;
    readonly setProgress: (progress: number) => void;
}

export interface FlowPathOverlayProviderProps extends FlowPathOverlayProps {
    readonly children: ReactNode;
}

const FlowPathOverlayContext = createContext<FlowPathOverlayContextValue | undefined>(undefined);

/** Boundary: visual flow storytelling. Scope: path animation driven by supplied normalized values. */
export function FlowPathOverlayProvider({
    model,
    initiallyAnimated = false,
    children,
}: Readonly<FlowPathOverlayProviderProps>) {
    const [animated, setAnimated] = useState(initiallyAnimated);
    const [progress, setProgress] = useState(0);
    const value = useMemo(() => ({
        model,
        state: {animated, progress},
        setAnimated,
        setProgress,
    }), [animated, model, progress]);
    return <FlowPathOverlayContext.Provider value={value}>{children}</FlowPathOverlayContext.Provider>;
}

export function useFlowPathOverlay(): FlowPathOverlayContextValue {
    const context = useContext(FlowPathOverlayContext);
    if (!context) throw new Error('useFlowPathOverlay must be used inside FlowPathOverlayProvider.');
    return context;
}

const flowColors: Readonly<Record<FlowPathTemperatureClass, string>> = {
    cryogenic: '#62c8f2',
    warming: '#e2c769',
    hot: '#ff7438',
};

function FlowParticles({
    points,
    flowRate,
}: Readonly<{points: readonly Vector3Tuple[]; flowRate: number}>) {
    const group = useRef<Group>(null);

    useFrame(({clock}) => {
        if (!group.current) return;
        const children = group.current.children;
        children.forEach((particle, index) => {
            const phase = (clock.elapsedTime * (0.18 + flowRate * 0.42) + index / children.length) % 1;
            const scaled = phase * (points.length - 1);
            const segmentIndex = Math.min(Math.floor(scaled), points.length - 2);
            const local = scaled - segmentIndex;
            const start = points[segmentIndex];
            const end = points[segmentIndex + 1];
            particle.position.set(
                start[0] + (end[0] - start[0]) * local,
                start[1] + (end[1] - start[1]) * local,
                start[2] + (end[2] - start[2]) * local,
            );
        });
    });

    return (
        <group ref={group}>
            {Array.from({length: 12}, (_, index) => (
                <mesh key={`flow-particle-${index}`}>
                    <sphereGeometry args={[0.055, 12, 12]}/>
                    <meshBasicMaterial color={index < 7 ? '#74d4f6' : '#ff8a48'}/>
                </mesh>
            ))}
        </group>
    );
}

export function FlowPathOverlayView({
    presentation,
    onSelectComponent,
}: Readonly<Pick<FlowPathOverlayProps, 'presentation' | 'onSelectComponent'>>) {
    const {model, state} = useFlowPathOverlay();
    const nodeMap = useMemo(
        () => new Map(model.nodes.map((node) => [node.id, node.position])),
        [model.nodes],
    );
    const highlighted = presentation?.highlightedTargetIds.includes('flow-path-overlay') ?? false;
    const orderedPoints = model.nodes.map((node) => node.position);
    const animate = state.animated && !(presentation?.reducedMotion ?? false);

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Propellant flow-path overlay"
                data-animated={animate}
                data-highlighted={highlighted}
                data-scope="flow-path-overlay"
                data-segment-count={model.segments.length}
                role="img"
            />
        );
    }

    return (
        <group
            name="flow-path-overlay"
            onClick={(event) => {
                event.stopPropagation();
                onSelectComponent?.('propulsion-stability');
            }}
        >
            {model.segments.map((segment) => {
                const start = nodeMap.get(segment.fromNodeId);
                const end = nodeMap.get(segment.toNodeId);
                if (!start || !end) return null;
                return (
                    <Line
                        color={flowColors[segment.temperatureClass]}
                        key={segment.id}
                        lineWidth={highlighted ? 4 : 2.2}
                        opacity={highlighted ? 1 : 0.7}
                        points={[start, end]}
                        transparent
                    />
                );
            })}
            {animate && (
                <FlowParticles
                    flowRate={presentation?.flowRate ?? 0.5}
                    points={orderedPoints}
                />
            )}
        </group>
    );
}

export function FlowPathOverlay({presentation, onSelectComponent, ...props}: Readonly<FlowPathOverlayProps>) {
    return (
        <FlowPathOverlayProvider {...props}>
            <FlowPathOverlayView onSelectComponent={onSelectComponent} presentation={presentation}/>
        </FlowPathOverlayProvider>
    );
}
