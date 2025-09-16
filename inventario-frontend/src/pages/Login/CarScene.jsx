// CarScene.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function CarScene({ zoom = false, side = "left" }) {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- escena / cámara / renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x272727);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.domElement.style.touchAction = "none";

    container.appendChild(renderer.domElement);

    // --- controles ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;
    controls.maxDistance = 60;
    controls.minPolarAngle = THREE.MathUtils.degToRad(15);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(85);
    controls.screenSpacePanning = true;

    let isUserOrbiting = false;
    controls.addEventListener("start", () => (isUserOrbiting = true));
    controls.addEventListener("end", () => (isUserOrbiting = false));

    // --- luces ---
    scene.add(new THREE.AmbientLight(0xffffff, 10));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(50, 100, 50);
    scene.add(dir);

    // --- suelo ---
    const grid = new THREE.GridHelper(600, 60, 0x888888, 0x444444);
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    scene.add(grid);

    // --- coche ---
    const car = new THREE.Group();
    scene.add(car);

    let heading = 0;
    let speed = 0;

    const sideSign = side === "right" ? 1 : -1;
    let eyeHeight = 8, sideOffset = 16, backOffset = -16;

    const camTarget = new THREE.Vector3();
    const desiredCam = new THREE.Vector3();
    const tmpLocal = new THREE.Vector3();
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load(
      "/models/hilux/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);
        model.position.sub(center);

        const targetHeight = 12;
        const s = targetHeight / Math.max(1e-6, size.y);
        model.scale.setScalar(s);
        car.add(model);

        // (opcional) que mire a la izquierda hacia el login
        // car.rotation.y = Math.PI;

        eyeHeight = size.y * s * 0.5;
        sideOffset = Math.max(10, size.x * s * 0.6);
        backOffset = -Math.max(8, size.z * s * 0.4);

        car.position.set(0, size.y * s * 0.5, 0);

        tmpLocal.set(sideSign * sideOffset, eyeHeight, backOffset);
        car.localToWorld(desiredCam.copy(tmpLocal));

        camera.position.copy(desiredCam);
        camTarget.copy(car.position);
        camTarget.y += eyeHeight * 0.6;
        controls.target.copy(camTarget);
        controls.update();
      },
      undefined,
      (err) => console.error("Error cargando GLTF:", err)
    );

    // animación
    const animate = () => {
      const dt = Math.min(0.033, clock.getDelta());
      const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
      car.position.addScaledVector(forward, speed * dt);
      car.rotation.y = heading;

      camTarget.set(car.position.x, car.position.y + eyeHeight * 0.6, car.position.z);
      controls.target.lerp(camTarget, 0.1);

      const zoomFactor = zoom ? 0.85 : 1.0;
      tmpLocal.set(sideSign * sideOffset * zoomFactor, eyeHeight, backOffset * zoomFactor);
      car.localToWorld(desiredCam.copy(tmpLocal));
      if (!isUserOrbiting) camera.position.lerp(desiredCam, 0.04);

      controls.update();
      grid.position.x = Math.floor(car.position.x / 10) * 10;
      grid.position.z = Math.floor(car.position.z / 10) * 10;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // full-screen strict
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        }
      });
      renderer.dispose();
      renderer.domElement?.parentNode?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,          // ocupa toda la ventana
        zIndex: -1,         // detrás del login
        cursor: "grab",
      }}
      onMouseDown={(e) => { e.currentTarget.style.cursor = "grabbing"; }}
      onMouseUp={(e) => { e.currentTarget.style.cursor = "grab"; }}
      onMouseLeave={(e) => { e.currentTarget.style.cursor = "grab"; }}
    />
  );
}
