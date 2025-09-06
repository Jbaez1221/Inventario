import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function CarScene({ zoom = false, side = "left" }) {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Escena / Cámara / Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x272727);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- Controles de cámara (mouse) ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;     // distancia mínima al objetivo
    controls.maxDistance = 60;    // máxima
    controls.minPolarAngle = THREE.MathUtils.degToRad(15); // evita vista totalmente superior
    controls.maxPolarAngle = THREE.MathUtils.degToRad(85);
    controls.screenSpacePanning = true; // pan cómodo

    // --- Luces ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(50, 100, 50);
    scene.add(dir);

    // --- Suelo ---
    const grid = new THREE.GridHelper(600, 60, 0x888888, 0x444444);
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    scene.add(grid);

    // --- Grupo coche ---
    const car = new THREE.Group();
    scene.add(car);

    // “Física” simple del coche (opcional: mover con teclado)
    let heading = 0;   // yaw
    let speed = 0;
    const keys = { w:false, s:false, a:false, d:false, up:false, down:false, left:false, right:false };
    const ACCEL = 30, MAX_SPEED = 35, TURN_RATE = 1.8, DAMP = 4.0;

    // Parámetros para colocar la cámara de costado
    const sideSign = side === "right" ? 1 : -1;
    let eyeHeight = 8;
    let sideOffset = 12;
    let backOffset = -10;

    // Objetivos para “seguir” suavemente al coche
    const camTarget = new THREE.Vector3();
    const desiredCam = new THREE.Vector3();
    const tmpLocal = new THREE.Vector3();
    const clock = new THREE.Clock();

    // Cargar modelo
    const loader = new GLTFLoader();
    loader.load(
      "/models/hilux/scene.gltf",
      (gltf) => {
        const model = gltf.scene;

        // Centrado y escala automáticos
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);

        model.position.sub(center);
        const targetHeight = 12;
        const s = targetHeight / Math.max(1e-6, size.y);
        model.scale.setScalar(s);

        car.add(model);

        // Ajustar offsets de cámara según tamaño
        eyeHeight = size.y * s * 0.5;
        sideOffset = Math.max(10, size.x * s * 0.6);
        backOffset = -Math.max(8, size.z * s * 0.4);

        // Posición inicial del coche (apoyado)
        car.position.set(0, size.y * s * 0.5, 0);

        // Posición inicial de la cámara y target
        tmpLocal.set(sideSign * sideOffset, eyeHeight, backOffset);
        desiredCam.copy(tmpLocal);
        car.localToWorld(desiredCam);

        camera.position.copy(desiredCam);
        camTarget.copy(car.position);
        camTarget.y += eyeHeight * 0.6;
      },
      undefined,
      (err) => console.error("Error cargando GLTF:", err)
    );

    // Teclado (opcional): mover el coche
    const onKey = (e, down) => {
      const k = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k)) e.preventDefault();
      if (k === "w") keys.w = down;
      if (k === "s") keys.s = down;
      if (k === "a") keys.a = down;
      if (k === "d") keys.d = down;
      if (e.key === "ArrowUp") keys.up = down;
      if (e.key === "ArrowDown") keys.down = down;
      if (e.key === "ArrowLeft") keys.left = down;
      if (e.key === "ArrowRight") keys.right = down;
    };
    window.addEventListener("keydown", (e) => onKey(e, true), { passive: false });
    window.addEventListener("keyup",   (e) => onKey(e, false), { passive: false });

    // Animación
    const animate = () => {
      const dt = Math.min(0.033, clock.getDelta());

      // Movimiento del coche (opcional)
      const forwardInput = (keys.w || keys.up ? 1 : 0) + (keys.s || keys.down ? -1 : 0);
      speed += forwardInput * ACCEL * dt;
      speed = THREE.MathUtils.damp(speed, 0, DAMP, dt);
      speed = THREE.MathUtils.clamp(speed, -MAX_SPEED * 0.6, MAX_SPEED);

      const steerInput = (keys.a || keys.left ? 1 : 0) + (keys.d || keys.right ? -1 : 0);
      const steerFactor = (speed / MAX_SPEED);
      heading += steerInput * TURN_RATE * steerFactor * dt;

      const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
      car.position.addScaledVector(forward, speed * dt);
      car.rotation.y = heading;

      // Calcular target del control para que siga al coche SUAVEMENTE
      camTarget.set(car.position.x, car.position.y + eyeHeight * 0.6, car.position.z);
      controls.target.lerp(camTarget, 0.1);

      // Si quieres que, además, al pasar 'zoom' se acerque un poco automáticamente:
      const zoomFactor = zoom ? 0.85 : 1.0;
      tmpLocal.set(sideSign * sideOffset * zoomFactor, eyeHeight, backOffset * zoomFactor);
      desiredCam.copy(tmpLocal);
      car.localToWorld(desiredCam);

      // Lleva la cámara hacia la posición deseada, pero SIN romper el control del usuario
      // (OrbitControls sigue mandando; esto solo “empuja” suave)
      camera.position.lerp(desiredCam, 0.04);

      // Actualiza OrbitControls (damping/inputs del mouse)
      controls.update();

      // Mantener grilla cerca
      grid.position.x = Math.floor(car.position.x / 10) * 10;
      grid.position.z = Math.floor(car.position.z / 10) * 10;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", (e) => onKey(e, true));
      window.removeEventListener("keyup",   (e) => onKey(e, false));
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [zoom, side]);

  // Deja espacio para el login al costado
  return (
    <div
      ref={mountRef}
      style={{
        width: "55vw",   // 3D en 55% del ancho
        height: "100vh",
        overflow: "hidden"
      }}
    />
  );
}
