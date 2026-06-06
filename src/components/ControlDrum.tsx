import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export interface ControlDrumProps extends Omit<ThreeElements["group"], "children"> {
  /** Drum rotation in degrees. Zero points the absorber segment toward the core. */
  angleDegrees: number;
  /** Radial distance from the reactor centerline. */
  radius?: number;
  /** Axial height of the drum. */
  height?: number;
  /** Drum cylinder radius. */
  drumRadius?: number;
  /** Angular placement around the core in degrees. */
  azimuthDegrees?: number;
  /** Visual emphasis multiplier used by scene visualization modes. */
  emphasis?: number;
}

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Stylized rotating NTP control drum.
 *
 * The pale body represents reflector material, while the dark inset segment
 * represents the neutron absorber side. This is intentionally visual and
 * reduced-order rather than a detailed reactor component model.
 */
export function ControlDrum({
  angleDegrees,
  radius = 2.35,
  height = 2.7,
  drumRadius = 0.18,
  azimuthDegrees = 0,
  emphasis = 1,
  ...groupProps
}: ControlDrumProps) {
  const azimuth = degreesToRadians(azimuthDegrees);
  const drumAngle = degreesToRadians(angleDegrees);

  const normalizedEmphasis = clamp(emphasis, 0.35, 1.5);
  const absorberOpacity = clamp(0.58 + normalizedEmphasis * 0.24, 0.45, 0.95);
  const ringOpacity = clamp(0.12 + normalizedEmphasis * 0.2, 0.08, 0.42);
  const capEmissiveIntensity = normalizedEmphasis > 1 ? 0.08 * normalizedEmphasis : 0;

  const position = useMemo<[number, number, number]>(
    () => [radius * Math.cos(azimuth), 0, radius * Math.sin(azimuth)],
    [azimuth, radius],
  );

  const faceCoreRotation = useMemo<[number, number, number]>(
    () => [0, -azimuth + Math.PI / 2, 0],
    [azimuth],
  );

  return (
    <group position={position} rotation={faceCoreRotation} scale={normalizedEmphasis > 1 ? 1.03 : 1} {...groupProps}>
      <group rotation={[0, drumAngle, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[drumRadius, drumRadius, height, 32]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.35} roughness={0.32} />
        </mesh>

        <mesh position={[0, 0, drumRadius * 0.82]} castShadow>
          <boxGeometry args={[drumRadius * 1.35, height * 1.01, drumRadius * 0.18]} />
          <meshStandardMaterial
            color="#202832"
            emissive="#1e3a5f"
            emissiveIntensity={0.05 * normalizedEmphasis}
            metalness={0.15}
            roughness={0.58}
            transparent
            opacity={absorberOpacity}
          />
        </mesh>

        <mesh position={[0, height * 0.53, 0]}>
          <cylinderGeometry args={[drumRadius * 1.08, drumRadius * 1.08, 0.035, 32]} />
          <meshStandardMaterial
            color="#90a4ae"
            emissive="#64b5f6"
            emissiveIntensity={capEmissiveIntensity}
            metalness={0.45}
            roughness={0.25}
          />
        </mesh>

        <mesh position={[0, -height * 0.53, 0]}>
          <cylinderGeometry args={[drumRadius * 1.08, drumRadius * 1.08, 0.035, 32]} />
          <meshStandardMaterial
            color="#90a4ae"
            emissive="#64b5f6"
            emissiveIntensity={capEmissiveIntensity}
            metalness={0.45}
            roughness={0.25}
          />
        </mesh>
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[drumRadius * 1.18, drumRadius * 1.28, 32]} />
        <meshBasicMaterial color="#64b5f6" side={THREE.DoubleSide} transparent opacity={ringOpacity} />
      </mesh>
    </group>
  );
}