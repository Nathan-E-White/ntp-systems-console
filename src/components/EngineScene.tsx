import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { EngineInputs, EngineOutputs } from '../types/EngineState';

interface EngineSceneProps {
  inputs: EngineInputs;
  outputs: EngineOutputs;
}

export function EngineScene({ inputs, outputs }: EngineSceneProps) {
  const hotScale = Math.min(Math.max((outputs.outletTemperatureK - 800) / 2_200, 0.15), 1);

  return (
    <section className="panel engine-panel">
      <div className="panel-heading over-scene">
        <p className="eyebrow">interactive engine schematic</p>
        <h2>Generic Solid-Core NTP</h2>
      </div>
      <Canvas camera={{ position: [5, 3, 6], fov: 45 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 8, 5]} intensity={1.6} />
        <Stars radius={45} depth={20} count={600} factor={3} fade speed={0.35} />
        <group rotation={[0.1, -0.55, 0]}>
          <Core hotScale={hotScale} />
          <Nozzle hotScale={hotScale} />
          <ControlDrums angleDeg={inputs.controlDrumAngleDeg} />
          <HydrogenFlow hotScale={hotScale} />
          <Shield massFraction={inputs.shieldingMassFraction} />
        </group>
        <OrbitControls enablePan={false} minDistance={5} maxDistance={12} />
      </Canvas>
      <div className="scene-caption">
        Heat tint, plume length, and control drums respond to the reduced-order model inputs.
      </div>
    </section>
  );
}

function Core({ hotScale }: { hotScale: number }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1.15, 1.15, 2.2, 48]} />
        <meshStandardMaterial color={`rgb(${80 + hotScale * 160}, ${80 + hotScale * 70}, 120)`} metalness={0.45} roughness={0.32} />
      </mesh>
      {Array.from({ length: 18 }, (_, index) => {
        const theta = (index / 18) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(theta) * 0.72, 0, Math.sin(theta) * 0.72]}>
            <cylinderGeometry args={[0.045, 0.045, 2.34, 12]} />
            <meshStandardMaterial color="#e7f4ff" emissive="#61dafb" emissiveIntensity={0.15 + hotScale * 0.65} />
          </mesh>
        );
      })}
    </group>
  );
}

function Nozzle({ hotScale }: { hotScale: number }) {
  return (
    <group position={[0, -2.15, 0]}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.65, 2.2, 48, 1, true]} />
        <meshStandardMaterial color="#1f2937" metalness={0.75} roughness={0.24} side={2} />
      </mesh>
      <mesh position={[0, -1.7 - hotScale * 0.5, 0]}>
        <coneGeometry args={[0.22, 1.3 + hotScale * 1.2, 32]} />
        <meshStandardMaterial color="#8be9fd" emissive="#8be9fd" emissiveIntensity={0.7 + hotScale} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function ControlDrums({ angleDeg }: { angleDeg: number }) {
  const rotation = (angleDeg / 180) * Math.PI;
  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => {
        const theta = (index / 6) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(theta) * 1.55, 0, Math.sin(theta) * 1.55]} rotation={[rotation, theta, 0]}>
            <boxGeometry args={[0.18, 1.85, 0.32]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#fbbf24' : '#7dd3fc'} metalness={0.35} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function HydrogenFlow({ hotScale }: { hotScale: number }) {
  return (
    <group>
      {Array.from({ length: 5 }, (_, index) => (
        <mesh key={index} position={[-1.8 + index * 0.9, 1.55, 0]}>
          <sphereGeometry args={[0.05 + hotScale * 0.03, 16, 16]} />
          <meshStandardMaterial color="#a5f3fc" emissive="#67e8f9" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Shield({ massFraction }: { massFraction: number }) {
  return (
    <mesh position={[0, 1.45, 0]}>
      <cylinderGeometry args={[1.25 + massFraction, 1.05 + massFraction, 0.34, 48]} />
      <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.25} />
    </mesh>
  );
}
