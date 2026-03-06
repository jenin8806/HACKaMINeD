import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FilmCamera3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 3.2;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const limeGlow = new THREE.PointLight(0xc7f711, 6, 10);
    limeGlow.position.set(0, 0, 2);
    scene.add(limeGlow);
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(3, 6, 4);
    scene.add(topLight);

    const group = new THREE.Group();
    scene.add(group);

    // Solid inner crystal
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x0a1520,
      roughness: 0.05,
      metalness: 0.9,
      emissive: 0xc7f711,
      emissiveIntensity: 0.08,
    });
    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 0), crystalMat);
    group.add(crystal);

    // Lime wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc7f711,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.74, 0), wireMat));

    // Outer glow shell
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0xc7f711,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.96, 1), ghostMat));

    // Orbiting ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.018, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0xc7f711, transparent: true, opacity: 0.35 })
    );
    ring.rotation.x = Math.PI / 2.8;
    ring.rotation.z = 0.4;
    group.add(ring);

    // Vertex sparkle dots
    const tmp = new THREE.IcosahedronGeometry(0.72, 0);
    const pos = tmp.attributes.position;
    const seen = new Set<string>();
    for (let i = 0; i < pos.count; i++) {
      const x = +pos.getX(i).toFixed(3);
      const y = +pos.getY(i).toFixed(3);
      const z = +pos.getZ(i).toFixed(3);
      const key = `${x},${y},${z}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xc7f711 })
      );
      dot.position.set(x, y, z);
      group.add(dot);
    }

    let mouseX = 0, mouseY = 0, isHovered = false, autoRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseenter", () => { isHovered = true; });
    el.addEventListener("mouseleave", () => { isHovered = false; });

    let frameId = 0, t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.012;

      crystalMat.emissiveIntensity = 0.07 + Math.sin(t * 1.4) * 0.04;
      limeGlow.intensity = 5.5 + Math.sin(t * 1.8) * 1.2;

      if (!isHovered) {
        autoRotY += 0.007;
        group.rotation.y += (autoRotY - group.rotation.y) * 0.04;
        group.rotation.x += (0.18 - group.rotation.x) * 0.03;
      } else {
        group.rotation.y += (mouseX * 1.1 - group.rotation.y) * 0.1;
        group.rotation.x += (-mouseY * 0.55 - group.rotation.x) * 0.1;
        autoRotY = group.rotation.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-20 h-20 cursor-grab active:cursor-grabbing mb-5"
    />
  );
}
