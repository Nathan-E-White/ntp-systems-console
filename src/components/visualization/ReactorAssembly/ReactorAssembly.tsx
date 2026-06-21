import {Edges} from '@react-three/drei';
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {ScenePresentationState} from '../visualizationTypes';
import type {ReactorAssemblyModel} from './ReactorAssembly.model';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export interface ReactorAssemblyProps {
    readonly model: ReactorAssemblyModel;
    readonly presentation?: ScenePresentationState;
    readonly initialHighlightedRegionId?: string | null;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface ReactorAssemblyState {
    readonly highlightedRegionId: string | null;
}

export interface ReactorAssemblyContextValue {
    readonly model: ReactorAssemblyModel;
    readonly state: ReactorAssemblyState;
    readonly highlightRegion: (regionId: string | null) => void;
}

export interface ReactorAssemblyProviderProps extends ReactorAssemblyProps {
    readonly children: ReactNode;
}

const ReactorAssemblyContext = createContext<ReactorAssemblyContextValue | undefined>(undefined);

/** Boundary: reactor-package visual approximation. Scope: fixture traceability, not neutronics claims. */
export function ReactorAssemblyProvider({
    model,
    initialHighlightedRegionId = null,
    children,
}: Readonly<ReactorAssemblyProviderProps>) {
    const [highlightedRegionId, highlightRegion] = useState<string | null>(initialHighlightedRegionId);
    const value = useMemo(() => ({
        model,
        state: {highlightedRegionId},
        highlightRegion,
    }), [highlightedRegionId, model]);
    return <ReactorAssemblyContext.Provider value={value}>{children}</ReactorAssemblyContext.Provider>;
}

export function useReactorAssembly(): ReactorAssemblyContextValue {
    const context = useContext(ReactorAssemblyContext);
    if (!context) throw new Error('useReactorAssembly must be used inside ReactorAssemblyProvider.');
    return context;
}

const defaultPresentation: ScenePresentationState = {
    mode: 'systems',
    activeCueId: null,
    highlightedTargetIds: [],
    thermalPower: 0.5,
    flowRate: 0.5,
    thermalMargin: 0.5,
    controlDrumAngleDegrees: 45,
    shieldingMassFraction: 0.08,
    yawRadians: 0,
    reducedMotion: false,
    selectedComponentId: 'engine-overview',
    cueProgress: 0,
    playbackOwner: 'user',
    focusIntensity: 0,
    cameraPosition: [6, 3.5, 8],
    activeViewPresetId: 'reactor',
    cutawayMode: 'assembled',
    explodedViewProgress: 0,
    cameraTransitionOwner: 'user',
    overlaysVisible: false,
    selectedAxialRegionIndex: null,
};

const cutStart = 0.35;
const cutLength = 5.15;
const fuelChannelCoordinates = [
    [0, 0],
    [0.28, 0], [-0.28, 0], [0.14, 0.24], [-0.14, 0.24], [0.14, -0.24], [-0.14, -0.24],
    [0.48, 0], [-0.48, 0], [0.24, 0.42], [-0.24, 0.42], [0.24, -0.42], [-0.24, -0.42],
] as const;

export function ReactorAssemblyView({
    presentation = defaultPresentation,
    onSelectComponent,
}: Readonly<Pick<ReactorAssemblyProps, 'presentation' | 'onSelectComponent'>>) {
    const {model, state} = useReactorAssembly();
    const highlighted = presentation.highlightedTargetIds.includes(model.id);
    const displayLength = model.activeCoreLengthM * 2;
    const regionLength = displayLength / model.axialRegionCount;
    const coreRadius = model.activeCoreRadiusM * 2;
    const glow = 0.25 + presentation.thermalPower * 1.7 + (highlighted ? 0.65 : 0);
    const marginConcern = 1 - presentation.thermalMargin;
    const exploded = presentation.explodedViewProgress;
    const cutawayMode = presentation.cutawayMode;
    const layerReveal = cutawayMode === 'layers' || cutawayMode === 'evidence' ? 1 : 0;
    const thermalReveal = cutawayMode === 'thermal' ? 1 : 0;
    const reflectorRadius = coreRadius * (1.28 + exploded * 0.1 + layerReveal * 0.06);
    const vesselRadius = coreRadius * (1.63 + exploded * 0.22 + layerReveal * 0.1);
    const drumRadius = coreRadius * (1.43 + exploded * 0.16 + layerReveal * 0.06);

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Representative reactor assembly"
                data-control-angle={presentation.controlDrumAngleDegrees}
                data-cutaway-mode={cutawayMode}
                data-evidence-marker-count={cutawayMode === 'evidence' ? 3 : 0}
                data-highlighted={highlighted}
                data-highlighted-region={state.highlightedRegionId ?? 'none'}
                data-selected-axial-region={presentation.selectedAxialRegionIndex ?? 'none'}
                data-region-layout={`${model.axialRegionCount}x${model.azimuthalSectorCount}`}
                data-section-layer-count="4"
                data-fuel-channel-count={fuelChannelCoordinates.length}
                data-scope="reactor-assembly"
                role="group"
            />
        );
    }

    return (
        <group
            name={model.id}
            position={[0, 0.25, 0]}
        >
            {Array.from({length: model.axialRegionCount}, (_, index) => {
                const middleRegion = index === 1;
                const selectedRegion = presentation.selectedAxialRegionIndex === index;
                return (
                    <mesh
                        key={`axial-region-${index}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelectComponent?.('reactor-transport');
                        }}
                        position={[0, (index - 1) * regionLength, 0]}
                    >
                        <cylinderGeometry args={[coreRadius, coreRadius, regionLength * 0.94, 48, 1, false, cutStart, cutLength]}/>
                        <meshStandardMaterial
                            color={selectedRegion || thermalReveal ? '#e18a4c' : middleRegion ? '#b45b32' : '#7f4834'}
                            emissive={selectedRegion ? '#ffd07c' : middleRegion ? '#ff6d22' : '#d44b1b'}
                            emissiveIntensity={glow * (selectedRegion ? 1.75 : thermalReveal ? 1.25 : middleRegion ? 1.15 : 0.82)}
                            metalness={0.12}
                            roughness={0.62}
                        />
                        <Edges color={selectedRegion ? '#ffe0a6' : '#c87948'} threshold={30}/>
                    </mesh>
                );
            })}

            {fuelChannelCoordinates.map(([x, z], index) => (
                <mesh key={`fuel-channel-${index}`} position={[x, 0, z]}>
                    <cylinderGeometry args={[0.035, 0.035, displayLength * 0.92, 12]}/>
                    <meshStandardMaterial
                            color="#d7b37e"
                            emissive="#dd672d"
                            emissiveIntensity={glow * (0.34 + layerReveal * 0.18 + thermalReveal * 0.12)}
                        metalness={0.25}
                        roughness={0.48}
                    />
                </mesh>
            ))}

            {Array.from({length: model.azimuthalSectorCount}, (_, index) => (
                <mesh
                    key={`sector-guide-${index}`}
                    position={[0, 0, 0]}
                    rotation={[0, index * Math.PI / 3, 0]}
                >
                    <boxGeometry args={[0.018, displayLength * 0.98, coreRadius * 1.9]}/>
                    <meshBasicMaterial color="#ffd29b" opacity={0.34} transparent/>
                </mesh>
            ))}

            <mesh position={[layerReveal * 0.12, 0, layerReveal * 0.08]} onClick={(event) => {
                event.stopPropagation();
                onSelectComponent?.('reactor-criticality');
            }}>
                <cylinderGeometry args={[reflectorRadius, reflectorRadius, displayLength * 1.07, 64, 1, true, cutStart, cutLength]}/>
                <meshStandardMaterial color="#7f8279" metalness={0.35} opacity={layerReveal ? 0.32 : 0.48} roughness={0.55} transparent/>
                <Edges color="#8b8172" threshold={26}/>
            </mesh>
            <mesh position={[layerReveal * 0.22, 0, layerReveal * 0.14]}>
                <cylinderGeometry args={[vesselRadius, vesselRadius, displayLength * 1.18, 64, 1, true, cutStart, cutLength]}/>
                <meshStandardMaterial
                    color={highlighted ? '#95bbca' : '#59636b'}
                    emissive="#4b8398"
                    emissiveIntensity={highlighted || cutawayMode === 'evidence' ? 0.48 : 0.08}
                    metalness={0.72}
                    opacity={layerReveal ? 0.18 : 0.28}
                    roughness={0.28}
                    transparent
                />
                <Edges color={highlighted ? '#83b6c8' : '#617481'} threshold={26}/>
            </mesh>

            {[cutStart, cutStart + cutLength].map((angle) => (
                <mesh
                    key={`section-face-${angle}`}
                    position={[Math.cos(angle) * vesselRadius * 0.5, 0, Math.sin(angle) * vesselRadius * 0.5]}
                    rotation={[0, -angle, 0]}
                >
                    <boxGeometry args={[vesselRadius, displayLength * 1.17, 0.035]}/>
                    <meshStandardMaterial color="#b99c78" metalness={0.28} roughness={0.58}/>
                </mesh>
            ))}

            {[-regionLength * 0.5, regionLength * 0.5].map((y) => (
                <mesh key={`axial-separator-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[coreRadius * 0.92, 0.018, 8, 48, cutLength]}/>
                    <meshStandardMaterial color="#e1c09a" emissive="#d16b38" emissiveIntensity={0.2}/>
                </mesh>
            ))}

            {Array.from({length: model.controlDrumCount}, (_, index) => {
                const azimuth = index * Math.PI * 2 / model.controlDrumCount;
                const radius = drumRadius;
                return (
                    <group
                        key={`control-drum-${index}`}
                    position={[Math.cos(azimuth) * radius + layerReveal * 0.08 * Math.cos(azimuth), 0, Math.sin(azimuth) * radius + layerReveal * 0.08 * Math.sin(azimuth)]}
                        rotation={[0, -azimuth, 0]}
                    >
                        <mesh>
                            <cylinderGeometry args={[0.105, 0.105, displayLength * 0.92, 20]}/>
                            <meshStandardMaterial color="#6d7378" metalness={0.82} roughness={0.3}/>
                            <Edges color="#7d8b93" threshold={28}/>
                        </mesh>
                        <group rotation={[0, presentation.controlDrumAngleDegrees * Math.PI / 180, 0]}>
                            <mesh position={[0.09, 0, 0]}>
                                <boxGeometry args={[0.045, displayLength * 0.88, 0.12]}/>
                                <meshStandardMaterial
                                    color="#44312a"
                                    emissive="#b45b32"
                                    emissiveIntensity={0.12 + marginConcern * 0.35}
                                    roughness={0.7}
                                />
                                <Edges color="#d8a36f" threshold={20}/>
                            </mesh>
                        </group>
                    </group>
                );
            })}

            <mesh position={[0, displayLength * 0.67 + exploded * 0.28, 0]}>
                <cylinderGeometry args={[coreRadius * (1.78 + exploded * 0.18), coreRadius * (1.52 + exploded * 0.18), 0.24, 64, 1, true, cutStart, cutLength]}/>
                <meshStandardMaterial
                    color="#7c8790"
                    metalness={0.78}
                    opacity={0.2 + presentation.shieldingMassFraction}
                    roughness={0.3}
                    transparent
                />
                <Edges color="#718794" threshold={28}/>
            </mesh>

            {cutawayMode === 'evidence' && [
                {id: 'mcnp', y: -regionLength, color: '#d6ad62'},
                {id: 'moose', y: 0, color: '#bb8cc6'},
                {id: 'rocets', y: regionLength, color: '#65b9d8'},
            ].map((marker) => (
                <mesh key={`evidence-marker-${marker.id}`} position={[0, marker.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[coreRadius * 1.08, 0.02, 8, 64, cutLength]}/>
                    <meshBasicMaterial color={marker.color}/>
                </mesh>
            ))}
        </group>
    );
}

export function ReactorAssembly({presentation, onSelectComponent, ...props}: Readonly<ReactorAssemblyProps>) {
    return (
        <ReactorAssemblyProvider {...props}>
            <ReactorAssemblyView onSelectComponent={onSelectComponent} presentation={presentation}/>
        </ReactorAssemblyProvider>
    );
}
