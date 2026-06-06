
interface InletParticleDescriptor {
    id: string;
    theta: number;
    radius: number;
}

interface CoreFlowStreamDescriptor {
    id: string;
    xOffset: number;
    zOffset: number;
}

interface CoreFlowParticleDescriptor {
    id: string;
    y: number;
    heatFraction: number;
}

interface ExhaustFeedParticleDescriptor {
    id: string;
    y: number;
    radius: number;
    scale: number;
}

const INLET_PARTICLES: InletParticleDescriptor[] = Array.from({length: 8}, (_, index) => ({
    id: `inlet-particle-${index}`,
    theta: (index / 8) * Math.PI * 2,
    radius: 0.92,
}));

const CORE_FLOW_STREAMS: CoreFlowStreamDescriptor[] = [-0.54, -0.27, 0, 0.27, 0.54].map((xOffset, streamIndex) => ({
    id: `core-flow-stream-${streamIndex}`,
    xOffset,
    zOffset: streamIndex % 2 === 0 ? 0.18 : -0.18,
}));

const CORE_FLOW_PARTICLES: CoreFlowParticleDescriptor[] = Array.from({length: 6}, (_, particleIndex) => ({
    id: `core-flow-particle-${particleIndex}`,
    y: 1.05 - particleIndex * 0.42,
    heatFraction: particleIndex / 5,
}));

const EXHAUST_FEED_PARTICLES: ExhaustFeedParticleDescriptor[] = Array.from({length: 5}, (_, index) => ({
    id: `exhaust-feed-${index}`,
    y: -1.05 - index * 0.32,
    radius: 0.34 - index * 0.035,
    scale: 1 - index * 0.045,
}));

export function HydrogenFlow({hotScale, emphasis}: Readonly<{ hotScale: number; emphasis: number }>) {
    const inletParticleRadius = 0.045 + hotScale * 0.018;
    const coreParticleRadius = 0.032 + hotScale * 0.018;
    const exhaustParticleRadius = 0.055 + hotScale * 0.026;
    const exhaustGlow = 0.5 + hotScale * 0.9;

    return (
        <group>
            <mesh position={[0, 1.83, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.92, 0.012, 8, 64]}/>
                <meshBasicMaterial color="#67e8f9" transparent={true} opacity={(0.32 + hotScale * 0.18) * emphasis}/>
            </mesh>

            {INLET_PARTICLES.map((particle) => (
                <mesh
                    key={particle.id}
                    position={[
                        Math.cos(particle.theta) * particle.radius,
                        1.83,
                        Math.sin(particle.theta) * particle.radius,
                    ]}
                >
                    <sphereGeometry args={[inletParticleRadius, 16, 16]}/>
                    <meshStandardMaterial color="#a5f3fc" emissive="#67e8f9"
                                          emissiveIntensity={0.32 + hotScale * 0.45}/>
                </mesh>
            ))}

            {CORE_FLOW_STREAMS.map((stream) => (
                <group key={stream.id}>
                    {CORE_FLOW_PARTICLES.map((particle) => {
                        const hotParticle = particle.heatFraction > 0.58;

                        return (
                            <mesh
                                key={`${stream.id}-${particle.id}`}
                                position={[stream.xOffset, particle.y, stream.zOffset]}
                            >
                                <sphereGeometry
                                    args={[coreParticleRadius * (1 + particle.heatFraction * 0.55), 14, 14]}/>
                                <meshStandardMaterial
                                    color={hotParticle ? '#fde68a' : '#a5f3fc'}
                                    emissive={hotParticle ? '#f97316' : '#67e8f9'}
                                    emissiveIntensity={0.28 + hotScale * (0.38 + particle.heatFraction * 0.65)}
                                    transparent={true}
                                    opacity={(0.68 + particle.heatFraction * 0.2) * emphasis}
                                />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            <mesh position={[0, -1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.018, 8, 48]}/>
                <meshBasicMaterial color="#fb923c" transparent={true} opacity={(0.28 + hotScale * 0.3) * emphasis}/>
            </mesh>

            {EXHAUST_FEED_PARTICLES.map((particle, index) => (
                <mesh key={particle.id} position={[0, particle.y, 0]}>
                    <sphereGeometry args={[exhaustParticleRadius * particle.scale, 18, 18]}/>
                    <meshStandardMaterial
                        color="#fed7aa"
                        emissive="#fb923c"
                        emissiveIntensity={exhaustGlow + index * 0.12}
                        transparent={true}
                        opacity={(0.58 + hotScale * 0.2) * emphasis}
                    />
                    <pointLight color="#fb923c" intensity={hotScale * 0.14} distance={particle.radius + 0.6}/>
                </mesh>
            ))}
        </group>
    );
}
