"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

type KeyFrame = { t: number; radius: number; height: number; theta: number };

// A multi-beat cinematic drone path: wide establishing shot -> fast low
// swoop past the property -> rise back up -> settle into the hero framing.
const KEYFRAMES: KeyFrame[] = [
  { t: 0, radius: 27, height: 16, theta: -2.75 },
  { t: 2.3, radius: 9.5, height: 2.6, theta: -1.85 },
  { t: 4.2, radius: 18, height: 9.5, theta: -1.1 },
  { t: 6.6, radius: 21, height: 7.2, theta: -0.5 },
];

const IDLE_START = KEYFRAMES[KEYFRAMES.length - 1].t;
const TARGET = new THREE.Vector3(0, 1.9, 0.4);

function sampleKeyframes(t: number) {
  if (t <= KEYFRAMES[0].t) return KEYFRAMES[0];

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = easeInOutCubic((t - a.t) / (b.t - a.t));
      return {
        radius: THREE.MathUtils.lerp(a.radius, b.radius, p),
        height: THREE.MathUtils.lerp(a.height, b.height, p),
        theta: THREE.MathUtils.lerp(a.theta, b.theta, p),
      };
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1];
}

export function CameraRig() {
  const { camera } = useThree();
  const startTimeRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime;
    const t = clock.elapsedTime - startTimeRef.current;
    let radius: number;
    let height: number;
    let theta: number;

    if (t < IDLE_START) {
      const s = sampleKeyframes(t);
      radius = s.radius;
      height = s.height;
      theta = s.theta;
    } else {
      const idle = KEYFRAMES[KEYFRAMES.length - 1];
      radius = idle.radius;
      height = idle.height + Math.sin((t - IDLE_START) * 0.25) * 0.3;
      theta = idle.theta + (t - IDLE_START) * 0.045;
    }

    camera.position.set(
      radius * Math.sin(theta),
      height,
      radius * Math.cos(theta)
    );
    camera.lookAt(TARGET);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __camDebug: unknown }).__camDebug = {
        t,
        radius,
        height,
        theta,
        pos: camera.position.toArray(),
        fov: (camera as THREE.PerspectiveCamera).fov,
      };
    }
  });

  return null;
}
