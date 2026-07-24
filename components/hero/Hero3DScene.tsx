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
      camera={{ fov: 38, position: [0, 13, 24] }}
    >
      <color attach="background" args={["#0a0d12"]} />
      <fog attach="fog" args={["#0a0d12", 16, 46]} />

      <ambientLight intensity={0.5} color="#dce6f5" />
      <directionalLight position={[-8, 12, 6]} intensity={0.85} color="#cdddf2" />
      <directionalLight position={[6, 4, -8]} intensity={0.2} color="#5fb8e8" />

      <Stars radius={60} depth={30} count={1200} factor={2} fade speed={0.4} />

      <HouseModel />
      <CameraRig />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={0.5}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.15}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
