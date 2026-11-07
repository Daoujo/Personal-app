import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Compass, 
  Sparkles, 
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TRADING_MINDMAP_DATA, MINDMAP_EDGES, MindmapNodeData } from '../data/tradingMindmapData';
import { TradingChapterSheet } from './TradingChapterSheet';
import { playClickSound } from '../utils/audio';

export const TradingMindmap3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<MindmapNodeData | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isGuiding, setIsGuiding] = useState(false);

  // References to communicate between React and Three.js render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 7.8));
  const currentCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 7.8));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Pan interaction state
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const worldPanRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetWorldPanRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = Math.max(480, container.clientHeight || 560);

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x070a11, 0.055);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    // 2. Renderer with color management
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3.5, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x38bdf8, 2.5, 30);
    pointLight2.position.set(-5, -5, 4);
    scene.add(pointLight2);

    // 4. Background Starfield / Particle Dust
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 24;
      particlePositions[i + 1] = (Math.random() - 0.5) * 24;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.065,
      transparent: true,
      opacity: 0.65,
    });
    const starField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(starField);

    // 5. Build Mindmap Nodes (Apple Watch Style Liquid Glass Spheres)
    const nodeMeshes = new Map<string, THREE.Group>();
    nodeMeshesRef.current = nodeMeshes;

    // Canvas texture generator for crisp labels
    const createNodeSprite = (node: MindmapNodeData) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Background pill for readability
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.roundRect(16, 20, 480, 216, 32);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = node.color;
      ctx.stroke();

      // Badge
      ctx.fillStyle = node.accentColor;
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.badge, 256, 64);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px system-ui, sans-serif';
      ctx.fillText(node.label, 256, 128);

      // Subtitle / Page
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillText(node.page + ' · ' + node.subTitle, 256, 184);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.8, 0.9, 1);
      sprite.position.set(0, -0.9, 0.1);
      return sprite;
    };

    TRADING_MINDMAP_DATA.forEach((node) => {
      const group = new THREE.Group();
      group.position.set(node.position[0], node.position[1], node.position[2]);
      group.userData = { id: node.id, nodeData: node, baseScale: node.id === 'hub' ? 1.25 : 1.0 };

      // Outer Translucent Liquid Glass Sphere
      const sphereGeo = new THREE.SphereGeometry(node.id === 'hub' ? 0.65 : 0.52, 32, 32);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.25,
        roughness: 0.12,
        metalness: 0.1,
        transmission: 0.75,
        transparent: true,
        opacity: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const glassMesh = new THREE.Mesh(sphereGeo, glassMat);
      group.add(glassMesh);

      // Inner Glowing Core
      const coreGeo = new THREE.SphereGeometry(node.id === 'hub' ? 0.38 : 0.28, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.accentColor),
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // Rotating Outer Orbit Ring
      const ringGeo = new THREE.TorusGeometry(node.id === 'hub' ? 0.85 : 0.7, 0.02, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.5;
      ringMesh.userData = { isRing: true };
      group.add(ringMesh);

      // 2D Text label sprite attached right under sphere
      const labelSprite = createNodeSprite(node);
      group.add(labelSprite);

      scene.add(group);
      nodeMeshes.set(node.id, group);
    });

    // 6. Directed Energy Links (Spline Curves with Photons)
    const curvePointsList: THREE.CatmullRomCurve3[] = [];
    MINDMAP_EDGES.forEach(([sourceId, targetId]) => {
      const sourceMesh = nodeMeshes.get(sourceId);
      const targetMesh = nodeMeshes.get(targetId);
      if (!sourceMesh || !targetMesh) return;

      const p1 = sourceMesh.position;
      const p2 = targetMesh.position;
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      // Elevate mid slightly in Z for a subtle 3D arc
      mid.z += 0.35;

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      curvePointsList.push(curve);

      // Draw the tube/line
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.018, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.35,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
    });

    // 7. Raycaster for clicks & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = (e.clientX - previousPointerPosRef.current.x) * 0.007;
        const deltaY = (e.clientY - previousPointerPosRef.current.y) * 0.007;

        targetWorldPanRef.current.x += deltaX;
        targetWorldPanRef.current.y -= deltaY;

        // Bound panning so the constellation never disappears
        targetWorldPanRef.current.x = Math.max(-3.5, Math.min(3.5, targetWorldPanRef.current.x));
        targetWorldPanRef.current.y = Math.max(-3.0, Math.min(3.0, targetWorldPanRef.current.y));

        previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast hover check
        raycaster.setFromCamera(mouse, camera);
        const clickableSpheres: THREE.Object3D[] = [];
        nodeMeshes.forEach((grp) => {
          grp.children.forEach((child) => {
            if (child instanceof THREE.Mesh) clickableSpheres.push(child);
          });
        });

        const intersects = raycaster.intersectObjects(clickableSpheres, false);
        if (intersects.length > 0) {
          const topParent = intersects[0].object.parent;
          if (topParent && topParent.userData.id) {
            setHoveredNodeId(topParent.userData.id);
            renderer.domElement.style.cursor = 'pointer';
          }
        } else {
          setHoveredNodeId(null);
          renderer.domElement.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        const distMoved = Math.hypot(
          e.clientX - previousPointerPosRef.current.x,
          e.clientY - previousPointerPosRef.current.y
        );
        isDraggingRef.current = false;

        // If it was a quick click rather than a pan
        if (distMoved < 5) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const clickableSpheres: THREE.Object3D[] = [];
          nodeMeshes.forEach((grp) => {
            grp.children.forEach((child) => {
              if (child instanceof THREE.Mesh) clickableSpheres.push(child);
            });
          });

          const intersects = raycaster.intersectObjects(clickableSpheres, false);
          if (intersects.length > 0) {
            const topParent = intersects[0].object.parent;
            if (topParent && topParent.userData.nodeData) {
              playClickSound();
              focusOnNode(topParent.userData.nodeData);
            }
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 8. Animation & Render Loop with Apple Watch Springboard Math
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gently rotate starfield
      starField.rotation.y = elapsedTime * 0.02;
      starField.rotation.x = elapsedTime * 0.01;

      // Smooth pan lerping
      worldPanRef.current.lerp(targetWorldPanRef.current, 0.08);

      // Smooth camera position & lookAt lerping
      currentCamPosRef.current.lerp(targetCamPosRef.current, 0.06);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);
      camera.position.copy(currentCamPosRef.current);
      camera.lookAt(currentLookAtRef.current);

      // APPLE WATCH SPRINGBOARD MATH:
      // Elements closer to the center of the screen magnify and bulge forward!
      const screenCenter = new THREE.Vector2(0, 0);
      const maxEffectRadius = 2.6; // radius of influence

      nodeMeshes.forEach((group) => {
        const basePos = group.userData.nodeData.position;
        const baseScale = group.userData.baseScale;

        // Current effective position considering world pan
        const effectiveX = basePos[0] + worldPanRef.current.x;
        const effectiveY = basePos[1] + worldPanRef.current.y;
        const distFromCenter = Math.hypot(effectiveX, effectiveY);

        // Center proximity factor between 0 (far) and 1 (dead center)
        const centerFactor = Math.max(0, 1 - distFromCenter / maxEffectRadius);

        // Bulge scale: expands up to +65% at center
        const targetScale = baseScale * (1 + 0.65 * centerFactor);
        group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.1));

        // Elevate Z forward when close to center for 3D dome effect
        const targetZ = basePos[2] + centerFactor * 0.85;
        group.position.set(effectiveX, effectiveY, THREE.MathUtils.lerp(group.position.z, targetZ, 0.1));

        // Rotate rings slowly
        group.children.forEach((child) => {
          if (child.userData.isRing) {
            child.rotation.z = elapsedTime * 0.6;
          }
        });
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth || 360;
      const newHeight = Math.max(480, container.clientHeight || 560);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      // Memory cleanup
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      scene.clear();
    };
  }, []);

  // Zoom camera directly to a selected node
  const focusOnNode = useCallback((node: MindmapNodeData) => {
    setSelectedNode(node);
    // Smooth camera glide: move camera close to the node
    const pos = node.position;
    targetCamPosRef.current.set(pos[0], pos[1], pos[2] + 2.8);
    targetLookAtRef.current.set(pos[0], pos[1], pos[2]);
  }, []);

  // Reset camera view back to full orbit
  const resetOrbitView = useCallback(() => {
    setSelectedNode(null);
    targetCamPosRef.current.set(0, 0, 7.8);
    targetLookAtRef.current.set(0, 0, 0);
    targetWorldPanRef.current.set(0, 0);
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    playClickSound();
    const factor = direction === 'in' ? -1.2 : 1.2;
    targetCamPosRef.current.z = Math.max(3.5, Math.min(12, targetCamPosRef.current.z + factor));
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#070A11] border border-indigo-950/70 shadow-2xl min-h-[560px] flex flex-col font-sans select-none">
      {/* 3D Canvas Mounting Point */}
      <div
        ref={mountRef}
        className="w-full flex-1 min-h-[540px] cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Floating Controls & Info Overlay */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#151B2B]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-indigo-900/60 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-black text-white tracking-wide">
              Univers Trading 3D
            </h3>
            <span className="text-[10px] text-indigo-300 font-medium block">
              Effet Apple Watch · Glissez & Touchez
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#151B2B]/90 backdrop-blur-md p-1.5 rounded-2xl border border-indigo-900/60 shadow-lg">
          <button
            onClick={() => handleZoom('in')}
            title="Zoom avant"
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleZoom('out')}
            title="Zoom arrière"
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={resetOrbitView}
            title="Recentrer l'orbite"
            className="w-8 h-8 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white flex items-center justify-center transition-colors border border-indigo-500/40"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Quick Node Picker */}
      <div className="absolute bottom-3 inset-x-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#151B2B]/90 backdrop-blur-md p-2.5 rounded-2xl border border-indigo-900/60 shadow-xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 pl-1 uppercase tracking-wider shrink-0">
            Stations :
          </span>

          {TRADING_MINDMAP_DATA.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                playClickSound();
                focusOnNode(node);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                hoveredNodeId === node.id || selectedNode?.id === node.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span>{node.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zoomed-in Chapter Sheet Overlay */}
      {selectedNode && (
        <TradingChapterSheet
          node={selectedNode}
          onClose={resetOrbitView}
          onSelectNode={(nodeId) => {
            const found = TRADING_MINDMAP_DATA.find((n) => n.id === nodeId);
            if (found) focusOnNode(found);
          }}
          allNodes={TRADING_MINDMAP_DATA}
        />
      )}
    </div>
  );
};
