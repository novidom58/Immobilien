"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function progress(t: number, start: number, end: number) {
  return THREE.MathUtils.clamp((t - start) / (end - start), 0, 1);
}

const WALL_W = 10;
const WALL_H = 3.2;
const WALL_D = 8;
const PLINTH_H = 0.5;

const windows = [
  { x: -3, y: 2.05, w: 1.2, h: 1.5, face: "front" as const, delay: 0 },
  { x: -1, y: 2.05, w: 1.2, h: 1.5, face: "front" as const, delay: 0.18 },
  { x: 1, y: 2.05, w: 1.2, h: 1.5, face: "front" as const, delay: 0.36 },
  { x: 3, y: 2.05, w: 1.2, h: 1.5, face: "front" as const, delay: 0.54 },
  { x: -1.5, y: 2.05, w: 1.4, h: 1.7, face: "side" as const, delay: 0.72 },
  { x: 1.5, y: 2.05, w: 1.4, h: 1.7, face: "side" as const, delay: 0.9 },
];

const trees = [
  { x: -8.5, z: 3.5, s: 1 },
  { x: -9.2, z: -1.5, s: 0.8 },
  { x: 8.8, z: -4, s: 1.1 },
  { x: 7.6, z: -6.5, s: 0.75 },
  { x: -7.8, z: -6, s: 0.9 },
];

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color="#1c1a16" roughness={1} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.7, 1.8, 7]} />
        <meshStandardMaterial color="#232b22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1.3, 7]} />
        <meshStandardMaterial color="#2a3428" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function HouseModel() {
  const foundationRef = useRef<THREE.Mesh>(null);
  const wallsRef = useRef<THREE.Mesh>(null);
  const roofRef = useRef<THREE.Group>(null);
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const poolRef = useRef<THREE.Mesh>(null);

  const roofShape = useMemo(() => {
    const shape = new THREE.Shape();
    const halfW = WALL_W / 2 + 0.35;
    const apex = 2.3;
    shape.moveTo(-halfW, 0);
    shape.lineTo(halfW, 0);
    shape.lineTo(0, apex);
    shape.closePath();
    return shape;
  }, []);

  const roofGeometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(roofShape, {
        depth: WALL_D + 0.7,
        bevelEnabled: false,
        curveSegments: 1,
      }),
    [roofShape]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (foundationRef.current) {
      const p = easeOutCubic(progress(t, 0, 1.1));
      foundationRef.current.scale.set(1, p, 1);
    }

    if (wallsRef.current) {
      const p = easeOutCubic(progress(t, 0.9, 2.6));
      wallsRef.current.scale.set(1, Math.max(p, 0.001), 1);
      wallsRef.current.position.y = PLINTH_H + (WALL_H / 2) * p;
    }

    if (roofRef.current) {
      const p = easeOutCubic(progress(t, 2.4, 3.6));
      roofRef.current.position.y = THREE.MathUtils.lerp(7, PLINTH_H + WALL_H, p);
      const mesh = roofRef.current.children[0] as THREE.Mesh | undefined;
      const mat = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.opacity = p;
    }

    windows.forEach((w, i) => {
      const mesh = windowRefs.current[i];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const start = 3.6 + w.delay;
      const p = progress(t, start, start + 0.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 2.6, easeOutCubic(p));
    });

    if (poolRef.current) {
      const mat = poolRef.current.material as THREE.MeshStandardMaterial;
      const p = progress(t, 4.6, 5.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 0.9, easeOutCubic(p));
    }
  });

  return (
    <group>
      {/* Foundation */}
      <mesh ref={foundationRef} position={[0, -0.1, 0]}>
        <boxGeometry args={[WALL_W + 0.4, 0.2, WALL_D + 0.4]} />
        <meshStandardMaterial color="#15181f" roughness={0.9} />
      </mesh>

      {/* Stone plinth */}
      <mesh position={[0, PLINTH_H / 2, 0]}>
        <boxGeometry args={[WALL_W + 0.1, PLINTH_H, WALL_D + 0.1]} />
        <meshStandardMaterial color="#5c5348" roughness={0.85} />
      </mesh>

      {/* Walls */}
      <mesh ref={wallsRef} position={[0, PLINTH_H + WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
        <meshStandardMaterial color="#eef0f3" roughness={0.55} metalness={0.02} />
      </mesh>

      {/* Roof */}
      <group ref={roofRef} position={[0, PLINTH_H + WALL_H, -(WALL_D + 0.7) / 2]}>
        <mesh geometry={roofGeometry}>
          <meshStandardMaterial color="#2c2620" roughness={0.75} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[WALL_D + 0.7, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#e8a855"
            emissive="#e8a855"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Windows */}
      {windows.map((w, i) => {
        const isFront = w.face === "front";
        const pos: [number, number, number] = isFront
          ? [w.x, PLINTH_H + w.y, WALL_D / 2 + 0.03]
          : [WALL_W / 2 + 0.03, PLINTH_H + w.y, w.x];
        return (
          <group key={i} position={pos} rotation={isFront ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
            {/* frame */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[w.w + 0.14, w.h + 0.14]} />
              <meshStandardMaterial color="#efeae2" roughness={0.5} />
            </mesh>
            <mesh
              ref={(el) => {
                windowRefs.current[i] = el;
              }}
            >
              <planeGeometry args={[w.w, w.h]} />
              <meshStandardMaterial
                color="#1a1408"
                emissive="#f2b566"
                emissiveIntensity={0}
                roughness={0.15}
              />
            </mesh>
          </group>
        );
      })}

      {/* Door */}
      <group position={[0, PLINTH_H, WALL_D / 2 + 0.02]}>
        <mesh position={[0, 0.7, -0.01]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshStandardMaterial color="#efeae2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <planeGeometry args={[0.96, 1.4]} />
          <meshStandardMaterial color="#2b1d12" roughness={0.6} />
        </mesh>
      </group>

      {/* Reflection strip / pool */}
      <mesh
        ref={poolRef}
        position={[0, 0.02, WALL_D / 2 + 3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[7, 2.4]} />
        <meshStandardMaterial
          color="#5fb8e8"
          emissive="#5fb8e8"
          emissiveIntensity={0}
          roughness={0.15}
        />
      </mesh>

      {trees.map((tr, i) => (
        <Tree key={i} {...tr} />
      ))}

      {/* Reflective ground */}
      <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={35}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#05070a"
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
