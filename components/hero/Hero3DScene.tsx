"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { HouseModel } from "./HouseModel";
import { CameraRig } from "./CameraRig";

export default function Hero3DScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ fov: 38, position: [0, 16, 27] }}
    >
      <color attach="background" args={["#080a0f"]} />
      <fog attach="fog" args={["#080a0f", 14, 48]} />

      <ambientLight intensity={0.4} color="#dce6f5" />
      <directionalLight position={[-9, 13, 7]} intensity={0.75} color="#eef2fb" />
      <directionalLight position={[7, 3, -9]} intensity={0.5} color="#6fa8d8" />
      <directionalLight position={[0, 4, 10]} intensity={0.35} color="#e8a855" />

      <Stars radius={70} depth={30} count={1400} factor={2.2} fade speed={0.35} />

      <HouseModel />
      <CameraRig />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={0.35}
          luminanceThreshold={0.88}
          luminanceSmoothing={0.15}
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
