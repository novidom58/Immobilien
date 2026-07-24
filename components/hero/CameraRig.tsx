"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const INTRO_DURATION = 6.4;
const TARGET = new THREE.Vector3(0, 1.7, 0.4);

export function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    let radius: number;
    let height: number;
    let theta: number;

    if (t < INTRO_DURATION) {
      const p = easeInOutCubic(t / INTRO_DURATION);
      radius = THREE.MathUtils.lerp(24, 13.5, p);
      height = THREE.MathUtils.lerp(13, 5.2, p);
      theta = THREE.MathUtils.lerp(-2.5, -0.55, p);
    } else {
      radius = 13.5;
      height = 5.2;
      theta = -0.55 + (t - INTRO_DURATION) * 0.045;
    }

    camera.position.set(
      radius * Math.sin(theta),
      height,
      radius * Math.cos(theta)
    );
    camera.lookAt(TARGET);
  });

  return null;
}
