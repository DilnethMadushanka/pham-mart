import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Lightformer } from '@react-three/drei';

/* Procedural medicine capsule: two colored hemispheres + a center band, no external 3D assets required */
function Capsule({ color = '#38bdf8', accent = '#f0f9ff' }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.6;
      group.current.rotation.z = Math.sin(Date.now() * 0.0006) * 0.15;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.62, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[0.62, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.05} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.62, 0.62, 1.24, 48, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} side={2} />
      </mesh>
    </group>
  );
}

function OrbitingCross() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.35;
  });
  return (
    <group ref={ref}>
      <mesh position={[2.1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.42, 0.14, 0.14]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.35} />
      </mesh>
      <mesh position={[2.1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.14, 0.42, 0.14]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.35} />
      </mesh>
    </group>
  );
}

/* Local, procedural light rig — avoids fetching remote HDR environment maps
   (which can fail on restricted networks and crash the WebGL context). */
function LightRig() {
  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 4, 2]} intensity={1.8} castShadow />
      <directionalLight position={[-3, -2, -2]} intensity={0.7} color="#818cf8" />
      <group>
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 2, -3]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#bfdbfe" position={[-3, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 3, 1]} />
      </group>
    </>
  );
}

function Scene() {
  return (
    <>
      <LightRig />
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
        <Capsule />
      </Float>
      <OrbitingCross />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.35} scale={6} blur={2.4} far={2} />
    </>
  );
}

/* Static CSS fallback shown when WebGL is unavailable or its context is lost */
function StaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-40 h-40 animate-float">
        <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-br from-sky-500 to-blue-700 shadow-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-sky-100 shadow-2xl" />
      </div>
    </div>
  );
}

/**
 * Interactive 3D medicine capsule model rendered with react-three-fiber.
 * Purely decorative — no impact on app state/logic. Falls back to a static
 * CSS capsule if WebGL is unsupported or its context is lost.
 */
export default function PillCapsule3D({ className = '' }) {
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) setWebglFailed(true);
    } catch {
      setWebglFailed(true);
    }
  }, []);

  if (webglFailed) {
    return <div className={className}><StaticFallback /></div>;
  }

  return (
    <div className={className}>
      <Suspense fallback={<div className="w-full h-full animate-pulse rounded-3xl bg-sky-100/60" />}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.4, 4.4], fov: 40 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setWebglFailed(true);
            });
          }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
