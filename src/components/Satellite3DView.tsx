/**
 * Satellite3DView.tsx
 * Cinematic 3D Spacecraft Simulation using Three.js with Canvas fallback.
 * Implements labeled interactive subsystems, orbital horizon, and state-driven animations.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SubsystemId, SimTimelineStage } from '../types';
import { SUBSYSTEM_DEFINITIONS } from '../data/simulationScenarios';
import { Eye, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Satellite3DViewProps {
  stage: SimTimelineStage;
  affectedSubsystemId: SubsystemId | null;
  selectedSubsystemId: SubsystemId | null;
  onSelectSubsystem: (id: SubsystemId) => void;
  isPaused: boolean;
  className?: string;
}

export const Satellite3DView: React.FC<Satellite3DViewProps> = ({
  stage,
  affectedSubsystemId,
  selectedSubsystemId,
  onSelectSubsystem,
  isPaused,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const satelliteGroupRef = useRef<THREE.Group | null>(null);
  const subsystemMeshesRef = useRef<Map<SubsystemId, THREE.Object3D>>(new Map());
  const pulseRingsRef = useRef<Map<SubsystemId, THREE.Mesh>>(new Map());
  const reqIdRef = useRef<number | null>(null);

  // Rotation / Interaction state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0.0025 });
  const autoRotateSpeed = useRef<number>(0.003);

  const [hoveredSubsystem, setHoveredSubsystem] = useState<SubsystemId | null>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);

  // Helper to test WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlAvailable(false);
      }
    } catch {
      setWebGlAvailable(false);
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webGlAvailable) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 4.4);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting (Aerospace Solar Simulation)
    const ambientLight = new THREE.AmbientLight(0x283b58, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6ea, 2.8);
    sunLight.position.set(6, 4, 5);
    scene.add(sunLight);

    const earthRimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    earthRimLight.position.set(-5, -6, -3);
    scene.add(earthRimLight);

    // 4. Background: Distant Stars & Earth Horizon
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25 + Math.random() * 15;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorTint = Math.random();
      if (colorTint > 0.8) {
        starColors[i * 3] = 0.8;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (colorTint < 0.2) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.7;
      } else {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.95;
      }
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Earth Curve in Lower Background
    const earthRadius = 18;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 48, 24);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c2547,
      roughness: 0.8,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.position.set(0, -earthRadius - 2.8, -4);
    scene.add(earthMesh);

    // Earth Atmosphere Rim Glow Ring
    const atmosphereGeom = new THREE.RingGeometry(earthRadius, earthRadius + 0.45, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    atmosphere.position.copy(earthMesh.position);
    atmosphere.position.z += 0.1;
    scene.add(atmosphere);

    // 5. Build Spacecraft 3D Geometry
    const satGroup = new THREE.Group();
    scene.add(satGroup);
    satelliteGroupRef.current = satGroup;

    // Materials Palette (Authentic Aerospace: Anodized aluminum, Kapton gold, solar wafer)
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.85,
      roughness: 0.25
    });
    const goldKaptonMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x451a03,
      emissiveIntensity: 0.2
    });
    const solarCellMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.35
    });
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.75,
      roughness: 0.3
    });
    const copperTraceMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.9,
      roughness: 0.2
    });

    // Helper to register an interactive subsystem mesh/group
    const registerSubsystem = (id: SubsystemId, object: THREE.Object3D) => {
      object.userData = { subsystemId: id };
      satGroup.add(object);
      subsystemMeshesRef.current.set(id, object);

      // Add a status halo ring for fault / selection indicator
      const ringGeom = new THREE.RingGeometry(0.24, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(object.position);
      ringMesh.position.z += 0.35;
      satGroup.add(ringMesh);
      pulseRingsRef.current.set(id, ringMesh);
    };

    // A. Main 3U Spacecraft Bus Frame (Center)
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.8, 0.72), chassisMat);
    satGroup.add(busBody);

    // Kapton foil panels on lateral faces
    const kaptonPanel1 = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.7), goldKaptonMat);
    kaptonPanel1.position.set(0, 0, 0.365);
    satGroup.add(kaptonPanel1);

    const kaptonPanel2 = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.7), goldKaptonMat);
    kaptonPanel2.position.set(0, 0, -0.365);
    kaptonPanel2.rotation.y = Math.PI;
    satGroup.add(kaptonPanel2);

    // Structural corner rails
    const cornerRailMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const rails = [
      [-0.37, 0, -0.37],
      [0.37, 0, -0.37],
      [-0.37, 0, 0.37],
      [0.37, 0, 0.37]
    ];
    rails.forEach(([rx, ry, rz]) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.84, 0.04), cornerRailMat);
      rail.position.set(rx, ry, rz);
      satGroup.add(rail);
    });

    // B. Subsystem: Power / EPS (Lower Section Bus)
    const epsGroup = new THREE.Group();
    epsGroup.position.set(0.0, -0.4, 0.28);
    const epsBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.18), aluminumMat);
    const epsIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    epsIndicator.position.set(0.18, 0.08, 0.1);
    epsGroup.add(epsBox, epsIndicator);
    registerSubsystem('eps', epsGroup);

    // C. Subsystem: Battery Pack (Bottom Cell Bay)
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(0.0, -0.72, 0.0);
    const batt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 18), aluminumMat);
    batt1.position.set(-0.16, 0, 0);
    const batt2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 18), aluminumMat);
    batt2.position.set(0.16, 0, 0);
    const battPlate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.5), copperTraceMat);
    batteryGroup.add(batt1, batt2, battPlate);
    registerSubsystem('battery', batteryGroup);

    // D. Subsystem: Onboard Computer (OBC) / Avionics (Center Stack)
    const obcGroup = new THREE.Group();
    obcGroup.position.set(0.0, 0.08, 0.25);
    const obcBox = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.36, 0.22), aluminumMat);
    const chipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2, emissive: 0x0369a1, emissiveIntensity: 0.5 })
    );
    chipMesh.position.set(0, 0, 0.12);
    obcGroup.add(obcBox, chipMesh);
    registerSubsystem('obc', obcGroup);

    // E. Subsystem: ADCS Reaction Wheels (Upper Deck)
    const adcsGroup = new THREE.Group();
    adcsGroup.position.set(0.0, 0.5, 0.0);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const rwX = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24), wheelMat);
    rwX.rotation.z = Math.PI / 2;
    rwX.position.set(0.2, 0, 0);
    const rwY = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24), wheelMat);
    rwY.position.set(0, 0.18, 0);
    const rwZ = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24), wheelMat);
    rwZ.rotation.x = Math.PI / 2;
    rwZ.position.set(0, 0, 0.2);
    adcsGroup.add(rwX, rwY, rwZ);
    registerSubsystem('adcs', adcsGroup);

    // F. Subsystem: Communications (Top Mast & S-Band Patch)
    const commsGroup = new THREE.Group();
    commsGroup.position.set(0.0, 0.95, 0.0);
    const commsDish = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 0.16, 20), aluminumMat);
    const dipole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), copperTraceMat);
    dipole1.rotation.z = Math.PI / 3;
    dipole1.position.set(0.3, 0.2, 0);
    const dipole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), copperTraceMat);
    dipole2.rotation.z = -Math.PI / 3;
    dipole2.position.set(-0.3, 0.2, 0);
    commsGroup.add(commsDish, dipole1, dipole2);
    registerSubsystem('comms', commsGroup);

    // G. Subsystem: Thermal Louver / Radiator Panel (Lateral side)
    const thermalGroup = new THREE.Group();
    thermalGroup.position.set(-0.38, 0.05, 0.0);
    const radiatorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.65), aluminumMat);
    const fins: THREE.Mesh[] = [];
    for (let f = -0.35; f <= 0.35; f += 0.14) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.6), aluminumMat);
      fin.position.set(-0.04, f, 0);
      fins.push(fin);
    }
    thermalGroup.add(radiatorPlate, ...fins);
    registerSubsystem('thermal', thermalGroup);

    // H. Subsystem: Payload / Optical IMS Sensor (Nadir bottom face)
    const payloadGroup = new THREE.Group();
    payloadGroup.position.set(0.0, -0.96, 0.0);
    const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.25, 24), chassisMat);
    const opticalLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 24),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.95,
        emissive: 0x0891b2,
        emissiveIntensity: 0.45
      })
    );
    opticalLens.rotation.x = Math.PI / 2;
    opticalLens.position.y = -0.13;
    payloadGroup.add(lensBarrel, opticalLens);
    registerSubsystem('payload', payloadGroup);

    // I. Subsystem: Solar Panel Deployable Wings (Left & Right)
    const solarGroup = new THREE.Group();
    solarGroup.position.set(0.0, 0.0, 0.0);

    // Right Wing
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.03), solarCellMat);
    rightWing.position.set(1.22, 0, 0);
    const rightHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.45, 16), cornerRailMat);
    rightHinge.position.set(0.4, 0, 0);

    // Left Wing
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.03), solarCellMat);
    leftWing.position.set(-1.22, 0, 0);
    const leftHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.45, 16), cornerRailMat);
    leftHinge.position.set(-0.4, 0, 0);

    // Photovoltaic cell division grid lines
    const gridLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    solarGroup.add(rightWing, rightHinge, leftWing, leftHinge);
    registerSubsystem('solar', solarGroup);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Autonomous rotation when not dragging
      if (!isDraggingRef.current && satelliteGroupRef.current) {
        if (!isPaused) {
          satelliteGroupRef.current.rotation.y += autoRotateSpeed.current;
        }
      }

      // Smooth decay of dragging momentum
      if (!isDraggingRef.current && satelliteGroupRef.current) {
        satelliteGroupRef.current.rotation.y += rotationVelocity.current.y;
        satelliteGroupRef.current.rotation.x += rotationVelocity.current.x;
        rotationVelocity.current.y *= 0.95;
        rotationVelocity.current.x *= 0.95;
      }

      // Animate Status Halo Rings (Pulse when affected or selected)
      pulseRingsRef.current.forEach((ring, subId) => {
        const isAffected = subId === affectedSubsystemId;
        const isSelected = subId === selectedSubsystemId;
        const mat = ring.material as THREE.MeshBasicMaterial;

        if (isAffected) {
          mat.opacity = 0.5 + Math.sin(elapsedTime * 6) * 0.4;
          mat.color.setHex(0xef4444); // Red/Amber warning
          ring.scale.setScalar(1.0 + Math.sin(elapsedTime * 6) * 0.15);
        } else if (isSelected) {
          mat.opacity = 0.7 + Math.sin(elapsedTime * 3) * 0.25;
          mat.color.setHex(0x38bdf8); // Cyan selection
          ring.scale.setScalar(1.1);
        } else if (stage === 'safe_operation' && isAffected) {
          mat.opacity = 0.6;
          mat.color.setHex(0x10b981); // Emerald recovery
        } else {
          mat.opacity = 0.0;
        }

        if (cameraRef.current) {
          ring.quaternion.copy(cameraRef.current.quaternion);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      if (container) container.innerHTML = '';
    };
  }, [webGlAvailable]);

  // Handle Raycasting & Pointer Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container || !sceneRef.current || !cameraRef.current) return;

    if (isDraggingRef.current && satelliteGroupRef.current) {
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;

      satelliteGroupRef.current.rotation.y += deltaX * 0.007;
      satelliteGroupRef.current.rotation.x += deltaY * 0.007;

      // Clamp X rotation so model doesn't flip upside down
      satelliteGroupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, satelliteGroupRef.current.rotation.x));

      rotationVelocity.current = {
        x: deltaY * 0.002,
        y: deltaX * 0.002
      };

      prevMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycasting hover detection
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const interactiveObjects: THREE.Object3D[] = [];
      subsystemMeshesRef.current.forEach((obj) => interactiveObjects.push(obj));

      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.subsystemId && current.parent) {
          current = current.parent;
        }
        if (current && current.userData.subsystemId) {
          setHoveredSubsystem(current.userData.subsystemId as SubsystemId);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredSubsystem(null);
      container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = hoveredSubsystem ? 'pointer' : 'grab';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const interactiveObjects: THREE.Object3D[] = [];
    subsystemMeshesRef.current.forEach((obj) => interactiveObjects.push(obj));

    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0].object;
      while (current && !current.userData.subsystemId && current.parent) {
        current = current.parent;
      }
      if (current && current.userData.subsystemId) {
        onSelectSubsystem(current.userData.subsystemId as SubsystemId);
      }
    }
  };

  // Reset Camera & Orientation
  const handleResetCamera = () => {
    if (satelliteGroupRef.current) {
      satelliteGroupRef.current.rotation.set(0.2, 0.4, 0);
      rotationVelocity.current = { x: 0, y: 0.002 };
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.8, 4.4);
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.5 : 0.5;
    const newZ = Math.max(2.8, Math.min(6.5, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
  };

  // Find info on currently active/selected subsystem
  const activeSubsystemMeta = SUBSYSTEM_DEFINITIONS.find(
    s => s.id === (selectedSubsystemId || affectedSubsystemId || hoveredSubsystem)
  );

  return (
    <div className={`relative w-full h-[540px] lg:h-[620px] rounded-xl overflow-hidden bg-[#050811] border border-slate-800 select-none ${className}`}>
      {/* Space Canvas Background */}
      {webGlAvailable ? (
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
        />
      ) : (
        /* Fallback High-Quality 2.5D SVG/Canvas if WebGL is unavailable */
        <div className="w-full h-full flex items-center justify-center relative p-8">
          <svg className="w-full max-w-xl h-auto" viewBox="0 0 800 500" fill="none">
            {/* Stars */}
            <circle cx="120" cy="80" r="1.5" fill="#94a3b8" />
            <circle cx="340" cy="40" r="1" fill="#cbd5e1" />
            <circle cx="680" cy="110" r="1.5" fill="#94a3b8" />
            <circle cx="740" cy="340" r="1" fill="#e2e8f0" />
            {/* Earth Horizon */}
            <ellipse cx="400" cy="620" rx="600" ry="240" fill="#0c2547" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
            {/* Spacecraft Chassis */}
            <rect x="340" y="160" width="120" height="220" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="3" />
            <rect x="350" y="180" width="100" height="180" fill="#d97706" opacity="0.4" />
            {/* Solar Wings */}
            <rect x="150" y="180" width="170" height="180" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            <rect x="480" y="180" width="170" height="180" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            {/* Antenna & Sensors */}
            <line x1="400" y1="160" x2="400" y2="110" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="400" cy="105" r="8" fill="#38bdf8" />
          </svg>
        </div>
      )}

      {/* Camera & Interaction Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 backdrop-blur-sm transition"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 backdrop-blur-sm transition"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 backdrop-blur-sm transition"
          title="Reset Camera View"
          aria-label="Reset camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Orbit & Orientation Guide Indicator */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] font-telemetry text-slate-400 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-800">
        <Eye className="w-3.5 h-3.5 text-cyan-400" />
        <span>Click & drag to rotate 3D spacecraft • Tap subsystem to inspect</span>
      </div>

      {/* Active Subsystem Floating HUD Callout */}
      {activeSubsystemMeta && (
        <div className="absolute top-4 left-4 z-20 max-w-xs bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg p-3 shadow-xl space-y-1.5 transition-all">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  activeSubsystemMeta.id === affectedSubsystemId
                    ? stage === 'safe_operation'
                      ? 'bg-emerald-400'
                      : 'bg-rose-500 animate-ping'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="font-display font-semibold text-xs text-white">
                {activeSubsystemMeta.name}
              </span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-telemetry uppercase ${
                activeSubsystemMeta.id === affectedSubsystemId
                  ? stage === 'safe_operation'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activeSubsystemMeta.id === affectedSubsystemId
                ? stage === 'safe_operation'
                  ? 'RECOVERED'
                  : 'AFFECTED'
                : 'NOMINAL'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-telemetry pt-0.5">
            <span className="text-slate-400">{activeSubsystemMeta.metricLabel}:</span>
            <span
              className={`font-semibold ${
                activeSubsystemMeta.id === affectedSubsystemId && stage !== 'safe_operation'
                  ? 'text-rose-400'
                  : 'text-cyan-300'
              }`}
            >
              {activeSubsystemMeta.metricValue}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            {activeSubsystemMeta.description}
          </p>
        </div>
      )}

      {/* Subsystem Direct Jump Pills along top-center */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-wrap gap-1.5 max-w-md justify-end">
        {SUBSYSTEM_DEFINITIONS.map((sub) => {
          const isAffected = sub.id === affectedSubsystemId;
          const isSelected = sub.id === selectedSubsystemId;

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubsystem(sub.id)}
              className={`px-2 py-1 rounded text-[10px] font-telemetry transition flex items-center gap-1 backdrop-blur-md ${
                isAffected
                  ? stage === 'safe_operation'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-500/25 text-rose-200 border border-rose-500/60 animate-pulse'
                  : isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/60'
                  : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/70'
              }`}
            >
              {isAffected && stage !== 'safe_operation' ? (
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
              ) : isAffected && stage === 'safe_operation' ? (
                <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
              <span>{sub.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
