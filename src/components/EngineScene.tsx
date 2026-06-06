import {OrbitControls, Stars} from '@react-three/drei';
import {Canvas} from '@react-three/fiber';
import {Fragment} from "react";

import {type EngineVisualizationMode, useEngineStore} from '../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {ControlDrum} from './ControlDrum';
import {CoreViewer} from './CoreViewer';
import {Nozzle} from "./Nozzle";
import {HydrogenFlow} from "./HydrogenFlow";
import {Shield} from "./Shield";

interface EngineSceneProps {
    inputs: EngineInputs;
    outputs: EngineOutputs;
}

export function EngineScene({inputs, outputs}: Readonly<EngineSceneProps>) {
    const hotScale = Math.min(Math.max((outputs.outletTemperatureK - 800) / 2_200, 0.15), 1);
    const visualizationMode = useEngineStore((state) => state.visualizationMode);
    const sceneEmphasis = buildSceneEmphasis(visualizationMode);

    return <Fragment>

        <div className="panel-heading over-scene">
            <p className="eyebrow">interactive engine schematic</p>
            <h2>Generic Solid-Core NTP</h2>
        </div>
        <Canvas camera={{position: [5, 3, 6], fov: 45}}>
            <ambientLight intensity={0.45}/>
            <directionalLight position={[4, 8, 5]} intensity={1.6}/>
            <Stars radius={45} depth={20} count={600} factor={3} fade speed={0.35}/>
            <group rotation={[0.1, -0.55, 0]}>
                <group scale={sceneEmphasis.coreScale}>
                    <CoreViewer
                        outletTemperatureK={outputs.outletTemperatureK}
                        fuelTemperatureMarginK={outputs.thermalMarginK}
                        thermalPowerMw={inputs.thermalPowerMw}
                    />
                </group>
                <Nozzle hotScale={hotScale} emphasis={sceneEmphasis.nozzleEmphasis}/>
                {[0, 60, 120, 180, 240, 300].map((azimuthDegrees) => (
                    <ControlDrum
                        key={azimuthDegrees}
                        azimuthDegrees={azimuthDegrees}
                        angleDegrees={inputs.controlDrumAngleDeg}
                        radius={1.45}
                        height={2.4}
                        drumRadius={0.13}
                        emphasis={sceneEmphasis.controlEmphasis}
                    />
                ))}
                <HydrogenFlow hotScale={hotScale} emphasis={sceneEmphasis.flowEmphasis}/>
                <Shield massFraction={inputs.shieldingMassFraction} emphasis={sceneEmphasis.shieldEmphasis}/>
            </group>
            <OrbitControls enablePan={false} minDistance={5} maxDistance={12}/>
        </Canvas>
        <div className="scene-caption">
            {sceneEmphasis.caption}
        </div>

    </Fragment>;

}




interface SceneEmphasis {
    coreScale: number;
    nozzleEmphasis: number;
    controlEmphasis: number;
    flowEmphasis: number;
    shieldEmphasis: number;
    caption: string;
}

function buildSceneEmphasis(visualizationMode: EngineVisualizationMode): SceneEmphasis {
    switch (visualizationMode) {
        case 'thermal':
            return {
                coreScale: 1.08,
                nozzleEmphasis: 1.18,
                controlEmphasis: 0.72,
                flowEmphasis: 0.62,
                shieldEmphasis: 0.58,
                caption: 'Thermal mode emphasizes core heat bands, fuel margin glow, and nozzle liner response.',
            };
        case 'flow':
            return {
                coreScale: 0.96,
                nozzleEmphasis: 1.1,
                controlEmphasis: 0.55,
                flowEmphasis: 1.35,
                shieldEmphasis: 0.48,
                caption: 'Flow mode emphasizes hydrogen inlet, core heating path, and exhaust feed into the nozzle.',
            };
        case 'review':
            return {
                coreScale: 1,
                nozzleEmphasis: 0.72,
                controlEmphasis: 1.18,
                flowEmphasis: 0.5,
                shieldEmphasis: 1.28,
                caption: 'Review mode emphasizes control drums, shielding mass trade, and payload-side protected zone.',
            };
        case 'systems':
        default:
            return {
                coreScale: 1,
                nozzleEmphasis: 1,
                controlEmphasis: 1,
                flowEmphasis: 1,
                shieldEmphasis: 1,
                caption: 'Systems mode shows the full reduced-order NTP engine schematic responding to the case inputs.',
            };
    }
}

