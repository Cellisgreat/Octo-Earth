// Display-only outer planets and selected major-moon markers for the solar-system overview.
// The main physics still supplies Mercury, Venus, Earth, Mars, Jupiter and the Earth–Moon states.
// Saturn/Uranus/Neptune and all moon systems returned here are schematic graphics, not ephemerides or dynamics.
import * as THREE from './vendor/three.module.js';
import { planetTexture, createPlanetAtmosphere } from './planetTextures.js';

const TAU = 2 * Math.PI;
export const DISPLAY_PLANET_SIZE_BOOST = 1.55; // overview marker-only enlargement; aAU/periodYears remain unchanged
const COLOR = {
  moon: 0xc8cbd2, mars: 0xffb18f, jupiter: 0xf0d0a4,
  saturn: 0xe3d0a0, uranus: 0xa8e3e5, neptune: 0x6e9cff,
};

const MARS_MOONS = [
  { name: 'Phobos', orbit: 0.55, radius: 0.045, periodDays: 0.319, color: 0xaaa29a },
  { name: 'Deimos', orbit: 0.82, radius: 0.038, periodDays: 1.263, color: 0xc9b9a4 },
];
const JUPITER_MOONS = [
  { name: 'Io', orbit: 0.74, radius: 0.075, periodDays: 1.769, color: 0xf2cf73 },
  { name: 'Europa', orbit: 0.96, radius: 0.068, periodDays: 3.551, color: 0xd9d2c6 },
  { name: 'Ganymede', orbit: 1.25, radius: 0.092, periodDays: 7.155, color: 0xc6b4a0 },
  { name: 'Callisto', orbit: 1.62, radius: 0.085, periodDays: 16.69, color: 0x93877e },
];
const OUTER_ORBIT_COLORS = { Saturn: 0x4fa3ff, Uranus: 0x60dfff, Neptune: 0xc084fc };

const OUTER = [
  {
    name: 'Saturn', surface: 'saturn', aAU: 9.58, periodYears: 29.457, phase: 0.82, inclination: 0.024, radius: 0.52, color: COLOR.saturn, atmosphere: { color: 0xffdfb2, strength: 0.14 },
    moons: [
      { name: 'Mimas', orbit: 1.02, radius: 0.040, periodDays: 0.94, color: 0xb9b7b2 },
      { name: 'Enceladus', orbit: 1.16, radius: 0.046, periodDays: 1.37, color: 0xe5e7e6 },
      { name: 'Tethys', orbit: 1.32, radius: 0.050, periodDays: 1.89, color: 0xcac9c5 },
      { name: 'Dione', orbit: 1.48, radius: 0.054, periodDays: 2.74, color: 0xd4cec3 },
      { name: 'Rhea', orbit: 1.68, radius: 0.065, periodDays: 4.52, color: 0xd8d3cc },
      { name: 'Titan', orbit: 2.00, radius: 0.105, periodDays: 15.95, color: 0xd69b50 },
      { name: 'Iapetus', orbit: 2.48, radius: 0.058, periodDays: 79.3, color: 0xb8aaa0 },
    ],
  },
  {
    name: 'Uranus', surface: 'uranus', aAU: 19.20, periodYears: 84.016, phase: 2.47, inclination: 0.013, radius: 0.34, color: COLOR.uranus, atmosphere: { color: 0x9be9ef, strength: 0.18 },
    moons: [
      { name: 'Miranda', orbit: 0.66, radius: 0.040, periodDays: 1.41, color: 0xbabac0 },
      { name: 'Ariel', orbit: 0.84, radius: 0.050, periodDays: 2.52, color: 0xd6d1c8 },
      { name: 'Umbriel', orbit: 1.02, radius: 0.052, periodDays: 4.14, color: 0x99999c },
      { name: 'Titania', orbit: 1.24, radius: 0.070, periodDays: 8.71, color: 0xb9b2a9 },
      { name: 'Oberon', orbit: 1.48, radius: 0.068, periodDays: 13.46, color: 0xa79b90 },
    ],
  },
  {
    name: 'Neptune', surface: 'neptune', aAU: 30.05, periodYears: 164.8, phase: 4.03, inclination: 0.031, radius: 0.37, color: COLOR.neptune, atmosphere: { color: 0x76b8ff, strength: 0.20 },
    moons: [{ name: 'Triton', orbit: 0.88, radius: 0.080, periodDays: 5.88, color: 0xc8c8cc }],
  },
];

function markFocusable(object, name, radius) {
  object.userData.focusName = name;
  object.userData.focusRadius = radius;
  object.userData.displayOnly = true;
  return object;
}

