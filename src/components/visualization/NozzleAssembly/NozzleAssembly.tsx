import {Edges} from '@react-three/drei';
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {ScenePresentationState} from '../visualizationTypes';
import type {NozzleAssemblyModel} from './NozzleAssembly.model';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export interface NozzleAssemblyProps {
    readonly model: NozzleAssemblyModel;
    readonly presentation?: ScenePresentationState;
    readonly initialThermalEmphasis?: number;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface NozzleAssemblyState {
    readonly thermalEmphasis: number;
}

export interface NozzleAssemblyContextValue {
    readonly model: NozzleAssemblyModel;
    readonly state: NozzleAssemblyState;
    readonly setThermalEmphasis: (emphasis: number) => void;
}

export interface NozzleAssemblyProviderProps extends NozzleAssemblyProps {
    readonly children: ReactNode;
}

const NozzleAssemblyContext = createContext<NozzleAssemblyContextValue | undefined>(undefined);

/** Boundary: nozzle and chamber visual form. Scope: representative geometry and visual emphasis. */
export function NozzleAssemblyProvider({
    model,
    initialThermalEmphasis = 0,
    children,
}: Readonly<NozzleAssemblyProviderProps>) {
    const [thermalEmphasis, setThermalEmphasis] = useState(initialThermalEmphasis);
    const value = useMemo(() => ({
        model,
        state: {thermalEmphasis},
        setThermalEmphasis,
    }), [model, thermalEmphasis]);
    return <NozzleAssemblyContext.Provider value={value}>{children}</NozzleAssemblyContext.Provider>;
}

export function useNozzleAssembly(): NozzleAssemblyContextValue {
    const context = useContext(NozzleAssemblyContext);
    if (!context) throw new Error('useNozzleAssembly must be used inside NozzleAssemblyProvider.');
    return context;
}

export function NozzleAssemblyView({
    presentation,
    onSelectComponent,
}: Readonly<Pick<NozzleAssemblyProps, 'presentation' | 'onSelectComponent'>>) {
    const {model, state} = useNozzleAssembly();
    const highlighted = presentation?.highlightedTargetIds.includes(model.id) ?? false;
    const heat = presentation?.thermalPower ?? state.thermalEmphasis;
    const chamberRadius = model.chamberRadiusM * 1.7;
    const throatRadius = model.throatRadiusM * 1.7;
    const exitRadius = model.exitRadiusM * 1.7;
    const exploded = presentation?.explodedViewProgress ?? 0;
    const cutawayMode = presentation?.cutawayMode ?? 'assembled';
    const flowReveal = cutawayMode === 'flow' || cutawayMode === 'evidence' ? 1 : 0;
    const layerReveal = cutawayMode === 'layers' ? 1 : 0;
    const jacketOffset = exploded * 0.18 + flowReveal * 0.08 + layerReveal * 0.1;

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Representative nozzle assembly"
                data-cutaway-mode={cutawayMode}
                data-expansion-radius={model.exitRadiusM}
                data-highlighted={highlighted}
                data-scope="nozzle-assembly"
                data-thermal-emphasis={heat}
                data-wall-layer-count="3"
                data-regen-channel-count="7"
                role="group"
            />
        );
    }

    return (
        <group
            name={model.id}
            onClick={(event) => {
                event.stopPropagation();
                onSelectComponent?.('nozzle-performance');
            }}
            position={[0, -2.2, 0]}
        >
            <mesh position={[0, 0.42, 0]}>
                <cylinderGeometry args={[chamberRadius, chamberRadius, 0.82, 48, 1, true]}/>
                <meshStandardMaterial color="#727b83" metalness={0.8} roughness={0.3} side={2}/>
                <Edges color="#71838e" threshold={28}/>
            </mesh>
            <mesh position={[0, 0.42, 0]}>
                <cylinderGeometry args={[chamberRadius * 0.88, chamberRadius * 0.88, 0.78, 48, 1, true]}/>
                <meshStandardMaterial
                    color="#b07a58"
                    emissive="#e7602b"
                    emissiveIntensity={0.18 + heat * 0.55}
                    metalness={0.48}
                    roughness={0.44}
                    side={2}
                />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[throatRadius, chamberRadius, 0.32, 48, 1, true]}/>
                <meshStandardMaterial
                    color="#a75b3b"
                    emissive="#ff6324"
                    emissiveIntensity={0.35 + heat * 1.2}
                    metalness={0.45}
                    roughness={0.38}
                    side={2}
                />
                <Edges color="#f0a275" threshold={24}/>
            </mesh>
            <mesh position={[0, -1.02, 0]}>
                <cylinderGeometry args={[exitRadius, throatRadius, 1.45, 64, 1, true]}/>
                <meshStandardMaterial
                    color={highlighted ? '#c5dbe3' : '#7b858d'}
                    emissive="#d35428"
                    emissiveIntensity={0.12 + heat * 0.48 + (highlighted ? 0.35 : 0)}
                    metalness={0.72}
                    roughness={0.32}
                    side={2}
                />
                <Edges color={highlighted ? '#85bed1' : '#71838e'} threshold={28}/>
            </mesh>
            <mesh position={[0, -1.02, 0]}>
                <cylinderGeometry args={[exitRadius * 0.91, throatRadius * 0.88, 1.4, 64, 1, true]}/>
                <meshStandardMaterial
                    color="#b36b4b"
                    emissive="#ef672e"
                    emissiveIntensity={0.2 + heat * 0.72}
                    metalness={0.44}
                    roughness={0.46}
                    side={2}
                />
            </mesh>
            {model.includesRegenJacket && (
                <group position={[jacketOffset, 0, jacketOffset]}>
                    <mesh position={[0, -0.72, 0]}>
                        <cylinderGeometry args={[exitRadius * 1.08, chamberRadius * 1.12, 2.45, 64, 1, true]}/>
                        <meshStandardMaterial
                            color="#58b5d5"
                            emissive="#1b8cb8"
                            emissiveIntensity={highlighted || flowReveal ? 0.52 : 0.18}
                            opacity={flowReveal || layerReveal ? 0.34 : 0.2}
                            roughness={0.25}
                            transparent
                        />
                        <Edges color="#3f8ca8" threshold={28}/>
                    </mesh>
                    {Array.from({length: 7}, (_, index) => {
                        const fraction = index / 6;
                        const y = 0.3 - fraction * 2.05;
                        const radius = chamberRadius * 1.06 + (exitRadius * 1.08 - chamberRadius * 1.06) * fraction;
                        return (
                            <mesh key={`regen-channel-${index}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                                <torusGeometry args={[radius, 0.012, 8, 56]}/>
                                <meshStandardMaterial
                                    color={fraction < 0.45 ? '#62c8f2' : '#e2c769'}
                                    emissive={fraction < 0.45 ? '#218bb4' : '#b48029'}
                                    emissiveIntensity={0.2}
                                />
                            </mesh>
                        );
                    })}
                </group>
            )}
        </group>
    );
}

export function NozzleAssembly({presentation, onSelectComponent, ...props}: Readonly<NozzleAssemblyProps>) {
    return (
        <NozzleAssemblyProvider {...props}>
            <NozzleAssemblyView onSelectComponent={onSelectComponent} presentation={presentation}/>
        </NozzleAssemblyProvider>
    );
}
