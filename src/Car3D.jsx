import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';

const BASE = import.meta.env.BASE_URL;
const MODEL = `${BASE}models/mm-car.glb`;
useGLTF.setDecoderPath(`${BASE}draco/`);

const WHEELS = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'];

/* The GLB (Ferrari 458 Italia, three.js examples) is centred and scaled once, then only the
   body paint is touched. Everything else keeps the artist's materials. */
function Car({ paint }) {
  const { scene } = useGLTF(MODEL);
  const bodyMat = useRef(null);
  const target = useMemo(() => new THREE.Color(), []);

  const { model, wheels } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const k = 4.6 / Math.max(size.x, size.z);
    root.scale.setScalar(k);
    root.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);

    root.traverse((o) => {
      if (!o.isMesh) return;
      if (o.name === 'glass') {
        o.material = o.material.clone();
        o.material.envMapIntensity = 0.35;
      }
      if (o.name === 'body') {
        o.material = o.material.clone();
        o.material.metalness = 0.7;
        o.material.roughness = 0.32;
        o.material.clearcoat = 1;
        o.material.clearcoatRoughness = 0.05;
        o.material.envMapIntensity = 1.2;
        bodyMat.current = o.material;
      }
    });
    return { model: root, wheels: WHEELS.map((n) => root.getObjectByName(n)).filter(Boolean) };
  }, [scene]);

  useFrame((_, delta) => {
    if (bodyMat.current) {
      target.set(paint);
      bodyMat.current.color.lerp(target, 1 - Math.exp(-delta * 5));
    }
    wheels.forEach((w) => { w.rotation.x -= delta * 1.6; });
  });

  return <primitive object={model} />;
}

// Phones cannot use OrbitControls (it claims touch-action and blocks page scroll), so the camera
// drifts around the car by itself instead.
function AutoOrbit() {
  useFrame(({ camera, clock }) => {
    const a = clock.elapsedTime * 0.22 + 0.9;
    const r = 7.2;
    camera.position.set(Math.sin(a) * r, 1.9, Math.cos(a) * r);
    camera.lookAt(0, 0.05, 0);
  });
  return null;
}

export default function Car3D({ paint = '#d4150c' }) {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const coarse = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, []);

  // stop rendering while the hero is off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="car-canvas">
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={coarse ? [1, 1.25] : [1, 1.5]} camera={{ position: [6.3, 1.9, 6.0], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 3]} intensity={1.6} />
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={3.5} position={[0, 5, -2]} scale={[12, 2, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} scale={[7, 2, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={1.6} position={[5, 1, -2]} scale={[6, 2, 1]} rotation-y={-Math.PI / 2} />
          </Environment>
          <Car paint={paint} />
          <ContactShadows position={[0, 0.005, 0]} opacity={0.6} scale={10} blur={2.6} far={3} frames={1} />
        </Suspense>
        {coarse
          ? <AutoOrbit />
          : <OrbitControls target={[0, 0.55, 0]} enablePan={false} enableZoom={false} enableDamping autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 2.05} />}
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
