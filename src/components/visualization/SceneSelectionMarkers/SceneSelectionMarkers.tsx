import {Html} from '@react-three/drei';

import type {SceneComponentDescriptor, SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

export function SceneSelectionMarkers({
    components,
    selectedComponentId,
    onSelectComponent,
}: Readonly<{
    components: readonly SceneComponentDescriptor[];
    selectedComponentId: SceneComponentId;
    onSelectComponent: (componentId: SceneComponentId) => void;
}>) {
    return (
        <>
            {components.filter((component) => component.id !== 'engine-overview').map((component) => (
                <Html center key={component.id} position={[...component.anchor]} zIndexRange={[20, 0]}>
                    <button
                        aria-label={`Inspect ${component.label}`}
                        className={component.id === selectedComponentId
                            ? 'scene-anchor-marker scene-anchor-marker--selected'
                            : 'scene-anchor-marker scene-anchor-marker--muted'}
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelectComponent(component.id);
                        }}
                        title={component.label}
                        type="button"
                    >
                        <span aria-hidden="true"/>
                    </button>
                </Html>
            ))}
        </>
    );
}
