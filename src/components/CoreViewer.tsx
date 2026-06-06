import {useMemo} from 'react';

export interface CoreViewerProps {
    outletTemperatureK: number;
    fuelTemperatureMarginK: number;
    thermalPowerMw: number;
}

interface FuelChannelDescriptor {
    id: string;
    position: [number, number, number];
    radius: number;
    height: number;
}

interface AxialHeatBandDescriptor {
    id: string;
    position: [number, number, number];
    emissiveIntensity: number;
    opacity: number;
    radius: number;
    height: number;
}

const CORE_HEIGHT = 2.8;
const CORE_RADIUS = 0.86;
const CHANNEL_RADIUS = 0.035;
const CHANNEL_HEIGHT = CORE_HEIGHT * 1.04;
const CHANNEL_RING_SPACING = 0.18;
const HEAT_BAND_COUNT = 6;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

// noinspection JSUnusedGlobalSymbols
export function CoreViewer({
                               outletTemperatureK,
                               fuelTemperatureMarginK,
                               thermalPowerMw,
                           }: Readonly<CoreViewerProps>) {
    const normalizedPower = clamp(thermalPowerMw / 550,0,1);
    const normalizedTemperature = clamp((outletTemperatureK - 1200) / 1800, 0, 1);
    const normalizedMarginStress = clamp(1 - fuelTemperatureMarginK / 350, 0, 1);
    const coreGlowIntensity = 0.25 + 1.75 * Math.max(normalizedPower, normalizedTemperature);
    const marginGlowOpacity = 0.18 + 0.46 * normalizedMarginStress;

    const channels = useMemo(() => buildFuelChannelDescriptors(), []);
    const heatBands = useMemo(
        () => buildAxialHeatBandDescriptors(normalizedTemperature, normalizedMarginStress),
        [normalizedMarginStress, normalizedTemperature],
    );

    return <group>
        <mesh
            castShadow={true}
            receiveShadow={true}
        >
            <cylinderGeometry args={[CORE_RADIUS, CORE_RADIUS, CORE_HEIGHT, 64]}/>
            <meshStandardMaterial
                color="#25313d"
                metalness={0.42}
                roughness={0.34}
                transparent={true}
                opacity={0.38}
            />
        </mesh>

        <mesh>
            <cylinderGeometry args={[CORE_RADIUS * 1.04, CORE_RADIUS * 1.04, CORE_HEIGHT * 1.01, 64, 1, true]}/>
            <meshStandardMaterial
                color="#6fb7ff"
                emissive="#2f80ed"
                emissiveIntensity={0.12 + normalizedPower * 0.32}
                transparent={true}
                opacity={0.16}
                metalness={0.1}
                roughness={0.55}
            />
        </mesh>

        {channels.map((channel) => <mesh key={channel.id}
                                         position={channel.position}
                                         castShadow={true}
                                         receiveShadow={true}
        >
            <cylinderGeometry args={[channel.radius, channel.radius, channel.height, 12]}/>
            <meshStandardMaterial
                color="#d7dde4"
                emissive="#ff8f3d"
                emissiveIntensity={coreGlowIntensity * 0.42}
                metalness={0.25}
                roughness={0.4}
            />
        </mesh>)}

        {heatBands.map((band) => <mesh key={band.id} position={band.position}>
            <cylinderGeometry args={[band.radius, band.radius, band.height, 64, 1, true]}/>
            <meshStandardMaterial
                color="#ffb15c"
                emissive="#ff6d2d"
                emissiveIntensity={band.emissiveIntensity}
                transparent={true}
                opacity={band.opacity}
                roughness={0.2}
            />
        </mesh>)}

        <mesh>
            <sphereGeometry args={[CORE_RADIUS * 1.18, 48, 24]}/>
            <meshBasicMaterial
                color={normalizedMarginStress > 0.62 ? '#ff5f57' : '#64b5f6'}
                transparent={true}
                opacity={marginGlowOpacity}
                depthWrite={false}
            />
        </mesh>
    </group>;
}

function buildFuelChannelDescriptors(): FuelChannelDescriptor[] {
    const channels: FuelChannelDescriptor[] = [
        {
            id: 'channel-center',
            position: [0, 0, 0],
            radius: CHANNEL_RADIUS,
            height: CHANNEL_HEIGHT,
        },
    ];

    for (let ring = 1; ring <= 4; ring += 1) {
        const count = ring * 6;
        const radius = ring * CHANNEL_RING_SPACING;

        for (let index = 0; index < count; index += 1) {
            const theta = (index / count) * Math.PI * 2;

            channels.push({
                id: `channel-${ring}-${index}`,
                position: [radius * Math.cos(theta), 0, radius * Math.sin(theta)],
                radius: CHANNEL_RADIUS * (ring === 4 ? 0.82 : 1),
                height: CHANNEL_HEIGHT,
            });
        }
    }

    return channels;
}

function buildAxialHeatBandDescriptors(
    normalizedTemperature: number,
    normalizedMarginStress: number,
): AxialHeatBandDescriptor[] {
    return Array.from({length: HEAT_BAND_COUNT}, (_, index) => {
        const axialFraction = index / (HEAT_BAND_COUNT - 1);
        const y = -CORE_HEIGHT / 2 + axialFraction * CORE_HEIGHT;
        const downstreamHeating = 0.42 + axialFraction * 0.58;
        const stressBoost = 0.35 * normalizedMarginStress;
        const emissiveIntensity = 0.18 + normalizedTemperature * downstreamHeating + stressBoost;

        return {
            id: `heat-band-${index}`,
            position: [0, y, 0],
            emissiveIntensity,
            opacity: 0.08 + 0.11 * emissiveIntensity,
            radius: CORE_RADIUS * (1.075 + axialFraction * 0.025),
            height: CORE_HEIGHT / HEAT_BAND_COUNT / 2,
        };
    });
}


