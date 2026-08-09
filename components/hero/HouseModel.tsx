"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs --
 * React Three Fiber renders imperatively: Object3D/Material instances are
 * mutated directly inside useFrame every tick instead of via React state,
 * which is the documented, standard R3F pattern (avoids re-render cost for
 * 60fps animation). The React Compiler's purity rules don't model this. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function progress(t: number, start: number, end: number) {
  return THREE.MathUtils.clamp((t - start) / (end - start), 0, 1);
}

const WALL_W = 10;
const WALL_H = 3.2;
const WALL_D = 8;
const PLINTH_H = 0.5;
const WIPE_START = 1.0;
const WIPE_END = 3.8;
const WIPE_FROM = 7.5;
const WIPE_TO = -7.5;

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
  const { gl } = useThree();
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const poolRef = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<THREE.Group>(null);
  const introRef = useRef<THREE.Group>(null);
  const planeSolidRef = useRef(new THREE.Plane(new THREE.Vector3(1, 0, 0), WIPE_FROM));
  const planeBlueprintRef = useRef(new THREE.Plane(new THREE.Vector3(-1, 0, 0), WIPE_FROM));
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Required once for material-level clipping planes to take effect.
    gl.localClippingEnabled = true;
  }, [gl]);

  const solidClip = useMemo(() => [planeSolidRef.current], []);
  const blueprintClip = useMemo(() => [planeBlueprintRef.current], []);

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
    // Shader/pipeline warm-up before the first rendered frame can eat a
    // variable amount of wall-clock time (worse on weak GPUs/software
    // rendering). Re-basing elapsedTime to the first actual frame keeps the
    // reveal timeline consistent regardless of that startup delay.
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime;
    const t = clock.elapsedTime - startTimeRef.current;

    if (introRef.current) {
      const p = easeOutCubic(progress(t, 0, 0.7));
      introRef.current.scale.set(1, Math.max(p, 0.001), 1);
    }

    const wipeP = easeInOutCubic(progress(t, WIPE_START, WIPE_END));
    const wipeX = THREE.MathUtils.lerp(WIPE_FROM, WIPE_TO, wipeP);
    planeSolidRef.current.constant = -wipeX;
    planeBlueprintRef.current.constant = wipeX;

    if (sparklesRef.current) {
      sparklesRef.current.position.x = wipeX;
      sparklesRef.current.visible = wipeP > 0.01 && wipeP < 0.99;
    }

    let win0Intensity = 0;
    windows.forEach((w, i) => {
      const mesh = windowRefs.current[i];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const start = WIPE_END + w.delay;
      const p = progress(t, start, start + 0.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 1.7, easeOutCubic(p));
      if (i === 0) win0Intensity = mat.emissiveIntensity;
    });

    if (poolRef.current) {
      const mat = poolRef.current.material as THREE.MeshStandardMaterial;
      const p = progress(t, WIPE_END + 0.6, WIPE_END + 1.6);
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 0.9, easeOutCubic(p));
    }

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __wipeDebug: unknown }).__wipeDebug = { t, wipeP, wipeX, win0Intensity };
    }
  });

  return (
    <group>
      {/* Foundation + plinth intro */}
      <group ref={introRef} position={[0, 0, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[WALL_W + 0.4, 0.2, WALL_D + 0.4]} />
          <meshStandardMaterial color="#15181f" roughness={0.9} />
        </mesh>
        <mesh position={[0, PLINTH_H / 2, 0]}>
          <boxGeometry args={[WALL_W + 0.1, PLINTH_H, WALL_D + 0.1]} />
          <meshStandardMaterial color="#5c5348" roughness={0.85} />
        </mesh>
      </group>

      {/* ===== Blueprint hologram (visible where x < wipe boundary) ===== */}
      <mesh position={[0, PLINTH_H + WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
        <meshBasicMaterial
          color="#5fb8e8"
          wireframe
          clippingPlanes={blueprintClip}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, PLINTH_H + WALL_H, -(WALL_D + 0.7) / 2]} geometry={roofGeometry}>
        <meshBasicMaterial
          color="#5fb8e8"
          wireframe
          clippingPlanes={blueprintClip}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* dimension line accents */}
      <mesh position={[0, -0.05, WALL_D / 2 + 1.4]}>
        <boxGeometry args={[WALL_W, 0.02, 0.02]} />
        <meshBasicMaterial color="#5fb8e8" clippingPlanes={blueprintClip} transparent opacity={0.7} />
      </mesh>
      <mesh position={[WALL_W / 2 + 1.2, PLINTH_H + WALL_H / 2, 0]}>
        <boxGeometry args={[0.02, WALL_H, 0.02]} />
        <meshBasicMaterial color="#5fb8e8" clippingPlanes={blueprintClip} transparent opacity={0.7} />
      </mesh>

      {/* ===== Solid building (visible where x > wipe boundary) ===== */}
      <mesh position={[0, PLINTH_H + WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_W, WALL_H, WALL_D]} />
        <meshStandardMaterial
          color="#eef0f3"
          roughness={0.55}
          metalness={0.02}
          clippingPlanes={solidClip}
        />
      </mesh>

      <group position={[0, PLINTH_H + WALL_H, -(WALL_D + 0.7) / 2]}>
        <mesh geometry={roofGeometry}>
          <meshStandardMaterial color="#2c2620" roughness={0.75} clippingPlanes={solidClip} />
        </mesh>
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[WALL_D + 0.7, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#e8a855"
            emissive="#e8a855"
            emissiveIntensity={0.8}
            clippingPlanes={solidClip}
          />
        </mesh>
      </group>

      {/* Windows (solid only) */}
      {windows.map((w, i) => {
        const isFront = w.face === "front";
        const pos: [number, number, number] = isFront
          ? [w.x, PLINTH_H + w.y, WALL_D / 2 + 0.03]
          : [WALL_W / 2 + 0.03, PLINTH_H + w.y, w.x];
        return (
          <group key={i} position={pos} rotation={isFront ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[w.w + 0.14, w.h + 0.14]} />
              <meshStandardMaterial color="#efeae2" roughness={0.5} clippingPlanes={solidClip} />
            </mesh>
            <mesh
              ref={(el) => {
                windowRefs.current[i] = el;
              }}
            >
              <planeGeometry args={[w.w, w.h]} />
              <meshStandardMaterial
                color="#1a1408"
                emissive="#ff9d42"
                emissiveIntensity={0}
                roughness={0.15}
                clippingPlanes={solidClip}
              />
            </mesh>
          </group>
        );
      })}

      {/* Door (solid only) */}
      <group position={[0, PLINTH_H, WALL_D / 2 + 0.02]}>
        <mesh position={[0, 0.7, -0.01]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshStandardMaterial color="#efeae2" roughness={0.5} clippingPlanes={solidClip} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <planeGeometry args={[0.96, 1.4]} />
          <meshStandardMaterial color="#2b1d12" roughness={0.6} clippingPlanes={solidClip} />
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

      {/* Wipe-boundary particle band */}
      <group ref={sparklesRef} position={[WIPE_FROM, PLINTH_H + WALL_H / 1.6, 0]}>
        <Sparkles count={50} scale={[0.8, WALL_H + 1.6, WALL_D + 2]} size={2.5} speed={0.6} color="#f2c177" />
      </group>

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
