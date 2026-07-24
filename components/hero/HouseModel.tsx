"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
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

const windows = [
  { x: -3, y: 1.9, w: 1.2, h: 1.4, face: "front" as const, delay: 0 },
  { x: -1, y: 1.9, w: 1.2, h: 1.4, face: "front" as const, delay: 0.18 },
  { x: 1, y: 1.9, w: 1.2, h: 1.4, face: "front" as const, delay: 0.36 },
  { x: 3, y: 1.9, w: 1.2, h: 1.4, face: "front" as const, delay: 0.54 },
  { x: -1.5, y: 1.9, w: 1.4, h: 1.6, face: "side" as const, delay: 0.72 },
  { x: 1.5, y: 1.9, w: 1.4, h: 1.6, face: "side" as const, delay: 0.9 },
];

export function HouseModel() {
  const foundationRef = useRef<THREE.Mesh>(null);
  const wallsRef = useRef<THREE.Mesh>(null);
  const roofRef = useRef<THREE.Group>(null);
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const poolRef = useRef<THREE.Mesh>(null);

  const roofShape = useMemo(() => {
    const shape = new THREE.Shape();
    const halfW = WALL_W / 2 + 0.3;
    const apex = 2.1;
    shape.moveTo(-halfW, 0);
    shape.lineTo(halfW, 0);
    shape.lineTo(0, apex);
    shape.closePath();
    return shape;
  }, []);

  const roofGeometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(roofShape, {
        depth: WALL_D + 0.6,
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
      wallsRef.current.position.y = (WALL_H / 2) * p;
    }

    if (roofRef.current) {
      const p = easeOutCubic(progress(t, 2.4, 3.6));
      roofRef.current.position.y = THREE.MathUtils.lerp(6, WALL_H, p);
      const mat = (roofRef.current.children[0] as THREE.Mesh)
        ?.material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.opacity = p;
    }

    windows.forEach((w, i) => {
      const mesh = windowRefs.current[i];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const start = 3.6 + w.delay;
      const p = progress(t, start, start + 0.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 4.5, easeOutCubic(p));
    });

    if (poolRef.current) {
      const mat = poolRef.current.material as THREE.MeshStandardMaterial;
      const p = progress(t, 4.6, 5.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 1.1, easeOutCubic(p));
    }
  });

  return (
    <group>
      {/* Foundation */}
      <mesh ref={foundationRef} position={[0, -0.1, 0]}>
        <boxGeometry args={[WALL_W + 0.4, 0.2, WALL_D + 0.4]} />
        <meshStandardMaterial color="#1a1f29" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh ref={wallsRef} position={[0, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
        <meshStandardMaterial color="#4a5162" roughness={0.7} metalness={0.05} />
        <Edges color="#8fa3c0" />
      </mesh>

      {/* Roof */}
      <group ref={roofRef} position={[0, WALL_H, -(WALL_D + 0.6) / 2]}>
        <mesh geometry={roofGeometry} rotation={[0, 0, 0]}>
          <meshStandardMaterial
            color="#14181f"
            roughness={0.6}
            transparent
            opacity={0}
          />
          <Edges color="#e8a855" />
        </mesh>
      </group>

      {/* Windows */}
      {windows.map((w, i) => {
        const isFront = w.face === "front";
        return (
          <mesh
            key={i}
            ref={(el) => {
              windowRefs.current[i] = el;
            }}
            position={
              isFront
                ? [w.x, w.y, WALL_D / 2 + 0.02]
                : [WALL_W / 2 + 0.02, w.y, w.x]
            }
            rotation={isFront ? [0, 0, 0] : [0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[w.w, w.h]} />
            <meshStandardMaterial
              color="#0f1420"
              emissive="#e8a855"
              emissiveIntensity={0}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Door */}
      <mesh position={[0, 0.7, WALL_D / 2 + 0.02]}>
        <planeGeometry args={[1, 1.4]} />
        <meshStandardMaterial color="#0d1015" roughness={0.9} />
      </mesh>

      {/* Reflection strip / pool */}
      <mesh
        ref={poolRef}
        position={[0, 0.02, WALL_D / 2 + 3]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[7, 2.2]} />
        <meshStandardMaterial
          color="#5fb8e8"
          emissive="#5fb8e8"
          emissiveIntensity={0}
          roughness={0.2}
        />
      </mesh>

      {/* Ground */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0d12" roughness={1} />
      </mesh>
    </group>
  );
}
