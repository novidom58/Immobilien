"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Echtes WebGL-3D (kein Bild/Video, keine KI-Generierung nötig) - Gold-
// Material mit metalness/roughness + Mehrpunkt-Beleuchtung simuliert die
// Reflexionen aus dem Referenzfoto. Läuft nur ~2.2s beim Laden der
// Startseite und wird danach vom Elternteil (HeroKeyUnlock.tsx) komplett
// entfernt - kein dauerhaftes 3D wie beim früheren, aus Performance-Gründen
// entfernten 3D-Hero.
function KeyAndLock() {
  const group = useRef<THREE.Group>(null);
  const keyGroup = useRef<THREE.Group>(null);
  const lockMat = useRef<THREE.MeshStandardMaterial>(null);
  const flashLight = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    if (group.current) group.current.rotation.y = t * 0.25;

    if (keyGroup.current) {
      const slideT = THREE.MathUtils.clamp(t / 0.5, 0, 1);
      const slideEased = 1 - Math.pow(1 - slideT, 3);
      keyGroup.current.position.x = THREE.MathUtils.lerp(-2.8, 0, slideEased);

      const turnT = THREE.MathUtils.clamp((t - 0.55) / 0.35, 0, 1);
      const turnEased = 1 - Math.pow(1 - turnT, 2);
      keyGroup.current.rotation.x = turnEased * Math.PI * 0.42;
    }

    const flashT = THREE.MathUtils.clamp((t - 0.85) / 0.35, 0, 1);
    const flash = Math.sin(Math.min(flashT, 1) * Math.PI);
    if (lockMat.current) lockMat.current.emissiveIntensity = flash * 3;
    if (flashLight.current) flashLight.current.intensity = flash * 9;
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[1.15, 0.06, 24, 64]} />
        <meshStandardMaterial
          ref={lockMat}
          color="#5fb8e8"
          metalness={0.6}
          roughness={0.3}
          emissive="#f2c177"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.11, 0.3, 4]} />
        <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.25} />
      </mesh>

      <group ref={keyGroup} position={[-2.8, 0, 0]}>
        <mesh position={[-1.5, 0, 0]}>
          <torusGeometry args={[0.5, 0.13, 20, 40]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.17, 0.11, 24]} />
          <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 1.7, 24]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0.3, -0.15, 0]}>
          <boxGeometry args={[0.16, 0.24, 0.14]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0.1, -0.09, 0]}>
          <boxGeometry args={[0.12, 0.14, 0.1]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
      </group>

      <gridHelper args={[10, 20, "#5fb8e8", "#1a2130"]} position={[0, -1.4, 0]} />
      <pointLight ref={flashLight} position={[0, 0, 1.5]} color="#f2c177" intensity={0} distance={7} />
    </group>
  );
}

export default function HeroKeyUnlock3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4.4], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 3]} intensity={1.6} color="#fff2dd" />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#5fb8e8" />
      <KeyAndLock />
    </Canvas>
  );
}
