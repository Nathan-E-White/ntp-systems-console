import {Edges} from '@react-three/drei';
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {ScenePresentationState} from '../visualizationTypes';
import type {PowerConversionAssemblyModel} from './PowerConversionAssembly.model';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export interface PowerConversionAssemblyProps {
    readonly model: PowerConversionAssemblyModel;
    readonly presentation?: ScenePresentationState;
    readonly initialActiveBranchId?: string | null;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface PowerConversionAssemblyState {
    readonly activeBranchId: string | null;
}

export interface PowerConversionAssemblyContextValue {
    readonly model: PowerConversionAssemblyModel;
    readonly state: PowerConversionAssemblyState;
    readonly setActiveBranch: (branchId: string | null) => void;
}

export interface PowerConversionAssemblyProviderProps extends PowerConversionAssemblyProps {
    readonly children: ReactNode;
}

const PowerConversionAssemblyContext = createContext<PowerConversionAssemblyContextValue | undefined>(undefined);

/** Boundary: turbine-drive topology. Scope: visual branch routing, never thermodynamic closure. */
export function PowerConversionAssemblyProvider({
    model,
    initialActiveBranchId = null,
    children,
}: Readonly<PowerConversionAssemblyProviderProps>) {
    const [activeBranchId, setActiveBranch] = useState<string | null>(initialActiveBranchId);
    const value = useMemo(() => ({
        model,
        state: {activeBranchId},
        setActiveBranch,
    }), [activeBranchId, model]);
    return (
        <PowerConversionAssemblyContext.Provider value={value}>
            {children}
        </PowerConversionAssemblyContext.Provider>
    );
}

export function usePowerConversionAssembly(): PowerConversionAssemblyContextValue {
    const context = useContext(PowerConversionAssemblyContext);
    if (!context) throw new Error('usePowerConversionAssembly must be used inside PowerConversionAssemblyProvider.');
    return context;
}

export function PowerConversionAssemblyView({
    presentation,
    onSelectComponent,
}: Readonly<Pick<PowerConversionAssemblyProps, 'presentation' | 'onSelectComponent'>>) {
    const {model, state} = usePowerConversionAssembly();
    const highlighted = presentation?.highlightedTargetIds.includes(model.id) ?? false;
    const branchGlow = highlighted ? 0.6 : 0.15;

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Representative power-conversion assembly"
                data-active-branch={state.activeBranchId ?? 'none'}
                data-branch-count={model.branchIds.length}
                data-highlighted={highlighted}
                data-scope="power-conversion-assembly"
                role="group"
            />
        );
    }

    return (
        <group
            name={model.id}
            onClick={(event) => {
                event.stopPropagation();
                onSelectComponent?.('power-conversion');
            }}
        >
            <group name={model.turbineId} position={[1.65, -0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh>
                    <cylinderGeometry args={[0.38, 0.38, 0.52, 32, 1, true]}/>
                    <meshStandardMaterial
                        color={highlighted ? '#d19a74' : '#746c68'}
                        emissive="#e56a32"
                        emissiveIntensity={branchGlow}
                        metalness={0.78}
                        opacity={0.86}
                        roughness={0.3}
                        transparent
                    />
                    <Edges color="#c2b2a8" threshold={24}/>
                </mesh>
                <mesh>
                    <cylinderGeometry args={[0.09, 0.09, 0.62, 20]}/>
                    <meshStandardMaterial color="#b4bbc0" metalness={0.9} roughness={0.2}/>
                </mesh>
                {Array.from({length: 8}, (_, index) => (
                    <mesh key={`turbine-blade-${index}`} rotation={[0, index * Math.PI / 4, 0]} position={[0.18, 0, 0]}>
                        <boxGeometry args={[0.24, 0.055, 0.22]}/>
                        <meshStandardMaterial color="#a37b68" emissive="#d95e2d" emissiveIntensity={branchGlow * 0.65}/>
                    </mesh>
                ))}
            </group>
            <mesh name={model.mixerId} position={[1.05, -1.45, 0]}>
                <cylinderGeometry args={[0.22, 0.34, 0.52, 24]}/>
                <meshStandardMaterial
                    color="#7b736f"
                    emissive="#e56a32"
                    emissiveIntensity={branchGlow * 0.8}
                    metalness={0.7}
                    roughness={0.36}
                />
                <Edges color="#bca99e" threshold={24}/>
            </mesh>
            <mesh position={[0.82, -0.62, 0]} rotation={[0, 0, -0.62]}>
                <cylinderGeometry args={[0.065, 0.065, 1.75, 16]}/>
                <meshStandardMaterial color="#8b6d60" emissive="#d95525" emissiveIntensity={branchGlow}/>
                <Edges color="#bd8a72" threshold={24}/>
            </mesh>
        </group>
    );
}

export function PowerConversionAssembly({presentation, onSelectComponent, ...props}: Readonly<PowerConversionAssemblyProps>) {
    return (
        <PowerConversionAssemblyProvider {...props}>
            <PowerConversionAssemblyView onSelectComponent={onSelectComponent} presentation={presentation}/>
        </PowerConversionAssemblyProvider>
    );
}
