"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Erzählung: Schlüssel dreht sich im Schloss -> Tür schwingt am Scharnier auf
// -> Licht (= die eigentliche Webseite) strömt durch den Spalt -> Kamera
// fährt leicht vor. Reines WebGL, kein KI-Bild/-Video nötig. Läuft nur
// während der Hero-Intro-Sequenz und wird danach vom Elternteil
// (HeroKeyUnlock.tsx) komplett unmounted.
const T_SLIDE_END = 0.5;
const T_TURN_START = 0.55;
const T_TURN_END = 0.92;
const T_FLASH_START = 0.85;
const T_FLASH_END = 1.2;
const T_DOOR_START = 1.05;
const T_DOOR_END = 1.9;

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInOutSine(x: number) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function Scene() {
  const keyGroup = useRef<THREE.Group>(null);
  const doorPivot = useRef<THREE.Group>(null);
  const lockMat = useRef<THREE.MeshStandardMaterial>(null);
  const flashLight = useRef<THREE.PointLight>(null);
  const glowLight = useRef<THREE.PointLight>(null);
  const glowMat = useRef<THREE.MeshStandardMaterial>(null);
  const elapsed = useRef(0);

  useFrame(({ camera }, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    // Schlüssel: gleitet ein, dreht mit leichtem Überschwung (fühlt sich
    // mechanisch/hochwertig an statt linear).
    if (keyGroup.current) {
      const slideT = THREE.MathUtils.clamp(t / T_SLIDE_END, 0, 1);
      keyGroup.current.position.x = THREE.MathUtils.lerp(-2.9, 0, easeOutCubic(slideT));

      const turnT = THREE.MathUtils.clamp((t - T_TURN_START) / (T_TURN_END - T_TURN_START), 0, 1);
      keyGroup.current.rotation.x = easeOutBack(turnT) * Math.PI * 0.45;

      const fadeT = THREE.MathUtils.clamp((t - T_FLASH_START) / 0.25, 0, 1);
      const s = 1 - fadeT;
      keyGroup.current.scale.set(s, s, s);
    }

    // Blitz beim Aufschliessen.
    const flashT = THREE.MathUtils.clamp((t - T_FLASH_START) / (T_FLASH_END - T_FLASH_START), 0, 1);
    const flash = Math.sin(Math.min(flashT, 1) * Math.PI);
    if (lockMat.current) lockMat.current.emissiveIntensity = 0.4 + flash * 3.5;
    if (flashLight.current) flashLight.current.intensity = flash * 10;

    // Tür schwingt am Scharnier auf; Licht strömt durch den Spalt.
    const doorT = THREE.MathUtils.clamp((t - T_DOOR_START) / (T_DOOR_END - T_DOOR_START), 0, 1);
    const doorEased = easeOutCubic(doorT);
    if (doorPivot.current) doorPivot.current.rotation.y = -doorEased * 2.05;
    if (glowMat.current) glowMat.current.emissiveIntensity = doorEased * 3.2;
    if (glowLight.current) glowLight.current.intensity = doorEased * 12;

    // Kamera fährt beim Türöffnen sanft vor - filmischer "Hineingehen"-Effekt.
    camera.position.z = THREE.MathUtils.lerp(4.6, 3.7, easeInOutSine(doorT));
    camera.position.y = THREE.MathUtils.lerp(0.35, 0.15, easeInOutSine(doorT));
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {/* Lichtschein hinter der Tür - repräsentiert die Webseite dahinter */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[2.1, 3.1]} />
        <meshStandardMaterial
          ref={glowMat}
          color="#0a0d12"
          emissive="#f2c177"
          emissiveIntensity={0}
          roughness={1}
        />
      </mesh>
      <pointLight ref={glowLight} position={[0, 0, -0.3]} color="#f2c177" intensity={0} distance={6} />

      {/* Türrahmen */}
      <group>
        <mesh position={[-1.15, 0, 0]}>
          <boxGeometry args={[0.14, 3.2, 0.22]} />
          <meshStandardMaterial color="#5fb8e8" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[1.15, 0, 0]}>
          <boxGeometry args={[0.14, 3.2, 0.22]} />
          <meshStandardMaterial color="#5fb8e8" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[2.44, 0.14, 0.22]} />
          <meshStandardMaterial color="#5fb8e8" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>

      {/* Türblatt - Pivot sitzt am linken Scharnier, Blatt ist relativ dazu versetzt */}
      <group ref={doorPivot} position={[-1.08, 0, 0]}>
        <mesh position={[1.08, 0, 0]}>
          <boxGeometry args={[2.16, 3.1, 0.14]} />
          <meshStandardMaterial color="#12161d" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* leuchtende Naht in der Mitte des Türblatts */}
        <mesh position={[1.08, 0, 0.075]}>
          <boxGeometry args={[0.035, 2.7, 0.01]} />
          <meshStandardMaterial color="#e8a855" emissive="#e8a855" emissiveIntensity={1.4} />
        </mesh>

        {/* Schlossblende + Schlüsselloch, sitzt an der Türkante gegenüber dem Scharnier */}
        <group position={[1.95, 0, 0.09]}>
          <mesh>
            <torusGeometry args={[0.26, 0.045, 20, 48]} />
            <meshStandardMaterial
              ref={lockMat}
              color="#5fb8e8"
              metalness={0.6}
              roughness={0.3}
              emissive="#f2c177"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, 0.03, 0.02]}>
            <sphereGeometry args={[0.06, 20, 20]} />
            <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.05, 0.02]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.05, 0.12, 4]} />
            <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.25} />
          </mesh>
          <pointLight ref={flashLight} position={[0, 0, 0.6]} color="#f2c177" intensity={0} distance={5} />
        </group>
      </group>

      {/* Schlüssel */}
      <group ref={keyGroup} position={[-2.9, 0, 1.0]}>
        <mesh position={[-1.4, 0, 0]}>
          <torusGeometry args={[0.42, 0.11, 20, 40]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
          <meshStandardMaterial color="#e8a855" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 1.6, 24]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0.3, -0.13, 0]}>
          <boxGeometry args={[0.14, 0.2, 0.12]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0.12, -0.08, 0]}>
          <boxGeometry args={[0.1, 0.12, 0.09]} />
          <meshStandardMaterial color="#f2c177" metalness={1} roughness={0.28} />
        </mesh>
      </group>

      <gridHelper args={[12, 24, "#5fb8e8", "#1a2130"]} position={[0, -1.7, 0]} />
    </group>
  );
}

export default function HeroKeyUnlock3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 4.6], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={["#0a0d12", 4, 11]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 3]} intensity={1.5} color="#fff2dd" />
      <directionalLight position={[-3, -1, 2]} intensity={0.45} color="#5fb8e8" />
      <Scene />
    </Canvas>
  );
}
