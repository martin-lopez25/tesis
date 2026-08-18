import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

interface ParticleData {
  velocity: THREE.Vector3;
  life: number;
  decay: number;
}

type ParticleView = 'neutron' | 'uranio' | 'bario' | 'kripton';

const PARTICLE_VIEWS: Array<{ id: ParticleView; label: string; title: string }> = [
  { id: 'neutron', label: 'N', title: 'Neutron' },
  { id: 'uranio', label: 'U-235', title: 'Uranio-235' },
  { id: 'bario', label: 'Ba-141', title: 'Bario-141' },
  { id: 'kripton', label: 'Kr-92', title: 'Kripton-92' },
];

export default function Simulation3DSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [simulationMode, setSimulationMode] = useState<'reactor' | 'particulas'>('reactor');
  const [particleView, setParticleView] = useState<ParticleView>('neutron');
  const [atomCount, setAtomCount] = useState(150);
  const [neutronCount, setNeutronCount] = useState(0);
  const [fissionCount, setFissionCount] = useState(0);
  const [totalEnergyMeV, setTotalEnergyMeV] = useState(0);
  const [chainActive, setChainActive] = useState(false);

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    atoms: THREE.Group[];
    neutrons: THREE.Mesh[];
    fragments: THREE.Group[];
    energyParticles: THREE.Mesh[];
    demoGroup: THREE.Group | null;
    discTexture: THREE.Texture;
    fissionCount: number;
    totalEnergy: number;
    chainInterval: any;
    animId: number;
  } | null>(null);

  const ENERGY_PER_FISSION = 200;
  const NEUTRON_SPEED = 0.35;
  const FISSION_RADIUS = 1.3;

  // Create radial disc particle texture for glowing electron clouds
  const createDiscTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Exact shell generator from notebook
  const createShell = (count: number, radius: number, color: number, discTexture: THREE.Texture) => {
    const pos: number[] = [];
    const col: number[] = [];
    const pointCount = Math.min(count * 6, 120);

    for (let i = 0; i < pointCount; i++) {
      const r = radius + (Math.random() - 0.5) * 0.3;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      pos.push(x, y, z);

      const c = new THREE.Color(color);
      const fade = 0.4 + Math.random() * 0.6;
      col.push(c.r * fade, c.g * fade, c.b * fade);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.07,
      map: discTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  };

  // Exact Uranium-235 atom with 7 quantum shells from notebook
  const createAtom = (position: THREE.Vector3, discTexture: THREE.Texture, color = 0xff4466) => {
    const group = new THREE.Group();
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: 0x331100,
        emissiveIntensity: 0.15,
        metalness: 0.7,
        roughness: 0.3,
      })
    );
    nucleus.castShadow = true;
    group.add(nucleus);

    const shells = [
      { n: 2, r: 1.0, color: 0xff6688 },
      { n: 8, r: 1.6, color: 0xff7799 },
      { n: 18, r: 2.3, color: 0xff88aa },
      { n: 32, r: 3.0, color: 0xff99bb },
      { n: 21, r: 3.8, color: 0xffaacc },
      { n: 9, r: 4.7, color: 0xffbbdd },
      { n: 2, r: 5.6, color: 0xffccee },
    ];

    const clouds: THREE.Points[] = [];
    shells.forEach((s) => {
      const c = createShell(s.n, s.r, s.color, discTexture);
      group.add(c);
      clouds.push(c);
    });

    group.userData = { clouds, type: 'uranium' };
    group.position.copy(position);
    return group;
  };

  const createFragmentAtom = (
    position: THREE.Vector3,
    discTexture: THREE.Texture,
    color: number,
    shellColor: number,
    radius: number,
    shells: Array<{ n: number; r: number }>
  ) => {
    const group = new THREE.Group();
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 28, 28),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.18,
        metalness: 0.45,
        roughness: 0.35,
      })
    );
    group.add(nucleus);
    const clouds: THREE.Points[] = [];
    shells.forEach((shell, i) => {
      const cloud = createShell(shell.n, shell.r, shellColor + i * 0x000909, discTexture);
      group.add(cloud);
      clouds.push(cloud);
    });
    group.userData = { clouds, type: 'fragment' };
    group.position.copy(position);
    return group;
  };

  const createStaticNeutron = (position: THREE.Vector3, scale = 1) => {
    const neutron = new THREE.Mesh(
      new THREE.SphereGeometry(0.28 * scale, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffdd99,
        emissive: 0xff8844,
        emissiveIntensity: 0.85,
      })
    );
    neutron.position.copy(position);
    return neutron;
  };

  const clearSceneObjects = () => {
    const t = threeRef.current;
    if (!t) return;
    if (t.chainInterval) {
      clearInterval(t.chainInterval);
      t.chainInterval = null;
    }
    if (t.demoGroup) {
      t.scene.remove(t.demoGroup);
      t.demoGroup = null;
    }
    t.neutrons.forEach((n) => t.scene.remove(n));
    t.fragments.forEach((f) => t.scene.remove(f));
    t.energyParticles.forEach((p) => t.scene.remove(p));
    t.atoms.forEach((a) => t.scene.remove(a));
    t.atoms = [];
    t.neutrons = [];
    t.fragments = [];
    t.energyParticles = [];
    t.fissionCount = 0;
    t.totalEnergy = 0;
    setChainActive(false);
  };

  const createParticleView = (view: ParticleView) => {
    const t = threeRef.current;
    if (!t) return;
    clearSceneObjects();

    const group = new THREE.Group();
    const discTexture = t.discTexture;

    const uranium = createAtom(new THREE.Vector3(0, 0, 0), discTexture);
    uranium.scale.setScalar(0.62);
    const barium = createFragmentAtom(
      new THREE.Vector3(0, 0, 0),
      discTexture,
      0x66cc99,
      0x88ffaa,
      0.48,
      [
        { n: 2, r: 0.8 },
        { n: 8, r: 1.25 },
        { n: 18, r: 1.75 },
        { n: 18, r: 2.3 },
        { n: 8, r: 2.9 },
        { n: 2, r: 3.5 },
      ]
    );
    const krypton = createFragmentAtom(
      new THREE.Vector3(0, 0, 0),
      discTexture,
      0xff9966,
      0xffaa88,
      0.38,
      [
        { n: 2, r: 0.7 },
        { n: 8, r: 1.1 },
        { n: 18, r: 1.6 },
        { n: 8, r: 2.1 },
      ]
    );

    if (view === 'neutron') group.add(createStaticNeutron(new THREE.Vector3(0, 0, 0), 2.2));
    if (view === 'uranio') group.add(uranium);
    if (view === 'bario') group.add(barium);
    if (view === 'kripton') group.add(krypton);

    t.scene.add(group);
    t.demoGroup = group;
    updateUI();
  };

  // Exact 150 Atoms Initial Setup
  const createInitialAtoms = (discTexture: THREE.Texture) => {
    const t = threeRef.current;
    if (!t) return;

    t.atoms.forEach((atom) => t.scene.remove(atom));
    t.atoms = [];
    const positions: THREE.Vector3[] = [];
    const radius = 14;

    for (let i = 0; i < 150; i++) {
      let x = 0,
        y = 0,
        z = 0,
        d = 0;
      do {
        x = (Math.random() - 0.5) * radius * 2;
        y = (Math.random() - 0.5) * radius * 1.5;
        z = (Math.random() - 0.5) * radius * 2;
        d = Math.sqrt(x * x + y * y + z * z);
      } while (d > radius);
      positions.push(new THREE.Vector3(x, y, z));
    }

    positions.forEach((pos) => {
      const a = createAtom(pos, discTexture);
      t.scene.add(a);
      t.atoms.push(a);
    });

    t.fissionCount = 0;
    t.totalEnergy = 0;
    updateUI();
  };

  const updateUI = () => {
    const t = threeRef.current;
    if (!t) return;
    setAtomCount(t.atoms.length);
    setNeutronCount(t.neutrons.length);
    setFissionCount(t.fissionCount);
    setTotalEnergyMeV(t.totalEnergy);
  };

  const createNeutron = (position: THREE.Vector3, direction: THREE.Vector3, speed = NEUTRON_SPEED) => {
    const t = threeRef.current;
    if (!t) return;

    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffdd99,
        emissive: 0xff8844,
        emissiveIntensity: 0.8,
      })
    );
    m.position.copy(position);
    m.castShadow = true;
    m.userData = { velocity: direction.clone().normalize().multiplyScalar(speed) };
    t.scene.add(m);
    t.neutrons.push(m);
    updateUI();
  };

  const fission = (atom: THREE.Group, neutronPosition: THREE.Vector3, discTexture: THREE.Texture) => {
    const t = threeRef.current;
    if (!t) return;

    const atomPos = atom.position.clone();
    t.scene.remove(atom);
    const idx = t.atoms.indexOf(atom);
    if (idx !== -1) t.atoms.splice(idx, 1);
    t.fissionCount += 1;
    t.totalEnergy += ENERGY_PER_FISSION;
    updateUI();

    // Barium fragment with 6 shells
    const bariumGroup = new THREE.Group();
    const baNuc = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x66cc99,
        emissive: 0x226644,
        emissiveIntensity: 0.25,
      })
    );
    bariumGroup.add(baNuc);
    const baShells = [
      { n: 2, r: 0.8, c: 0x88ffaa },
      { n: 8, r: 1.25, c: 0xaaffcc },
      { n: 18, r: 1.75, c: 0xccffdd },
      { n: 18, r: 2.3, c: 0xddffee },
      { n: 8, r: 2.9, c: 0xeeffff },
      { n: 2, r: 3.5, c: 0xaaffff },
    ];
    baShells.forEach((s) => bariumGroup.add(createShell(s.n, s.r, s.c, discTexture)));

    // Krypton fragment with 4 shells
    const kryptonGroup = new THREE.Group();
    const krNuc = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xff9966,
        emissive: 0x442200,
        emissiveIntensity: 0.25,
      })
    );
    kryptonGroup.add(krNuc);
    const krShells = [
      { n: 2, r: 0.7, c: 0xffaa88 },
      { n: 8, r: 1.1, c: 0xffbb99 },
      { n: 18, r: 1.6, c: 0xffccaa },
      { n: 8, r: 2.1, c: 0xffddbb },
    ];
    krShells.forEach((s) => kryptonGroup.add(createShell(s.n, s.r, s.c, discTexture)));

    const dir = neutronPosition.clone().sub(atomPos).normalize();
    bariumGroup.position.copy(atomPos.clone().add(dir.clone().multiplyScalar(1.5)));
    kryptonGroup.position.copy(atomPos.clone().add(dir.clone().multiplyScalar(-1.5)));
    bariumGroup.userData = { velocity: dir.clone().multiplyScalar(0.06) };
    kryptonGroup.userData = { velocity: dir.clone().multiplyScalar(-0.06) };
    t.scene.add(bariumGroup);
    t.scene.add(kryptonGroup);
    t.fragments.push(bariumGroup, kryptonGroup);

    // 2-3 Prompt Neutrons
    const nCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < nCount; i++) {
      const rd = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      createNeutron(atomPos, rd, NEUTRON_SPEED * (chainActive ? 1.15 : 1.0));
    }

    // 60 Energy Particles (200 MeV)
    for (let i = 0; i < 60; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({
          color: [0xffaa44, 0xff6644, 0xffaa88][Math.floor(Math.random() * 3)],
          transparent: true,
          blending: THREE.AdditiveBlending,
        })
      );
      p.position.copy(atomPos);
      const a1 = Math.random() * Math.PI * 2;
      const a2 = Math.random() * Math.PI * 2;
      const sp = 0.12 + Math.random() * 0.18;
      p.userData = {
        velocity: new THREE.Vector3(
          Math.sin(a1) * Math.cos(a2) * sp,
          Math.sin(a1) * Math.sin(a2) * sp,
          Math.cos(a1) * sp
        ),
        life: 1.0,
        decay: 0.012,
      } as ParticleData;
      t.scene.add(p);
      t.energyParticles.push(p);
    }

    // Point Light Flash Explosion
    const explLight = new THREE.PointLight(0xff8844, 2.0, 20);
    explLight.position.copy(atomPos);
    t.scene.add(explLight);
    let intensity = 2.0;
    const li = setInterval(() => {
      intensity -= 0.25;
      explLight.intensity = intensity;
      if (intensity <= 0) {
        clearInterval(li);
        t.scene.remove(explLight);
      }
    }, 35);
  };

  const handleFireNeutron = () => {
    const t = threeRef.current;
    if (!t) return;
    if (t.atoms.length === 0) {
      alert('No quedan átomos de Uranio. Presiona Reiniciar.');
      return;
    }
    const start = new THREE.Vector3(0, 5, 28);
    const target = t.atoms[Math.floor(Math.random() * t.atoms.length)].position;
    createNeutron(start, new THREE.Vector3().subVectors(target, start));
  };

  const handleToggleChain = (discTexture: THREE.Texture) => {
    const t = threeRef.current;
    if (!t) return;

    if (chainActive) {
      setChainActive(false);
      if (t.chainInterval) {
        clearInterval(t.chainInterval);
        t.chainInterval = null;
      }
    } else {
      setChainActive(true);
      if (t.atoms.length === 0) createInitialAtoms(discTexture);

      if (t.atoms.length > 0 && t.neutrons.length === 0) {
        const start = new THREE.Vector3(0, 5, 25);
        const target = t.atoms[Math.floor(Math.random() * t.atoms.length)].position;
        createNeutron(start, new THREE.Vector3().subVectors(target, start), NEUTRON_SPEED * 1.2);
      }

      t.chainInterval = setInterval(() => {
        if (t.atoms.length > 0 && t.neutrons.length < 10) {
          const ra = t.atoms[Math.floor(Math.random() * t.atoms.length)];
          const start = new THREE.Vector3(
            ra.position.x + (Math.random() - 0.5) * 8,
            ra.position.y + (Math.random() - 0.5) * 6 + 6,
            ra.position.z + (Math.random() - 0.5) * 8 + 18
          );
          createNeutron(start, new THREE.Vector3().subVectors(ra.position, start), NEUTRON_SPEED * 1.25);
        }
        if (t.atoms.length === 0) {
          if (t.chainInterval) clearInterval(t.chainInterval);
          t.chainInterval = null;
          setChainActive(false);
        }
      }, 1000);
    }
  };

  const handleReset = (discTexture: THREE.Texture) => {
    const t = threeRef.current;
    if (!t) return;
    setChainActive(false);
    if (t.chainInterval) {
      clearInterval(t.chainInterval);
      t.chainInterval = null;
    }
    t.neutrons.forEach((n) => t.scene.remove(n));
    t.fragments.forEach((f) => t.scene.remove(f));
    t.energyParticles.forEach((p) => t.scene.remove(p));
    t.atoms.forEach((a) => t.scene.remove(a));
    if (t.demoGroup) {
      t.scene.remove(t.demoGroup);
      t.demoGroup = null;
    }
    t.neutrons = [];
    t.fragments = [];
    t.energyParticles = [];
    createInitialAtoms(discTexture);
    updateUI();
  };

  // Setup Three.js scene exactly matching HTML_FISION from notebook
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // Exact Dark Navy/Black Space Scene from Notebook (0x101018)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101018);
    // Para AR, el fondo debe ser transparente
    const isARSupported = 'xr' in navigator;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(25, 20, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true; // Habilitar XR

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    if (isARSupported) {
      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: container }
      });
      arButton.style.bottom = '80px'; // Ajustar posición para no tapar otros controles
      container.appendChild(arButton);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.target.set(0, 0, 0);

    // Exact Lights from Notebook
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    const backLight = new THREE.PointLight(0x4466ff, 0.3);
    backLight.position.set(-5, 0, -5);
    scene.add(backLight);
    const fillLight = new THREE.PointLight(0xffaa66, 0.25);
    fillLight.position.set(3, 5, 4);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xff66aa, 0.2);
    rimLight.position.set(-3, 4, -4);
    scene.add(rimLight);

    const discTex = createDiscTexture();

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      atoms: [],
      neutrons: [],
      fragments: [],
      energyParticles: [],
      demoGroup: null,
      discTexture: discTex,
      fissionCount: 0,
      totalEnergy: 0,
      chainInterval: null,
      animId: 0,
    };

    createInitialAtoms(discTex);

    // Animation Loop matching notebook
    const animate = () => {
      const t = threeRef.current;
      if (!t) return;

      // En modo AR, ocultar el fondo sólido
      if (renderer.xr.isPresenting) {
        scene.background = null;
      } else {
        scene.background = new THREE.Color(0x101018);
      }

      // Rotate electron orbital clouds
      t.atoms.forEach((atom) => {
        if (atom.userData && atom.userData.clouds) {
          atom.userData.clouds.forEach((c: THREE.Points, i: number) => {
            c.rotation.y += 0.0008 * (i + 1);
            c.rotation.x += 0.0005 * (i + 1);
          });
        }
      });

      if (t.demoGroup) {
        t.demoGroup.rotation.y += 0.004;
        t.demoGroup.children.forEach((child) => {
          if (child.userData && child.userData.clouds) {
            child.userData.clouds.forEach((cloud: THREE.Points, i: number) => {
              cloud.rotation.y += 0.002 * (i + 1);
              cloud.rotation.x += 0.0012 * (i + 1);
            });
          }
        });
      }

      // Move fragments
      for (let i = t.fragments.length - 1; i >= 0; i--) {
        const f = t.fragments[i];
        if (f.userData && f.userData.velocity) {
          f.position.add(f.userData.velocity);
          f.children.forEach((c: any) => {
            if (c.isPoints) {
              c.rotation.y += 0.015;
              c.rotation.x += 0.01;
            }
          });
        }
        if (
          Math.abs(f.position.x) > 35 ||
          Math.abs(f.position.y) > 25 ||
          Math.abs(f.position.z) > 35
        ) {
          t.scene.remove(f);
          t.fragments.splice(i, 1);
        }
      }

      // Move energy particles
      for (let i = t.energyParticles.length - 1; i >= 0; i--) {
        const p = t.energyParticles[i];
        const data = p.userData as ParticleData;
        p.position.add(data.velocity);
        data.life -= data.decay;
        const s = data.life * 0.8;
        p.scale.set(s, s, s);
        (p.material as THREE.Material).opacity = data.life;
        if (data.life <= 0) {
          t.scene.remove(p);
          t.energyParticles.splice(i, 1);
        }
      }

      // Move neutrons and test collision with atoms
      for (let i = t.neutrons.length - 1; i >= 0; i--) {
        const n = t.neutrons[i];
        n.position.add(n.userData.velocity);
        (n.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.5 + Math.sin(Date.now() * 0.02) * 0.5;

        let hit = false;
        for (let j = 0; j < t.atoms.length; j++) {
          const a = t.atoms[j];
          if (a && n.position.distanceTo(a.position) < FISSION_RADIUS) {
            fission(a, n.position, discTex);
            t.scene.remove(n);
            t.neutrons.splice(i, 1);
            hit = true;
            break;
          }
        }

        if (
          !hit &&
          (Math.abs(n.position.x) > 45 ||
            Math.abs(n.position.y) > 35 ||
            Math.abs(n.position.z) > 45)
        ) {
          t.scene.remove(n);
          t.neutrons.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current) {
        threeRef.current.renderer.setAnimationLoop(null);
        if (threeRef.current.chainInterval) clearInterval(threeRef.current.chainInterval);
      }
    };
  }, []);

  useEffect(() => {
    const t = threeRef.current;
    if (!t) return;
    if (simulationMode === 'particulas') {
      createParticleView(particleView);
      t.camera.position.set(0, 4.8, 10.5);
      t.controls.target.set(0, 0, 0);
    } else {
      clearSceneObjects();
      createInitialAtoms(t.discTexture);
      t.camera.position.set(25, 20, 32);
      t.controls.target.set(0, 0, 0);
    }
    t.controls.update();
  }, [simulationMode, particleView]);

  return (
    <div className="relative min-h-[520px] w-full overflow-hidden rounded-2xl border border-[#1e293b] bg-[#101018] sm:min-h-[580px]">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="h-[520px] w-full cursor-grab active:cursor-grabbing sm:h-[580px]" />

      <div className="absolute left-3 top-3 z-30 flex rounded-full border border-white/15 bg-[#101018]/90 p-1 font-display text-[10px] font-bold uppercase tracking-wider backdrop-blur-md sm:left-4 sm:top-4">
        <button
          onClick={() => setSimulationMode('reactor')}
          className={`rounded-full px-3 py-1.5 ${simulationMode === 'reactor' ? 'bg-cyan-400 text-[#101018]' : 'text-cyan-200'}`}
        >
          Reactor
        </button>
        <button
          onClick={() => setSimulationMode('particulas')}
          className={`rounded-full px-3 py-1.5 ${simulationMode === 'particulas' ? 'bg-amber-300 text-[#101018]' : 'text-amber-100'}`}
        >
          Particulas
        </button>
      </div>

      {/* Top Left Controls Bar (Exact from Notebook) */}
      {simulationMode === 'reactor' ? (
      <div className="absolute bottom-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1.5 sm:bottom-auto sm:left-4 sm:top-16 sm:max-w-none sm:gap-2">
        <button
          onClick={handleFireNeutron}
          className="rounded-full border border-white/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 hover:border-cyan-400 hover:text-cyan-300 sm:px-4 sm:text-xs"
        >
          Disparar
        </button>
        <button
          onClick={() => handleReset(createDiscTexture())}
          className="rounded-full border border-white/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 hover:border-amber-400 hover:text-amber-300 sm:px-4 sm:text-xs"
        >
          Reiniciar
        </button>
        <button
          onClick={() => handleToggleChain(createDiscTexture())}
          className={`rounded-full border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-95 sm:px-4 sm:text-xs ${
            chainActive
              ? 'border-rose-500 bg-rose-950/80 text-rose-300 animate-pulse'
              : 'border-white/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white hover:border-emerald-400 hover:text-emerald-300'
          }`}
        >
          {chainActive ? 'Detener Cadena' : 'Cadena'}
        </button>
      </div>
      ) : (
      <div className="absolute bottom-3 left-3 right-3 z-20 flex max-h-24 flex-wrap items-center gap-1.5 overflow-y-auto rounded-2xl border border-white/10 bg-[#101018]/90 p-2 backdrop-blur-md sm:bottom-auto sm:left-4 sm:right-auto sm:top-16 sm:max-h-none sm:max-w-[620px] sm:gap-2">
        {PARTICLE_VIEWS.map((item) => (
          <button
            key={item.id}
            onClick={() => setParticleView(item.id)}
            className={`rounded-full border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider shadow-lg active:scale-95 sm:px-4 sm:text-xs ${
              particleView === item.id
                ? 'border-amber-300 bg-amber-300 text-[#101018]'
                : 'border-amber-400/40 bg-amber-950/50 text-amber-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      )}

      {/* Top Right Stats Panel (Exact from Notebook) */}
      <div className="absolute right-3 top-14 z-20 w-[152px] rounded-xl border border-white/10 bg-[#101018]/90 p-2.5 font-mono-tech text-[10px] text-right text-[#c8e8f0] backdrop-blur-md shadow-2xl sm:right-4 sm:top-4 sm:w-[200px] sm:rounded-2xl sm:p-4 sm:text-xs">
        {simulationMode === 'reactor' ? (
          <>
            <h3 className="mb-1 text-left font-display text-xs font-bold tracking-wider text-cyan-400 uppercase sm:mb-2 sm:text-sm">
              Reactor
            </h3>
            <p className="my-0.5 flex justify-between sm:my-1">
              <span>Uranio:</span>{' '}
              <strong className="text-xs text-rose-400 sm:text-base">{atomCount}</strong>
            </p>
            <p className="my-0.5 flex justify-between sm:my-1">
              <span>Neutrones:</span>{' '}
              <strong className="text-xs text-cyan-400 sm:text-base">{neutronCount}</strong>
            </p>
            <p className="my-0.5 flex justify-between sm:my-1">
              <span>Fisiones:</span>{' '}
              <strong className="text-xs text-amber-400 sm:text-base">{fissionCount}</strong>
            </p>
            <p className="my-0.5 flex justify-between sm:my-1">
              <span>Energia:</span>{' '}
              <strong className="text-xs text-emerald-400 sm:text-base">{totalEnergyMeV} MeV</strong>
            </p>
            {chainActive && (
              <div className="mt-1 rounded border border-rose-500/50 bg-rose-500/20 px-2 py-1 text-center font-bold text-rose-400 animate-pulse sm:mt-2">
                CADENA ACTIVA
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="mb-1 text-left font-display text-xs font-bold tracking-wider text-amber-300 uppercase sm:mb-2 sm:text-sm">
              Particula
            </h3>
            <p className="text-left text-[10px] leading-snug text-[#c8e8f0] sm:text-xs">
              {PARTICLE_VIEWS.find((item) => item.id === particleView)?.title}
            </p>
          </>
        )}
      </div>

      {/* Bottom Left Info Panel (Exact from Notebook) */}
      <div className="absolute bottom-16 right-3 z-20 max-w-[180px] rounded-xl border border-white/10 bg-[#101018]/90 p-2.5 font-mono-tech text-[10px] text-[#7a9ab0] backdrop-blur-md shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs sm:rounded-2xl sm:p-3.5 sm:text-xs">
        <h3 className="mb-1.5 font-display text-sm font-bold text-cyan-400">
          {simulationMode === 'reactor' ? 'Fisión Nuclear' : 'Vista por particula'}
        </h3>
        <p className="text-white font-bold text-[10px] sm:text-[11px]">n + U-235 → Ba-141 + Kr-92 + 2-3 n</p>
        <p className="mt-1 text-[10px] text-amber-300 sm:text-[11px]">
          {simulationMode === 'reactor' ? 'Energía: 200 MeV por fisión' : 'Cada pestaña muestra solo su particula o producto'}
        </p>
        <p className="mt-1 text-[9px] text-gray-400 sm:text-[10px]">Arrastrar: rotar | Scroll: zoom</p>
      </div>
    </div>
  );
}
