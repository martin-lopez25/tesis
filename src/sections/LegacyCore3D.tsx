import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Slider from '../components/Slider';

type ReactorParams = {
  rodPosition: number;
  coolantFlow: number;
  neutronFlux: number;
};

function ReactorCore(props: ReactorParams) {
  const rodsY = useMemo(() => (props.rodPosition / 100) * 2.8 - 1.4, [props.rodPosition]);
  const coolantColor = useMemo(() => {
    const v = Math.min(1, Math.max(0, props.coolantFlow / 100));
    return new THREE.Color(0.16 + 0.25 * (1 - v), 0.46 + 0.2 * v, 0.87 + 0.12 * v);
  }, [props.coolantFlow]);
  const fluxScale = useMemo(() => 0.6 + Math.min(1.8, props.neutronFlux / 110), [props.neutronFlux]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 4]} intensity={1.1} />
      <directionalLight position={[-3, 2, 1]} intensity={0.7} />

      <mesh rotation-x={Math.PI / 2} position={[0, -1.4, 0]}>
        <ringGeometry args={[2.2, 2.8, 64]} />
        <meshStandardMaterial color="#1e293b" emissive="#0f172a" roughness={0.8} metalness={0.35} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 2.2, 42]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.58} roughness={0.28} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.92, 0.92, 2.0, 34]} />
        <meshStandardMaterial color={coolantColor} transparent opacity={0.72} emissive="#1d4ed8" emissiveIntensity={0.18} />
      </mesh>

      <mesh position={[0, rodsY, 0]}>
        <boxGeometry args={[0.18, 2.3, 0.18]} />
        <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.62} />
      </mesh>
      <mesh position={[0.32, rodsY + 0.06, 0.12]}>
        <boxGeometry args={[0.12, 2.05, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.36} roughness={0.62} />
      </mesh>
      <mesh position={[-0.28, rodsY - 0.04, -0.08]}>
        <boxGeometry args={[0.14, 2.1, 0.14]} />
        <meshStandardMaterial color="#475569" metalness={0.36} roughness={0.62} />
      </mesh>

      <mesh scale={[fluxScale, fluxScale, fluxScale]}>
        <torusGeometry args={[1.55, 0.03, 16, 120]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.85} />
      </mesh>
    </>
  );
}

export default function LegacyCore3D() {
  const [rodPosition, setRodPosition] = useState(50);
  const [coolantFlow, setCoolantFlow] = useState(70);
  const [neutronFlux, setNeutronFlux] = useState(100);

  return (
    <div className="space-y-4">
      <div className="h-[360px] w-full overflow-hidden border border-navy-border bg-navy-deep">
        <Canvas camera={{ position: [2.5, 2.1, 3.4], fov: 50 }}>
          <ReactorCore rodPosition={rodPosition} coolantFlow={coolantFlow} neutronFlux={neutronFlux} />
          <OrbitControls enablePan={false} maxDistance={6} minDistance={2.2} />
        </Canvas>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Barras" value={rodPosition} min={0} max={100} step={1} display={(v) => `${v}%`} onChange={setRodPosition} />
        <Slider label="Refrigerante" value={coolantFlow} min={0} max={100} step={1} display={(v) => `${v}%`} onChange={setCoolantFlow} accent="cyan" />
        <Slider label="Flujo neutronico" value={neutronFlux} min={0} max={220} step={1} display={(v) => `${v}%`} onChange={setNeutronFlux} accent="amber" />
      </div>
    </div>
  );
}
