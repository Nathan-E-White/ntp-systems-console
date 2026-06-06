import * as THREE from "three";

export function Shield({massFraction, emphasis}: Readonly<{ massFraction: number; emphasis: number }>) {
    const normalizedMass = Math.min(Math.max((massFraction - 0.04) / 0.1, 0), 1);
    const shieldRadius = 1.18 + normalizedMass * 0.28;
    const shieldThickness = 0.26 + normalizedMass * 0.16;
    const shadowConeOpacity = (0.08 + normalizedMass * 0.16) * emphasis;

    return (
        <group position={[0, 1.52, 0]}>
            <mesh castShadow={true} receiveShadow={true}>
                <cylinderGeometry args={[shieldRadius, shieldRadius * 0.84, shieldThickness, 64]}/>
                <meshStandardMaterial color="#64748b" metalness={0.72} roughness={0.24}/>
            </mesh>

            <mesh position={[0, shieldThickness * 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={true}
                  receiveShadow={true}>
                <torusGeometry args={[shieldRadius * 0.92, 0.045, 14, 64]}/>
                <meshStandardMaterial color="#cbd5e1" metalness={0.78} roughness={0.18}/>
            </mesh>

            <mesh position={[0, -shieldThickness * 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={true}
                  receiveShadow={true}>
                <torusGeometry args={[shieldRadius * 0.74, 0.04, 14, 64]}/>
                <meshStandardMaterial color="#94a3b8" metalness={0.72} roughness={0.2}/>
            </mesh>

            <mesh position={[0, shieldThickness * 0.5 + 0.09, 0]} castShadow={true} receiveShadow={true}>
                <cylinderGeometry args={[shieldRadius * 0.52, shieldRadius * 0.48, 0.18, 48]}/>
                <meshStandardMaterial color="#475569" metalness={0.64} roughness={0.28}/>
            </mesh>

            <mesh position={[0, shieldThickness * 0.5 + 0.38, 0]} castShadow={true} receiveShadow={true}>
                <boxGeometry args={[0.72, 0.34, 0.72]}/>
                <meshStandardMaterial color="#1e293b" metalness={0.45} roughness={0.38}/>
            </mesh>

            <mesh position={[0, shieldThickness * 0.5 + 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.46, 0.012, 8, 48]}/>
                <meshBasicMaterial color="#93c5fd" transparent={true} opacity={0.24 + 0.2 * emphasis}/>
            </mesh>

            <mesh position={[0, 0.42, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[shieldRadius * 1.05, 1.4, 64, 1, true]}/>
                <meshBasicMaterial color="#60a5fa" transparent={true} opacity={shadowConeOpacity} depthWrite={false}
                                   side={THREE.DoubleSide}/>
            </mesh>
        </group>
    );
}