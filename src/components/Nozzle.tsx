import * as THREE from "three";

export function Nozzle({hotScale, emphasis}: Readonly<{ hotScale: number; emphasis: number }>) {
    const plumeLength = 1.25 + hotScale * 1.65;
    const plumeRadius = 0.18 + hotScale * 0.08;
    const linerGlow = 0.18 + hotScale * 0.72;
    const emphasizedOpacity = Math.min(0.75, 0.22 + emphasis * 0.32);

    return <group position={[0, -2.15, 0]}>
        <mesh
            rotation={[Math.PI, 0, 0]}
            castShadow={true}
            receiveShadow={true}
        >
            <coneGeometry args={[1.65, 2.2, 64, 1, true]}/>
            <meshStandardMaterial color="#1f2937" metalness={0.78} roughness={0.22} side={THREE.DoubleSide}/>
        </mesh>

        <mesh
            position={[0, 0.95, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={true}
            receiveShadow={true}
        >
            <torusGeometry args={[0.42, 0.055, 16, 48]}/>
            <meshStandardMaterial color="#94a3b8" metalness={0.72} roughness={0.2}/>
        </mesh>

        <mesh position={[0, 0.18, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.08, 1.55, 64, 1, true]}/>
            <meshStandardMaterial
                color="#475569"
                emissive="#ff9f43"
                emissiveIntensity={linerGlow}
                transparent={true}
                opacity={emphasizedOpacity}
                side={THREE.DoubleSide}
            />
        </mesh>

        <mesh
            position={[0, -1.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={true}
            receiveShadow={true}
        >
            <torusGeometry args={[1.58, 0.06, 16, 64]}/>
            <meshStandardMaterial color="#cbd5e1" metalness={0.74} roughness={0.18}/>
        </mesh>

        <mesh position={[0, -1.65 - plumeLength / 2, 0]}>
            <coneGeometry args={[plumeRadius, plumeLength, 40]}/>
            <meshStandardMaterial
                color="#8be9fd"
                emissive="#8be9fd"
                emissiveIntensity={0.78 + hotScale * 1.15}
                transparent={true}
                opacity={(0.42 + hotScale * 0.16) * emphasis}
                depthWrite={false}
            />
        </mesh>

        <mesh position={[0, -1.88 - plumeLength / 2, 0]}>
            <coneGeometry args={[plumeRadius * 0.56, plumeLength * 0.82, 36]}/>
            <meshBasicMaterial
                color="#ffffff"
                transparent={true}
                opacity={(0.16 + hotScale * 0.18) * emphasis}
                depthWrite={false}
            />
        </mesh>
    </group>;
}