import {Edges} from '@react-three/drei';
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {ScenePresentationState} from '../visualizationTypes';
import type {FeedComponentKind, FeedSystemAssemblyModel} from './FeedSystemAssembly.model';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export interface FeedSystemAssemblyProps {
    readonly model: FeedSystemAssemblyModel;
    readonly presentation?: ScenePresentationState;
    readonly initialActiveComponentId?: string | null;
    readonly onSelectComponent?: (componentId: SceneComponentId) => void;
}

export interface FeedSystemAssemblyState {
    readonly activeComponentId: string | null;
}

export interface FeedSystemAssemblyContextValue {
    readonly model: FeedSystemAssemblyModel;
    readonly state: FeedSystemAssemblyState;
    readonly setActiveComponent: (componentId: string | null) => void;
}

export interface FeedSystemAssemblyProviderProps extends FeedSystemAssemblyProps {
    readonly children: ReactNode;
}

const FeedSystemAssemblyContext = createContext<FeedSystemAssemblyContextValue | undefined>(undefined);

/** Boundary: cold-side physical topology. Scope: component placement and emphasis only. */
export function FeedSystemAssemblyProvider({
    model,
    initialActiveComponentId = null,
    children,
}: Readonly<FeedSystemAssemblyProviderProps>) {
    const [activeComponentId, setActiveComponent] = useState<string | null>(initialActiveComponentId);
    const value = useMemo(() => ({
        model,
        state: {activeComponentId},
        setActiveComponent,
    }), [activeComponentId, model]);
    return <FeedSystemAssemblyContext.Provider value={value}>{children}</FeedSystemAssemblyContext.Provider>;
}

export function useFeedSystemAssembly(): FeedSystemAssemblyContextValue {
    const context = useContext(FeedSystemAssemblyContext);
    if (!context) throw new Error('useFeedSystemAssembly must be used inside FeedSystemAssemblyProvider.');
    return context;
}

const componentPositions: Readonly<Record<FeedComponentKind, readonly [number, number, number]>> = {
    tank: [-3.25, 1.48, 0],
    valve: [-2.72, 1.24, 0],
    pump: [-2.15, 0.82, 0],
    manifold: [-1.45, 0.72, 0],
    'regen-jacket': [1.55, -2.15, 0],
    conditioner: [-0.9, 1.08, 0],
};

export function FeedSystemAssemblyView({
    presentation,
    onSelectComponent,
}: Readonly<Pick<FeedSystemAssemblyProps, 'presentation' | 'onSelectComponent'>>) {
    const {model, state} = useFeedSystemAssembly();
    const highlighted = presentation?.highlightedTargetIds.includes(model.id) ?? false;

    if (import.meta.env.MODE === 'test') {
        return (
            <div
                aria-label="Representative feed-system assembly"
                data-active-component={state.activeComponentId ?? 'none'}
                data-component-count={model.components.length}
                data-highlighted={highlighted}
                data-scope="feed-system-assembly"
                role="group"
            />
        );
    }

    return (
        <group
            name={model.id}
        >
            {model.components.map((component, index) => {
                const base = componentPositions[component.kind];
                const duplicateOffset = component.kind === 'pump' ? (index - 2) * 0.28 : 0;
                const position: [number, number, number] = [base[0] + duplicateOffset, base[1], base[2]];
                const active = state.activeComponentId === component.id || highlighted;
                return (
                    <group key={component.id} name={component.id} position={position}>
                        <group onClick={(event) => {
                            event.stopPropagation();
                            onSelectComponent?.(component.id === 'main-turbopump' ? 'main-turbopump' : 'feed-system');
                        }}>
                            <FeedComponentGeometry active={active} kind={component.kind}/>
                        </group>
                    </group>
                );
            })}
        </group>
    );
}

function FeedComponentGeometry({active, kind}: Readonly<{active: boolean; kind: FeedComponentKind}>) {
    const color = active ? '#8fcde2' : '#607583';
    const emissiveIntensity = active ? 0.55 : 0.08;
    const material = (
        <meshStandardMaterial
            color={color}
            emissive="#2b8caf"
            emissiveIntensity={emissiveIntensity}
            metalness={0.72}
            roughness={0.32}
        />
    );

    if (kind === 'tank') {
        return (
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.3, 0.62, 10, 24]}/>
                {material}
                <Edges color="#b7d6e1" threshold={22}/>
            </mesh>
        );
    }
    if (kind === 'pump') {
        return (
            <group rotation={[0, 0, Math.PI / 2]}>
                <mesh>
                    <cylinderGeometry args={[0.26, 0.26, 0.38, 32]}/>
                    {material}
                    <Edges color="#a9c6d2" threshold={24}/>
                </mesh>
                <mesh position={[0, 0.22, 0]}>
                    <cylinderGeometry args={[0.09, 0.09, 0.16, 20]}/>
                    <meshStandardMaterial color="#a9b8c1" metalness={0.84} roughness={0.24}/>
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.16, 0.035, 10, 28]}/>
                    <meshStandardMaterial color="#426878" emissive="#2b8caf" emissiveIntensity={emissiveIntensity}/>
                </mesh>
            </group>
        );
    }
    if (kind === 'valve') {
        return (
            <group>
                <mesh>
                    <sphereGeometry args={[0.18, 24, 16]}/>
                    {material}
                    <Edges color="#a9c6d2" threshold={24}/>
                </mesh>
                <mesh position={[0, 0.25, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.22, 12]}/>
                    <meshStandardMaterial color="#aab4ba" metalness={0.8}/>
                </mesh>
                <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.1, 0.018, 8, 20]}/>
                    <meshStandardMaterial color="#7f929d" metalness={0.72}/>
                </mesh>
            </group>
        );
    }
    if (kind === 'manifold' || kind === 'conditioner') {
        return (
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[kind === 'conditioner' ? 0.16 : 0.12, kind === 'conditioner' ? 0.16 : 0.12, 0.48, 24]}/>
                {material}
                <Edges color="#a9c6d2" threshold={24}/>
            </mesh>
        );
    }
    return (
        <mesh>
            <torusGeometry args={[0.28, 0.075, 10, 36]}/>
            {material}
            <Edges color="#82cde7" threshold={22}/>
        </mesh>
    );
}

export function FeedSystemAssembly({presentation, onSelectComponent, ...props}: Readonly<FeedSystemAssemblyProps>) {
    return (
        <FeedSystemAssemblyProvider {...props}>
            <FeedSystemAssemblyView onSelectComponent={onSelectComponent} presentation={presentation}/>
        </FeedSystemAssemblyProvider>
    );
}