function orbitCircle(radius, color = 0x99abc5, opacity = 0.34, segments = 96) {
  const points = [];
  for (let i = 0; i < segments; i++) {
    const a = i / segments * TAU;
    points.push(new THREE.Vector3(radius * Math.cos(a), radius * Math.sin(a), 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  line.frustumCulled = false;
  return line;
}

/** Create a clearly schematic, display-only set of major-moon markers around one host body. */
export function createMajorMoonSystem(parent, host, entries, label, options = {}) {
  const group = new THREE.Group();
  group.name = `${label} selected major-moon display (schematic)`;
  group.userData.displayOnly = true;
  parent.add(group);
  const orbitColor = options.orbitColor || 0x65cfff;
  const items = entries.map((d, i) => {
    const orbit = orbitCircle(d.orbit, orbitColor, options.orbitOpacity ?? 0.36, 64);
    orbit.name = `${d.name} schematic orbit`;
    group.add(orbit);
    const material = new THREE.MeshStandardMaterial({
      map: planetTexture('moon'), color: d.color || COLOR.moon,
      emissive: new THREE.Color(d.color || COLOR.moon).multiplyScalar(0.012),
      roughness: 0.94, metalness: 0.01,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(d.radius, 16, 10), material);
    mesh.name = `${d.name} (display-only moon marker)`;
    markFocusable(mesh, d.name, d.radius);
    group.add(mesh);
    return { ...d, mesh, orbitLine: orbit, phase: (d.phase ?? (i * 1.91 + 0.34)), tilt: (i % 2 ? 1 : -1) * (0.025 + 0.018 * (i % 3)) };
  });
  const world = new THREE.Vector3();

  function update(tYears = 0, enabled = true, showOrbits = true) {
    if (!host || !host.parent) { group.visible = false; return; }
    host.getWorldPosition(world);
    group.position.copy(world);
    let hostVisible = true;
    for (let node = host; node; node = node.parent) if (!node.visible) { hostVisible = false; break; }
    group.visible = !!enabled && hostVisible;
    if (!group.visible) return;
    const days = (Number.isFinite(tYears) ? tYears : 0) * 365.256;
    for (const item of items) {
      const period = Math.max(0.05, item.periodDays || 10);
      const a = item.phase + TAU * ((days % period) / period);
      item.mesh.position.set(item.orbit * Math.cos(a), item.orbit * Math.sin(a), item.orbit * item.tilt * Math.sin(a * 0.43));
      item.orbitLine.visible = !!showOrbits;
    }
  }
  const targets = items.map((m) => ({ name: m.name, object: m.mesh, radius: m.radius, kind: 'decorative moon' }));
  return { group, items, targets, update };
}

/**
 * Add Saturn, Uranus and Neptune with selected major moons. Their circular orbit phase uses the displayed mission
 * year only as an animation clock; it is not the simulated planetary state or a precision ephemeris.
 */
export function createOuterPlanets(scene, sceneUnitsPerAU = 10) {
  const root = new THREE.Group();
  root.name = 'decorative outer planets and selected major moons';
  root.userData.displayOnly = true;
  scene.add(root);
  const planets = [];
  const targets = [];
  for (const def of OUTER) {
    const orbit = orbitCircle(def.aAU * sceneUnitsPerAU, OUTER_ORBIT_COLORS[def.name] || 0x99abc5, 0.46, 192);
    orbit.name = `${def.name} schematic solar orbit`;
    root.add(orbit);
    const host = new THREE.Group();
    host.name = `${def.name} (display-only schematic planet)`;
    root.add(host);
    const viewRadius = def.radius * DISPLAY_PLANET_SIZE_BOOST;
    const material = new THREE.MeshStandardMaterial({
      map: planetTexture(def.surface), color: 0xffffff,
      emissive: new THREE.Color(def.color).multiplyScalar(0.006),
      roughness: 0.88,
      metalness: 0.01,
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(viewRadius, 48, 32), material);
    body.name = `${def.name} (display-only marker, enlarged ${DISPLAY_PLANET_SIZE_BOOST.toFixed(2)}x)`;
    markFocusable(body, def.name, viewRadius);
    host.add(body);
    body.add(createPlanetAtmosphere(viewRadius, def.atmosphere.color, def.atmosphere.strength));
    if (def.name === 'Saturn') {
      // Broad, separated ring bands suggest the brighter A/B rings, dark Cassini gap and faint outer ring.
      const bands = [
        [1.24, 1.38, 0x978d7a, 0.30], [1.39, 1.94, 0xd2c7ae, 0.62],
        [1.95, 2.00, 0x746d61, 0.22], [2.01, 2.27, 0xbdb5a6, 0.48],
        [2.30, 2.34, 0xd5cbb4, 0.30],
      ];
      for (const [ri, ro, color, opacity] of bands) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(viewRadius * ri, viewRadius * ro, 192),
          new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide,
            transparent: true, opacity, depthWrite: false }));
        ring.rotation.x = 0.13; ring.name = 'Saturn illustrative ring band'; host.add(ring);
      }
    } else if (def.name === 'Uranus') {
      const ring = new THREE.Mesh(new THREE.RingGeometry(viewRadius * 1.48, viewRadius * 1.58, 128),
        new THREE.MeshStandardMaterial({ color: 0x85999a, roughness: 0.88, metalness: 0.02,
          side: THREE.DoubleSide, transparent: true, opacity: 0.28, depthWrite: false }));
      ring.rotation.set(1.12, 0.16, 0.08); ring.name = 'Uranus faint schematic ring'; host.add(ring);
    }
    const moonSystem = createMajorMoonSystem(root, host, def.moons, def.name, { orbitOpacity: 0.36 });
    planets.push({ def, host, body, orbit, moonSystem });
    targets.push({ name: def.name, object: body, radius: viewRadius, kind: 'decorative planet' }, ...moonSystem.targets);
  }

  function update(tYears = 0, visible = true, showOrbits = true) {
    root.visible = !!visible;
    const t = Number.isFinite(tYears) ? tYears : 0;
    for (const item of planets) {
      const { def, host, body, orbit, moonSystem } = item;
      const a = def.phase + TAU * ((t % def.periodYears) / def.periodYears);
      const r = def.aAU * sceneUnitsPerAU;
      host.position.set(r * Math.cos(a), r * Math.sin(a), r * def.inclination * Math.sin(a * 0.63));
      host.rotation.z = 0.025 * Math.sin(t * 0.7 + def.phase);
      body.rotation.y += 0.003;
      orbit.visible = !!visible && !!showOrbits;
      moonSystem.update(t, visible, showOrbits);
    }
  }
  update(0, true, true);
  return { group: root, planets, targets, update };
}

export const MAJOR_MOON_SETS = { mars: MARS_MOONS, jupiter: JUPITER_MOONS };
