// OCTO-EARTH main-belt environment graphic.
// Individual irregular rocks are enlarged for visibility and follow deterministic Kepler ellipses for display only.
// They are not a small-body catalog, are not coupled to Python, and have no gravitational/collision interactions.
import * as THREE from './vendor/three.module.js';
import { createAsteroidGeometry, createAsteroidMaterial } from './rockAssets.js';

const TAU = 2 * Math.PI, DEG = Math.PI / 180;
const h = (i, k, seed = 1) => {
  const x = Math.sin((i + 1) * 12.9898 + (k + seed * 7) * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function makeOrbitLine(radius, S, color, opacity, dashed = false) {
  const pts = [];
  for (let i = 0; i <= 360; i++) {
    const a = i / 360 * TAU; pts.push(new THREE.Vector3(radius * S * Math.cos(a), radius * S * Math.sin(a), 0));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.28, gapSize: 0.20, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const line = new THREE.LineLoop(geo, mat); line.frustumCulled = false;
  if (dashed) line.computeLineDistances();
  return line;
}

/** Add a display-only belt centered near 2.7 AU. Call update(tYears, playing, speedYearsPerWallSecond, visible). */
export function createAsteroidBelt(scene, S = 10, options = {}) {
  const o = { count: 2400, variants: 8, innerAU: 2.1, outerAU: 3.3, centerAU: 2.7, ...options };
  const group = new THREE.Group(); group.name = 'illustrative asteroid belt (not simulated)'; group.userData.displayOnly = true; scene.add(group);
  group.add(makeOrbitLine(o.innerAU, S, 0x4fa3ff, 0.32));
  group.add(makeOrbitLine(o.outerAU, S, 0x4fa3ff, 0.32));
  group.add(makeOrbitLine(o.centerAU, S, 0xc084fc, 0.50, true));

  const rockMaterial = createAsteroidMaterial(802, { bumpScale: 0.012, width: 512, height: 256, flatShading: true });
  const pools = [];
  const per = Math.ceil(o.count / o.variants);
  const geos = Array.from({ length: o.variants }, (_, k) => createAsteroidGeometry(170 + k * 29, 3));
  for (let k = 0; k < o.variants; k++) {
    const mesh = new THREE.InstancedMesh(geos[k], rockMaterial, per);
    mesh.name = `illustrative asteroid variant ${k + 1}`;
    mesh.userData.focusName = 'Asteroid-belt rock'; mesh.userData.focusRadius = 1; mesh.userData.displayOnly = true;
    mesh.frustumCulled = false; mesh.count = 0; group.add(mesh); pools.push(mesh);
  }
  const states = [];
  for (let i = 0; i < o.count; i++) {
    const k = i % o.variants, ix = Math.floor(i / o.variants);
    // Triangular sampling puts the densest concentration near the belt's ~2.7 AU centre.
    const u = 0.5 * (h(i, 1) + h(i, 2));
    const a = o.innerAU + (o.outerAU - o.innerAU) * u;
    const e = 0.015 + 0.16 * h(i, 3);
    const inc = (1 + 13 * h(i, 4)) * DEG;
    const node = TAU * h(i, 5), arg = TAU * h(i, 6), M0 = TAU * h(i, 7);
    const size = 0.04 + 0.17 * Math.pow(h(i, 8), 2.2);   // enlarged, irregular display marker radius [scene units]
    const col = 0.58 + 0.5 * h(i, 9);
    const tint = new THREE.Color(col * (0.91 + 0.09 * h(i, 10)), col * (0.89 + 0.11 * h(i, 11)), col * (0.86 + 0.14 * h(i, 12)));
    const axis = new THREE.Vector3(h(i, 13) - 0.5, h(i, 14) - 0.5, h(i, 15) - 0.5).normalize();
    const spin = (h(i, 16) - 0.5) * TAU;
    states.push({ i, k, ix, a, e, inc, node, arg, M0, size, tint, axis, spin, pos: new THREE.Vector3(), q: new THREE.Quaternion(), scale: new THREE.Vector3(), m: new THREE.Matrix4() });
  }
  for (const p of pools) {
    for (let i = 0; i < p.instanceMatrix.count; i++) p.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
    p.instanceMatrix.needsUpdate = true;
  }
  let frozenT = null, lastT = 0;
  const _v = new THREE.Vector3(), _rot = new THREE.Quaternion(), _qNode = new THREE.Quaternion(), _qInc = new THREE.Quaternion(), _qArg = new THREE.Quaternion();
  const Z = new THREE.Vector3(0, 0, 1), Y = new THREE.Vector3(0, 1, 0);

  function place(s, tYears) {
    const n = TAU / Math.sqrt(s.a * s.a * s.a), M = s.M0 + n * tYears;
    let E = M;
    for (let j = 0; j < 5; j++) E -= (E - s.e * Math.sin(E) - M) / (1 - s.e * Math.cos(E));
    const x = s.a * (Math.cos(E) - s.e), y = s.a * Math.sqrt(1 - s.e * s.e) * Math.sin(E);
    _v.set(x, y, 0).applyAxisAngle(Z, s.arg).applyAxisAngle(Y, s.inc).applyAxisAngle(Z, s.node).multiplyScalar(S);
    s.pos.copy(_v);
    _qNode.setFromAxisAngle(Z, s.node); _qInc.setFromAxisAngle(Y, s.inc); _qArg.setFromAxisAngle(Z, s.arg);
    _rot.copy(_qNode).multiply(_qInc).multiply(_qArg).multiply(_qNode.setFromAxisAngle(s.axis, s.spin + 0.17 * tYears));
    s.scale.set(s.size * (0.7 + 0.6 * h(s.i, 17)), s.size * (0.65 + 0.7 * h(s.i, 18)), s.size * (0.62 + 0.68 * h(s.i, 19)));
    s.m.compose(s.pos, _rot, s.scale);
    const mesh = pools[s.k]; mesh.setMatrixAt(s.ix, s.m); mesh.setColorAt(s.ix, s.tint);
  }

  function update(tYears = 0, playing = false, speedY = 0, visible = true) {
    const t = Number.isFinite(tYears) ? tYears : 0;
    const revPerSec = playing ? speedY / Math.sqrt(o.centerAU ** 3) : 0;
    const frozen = revPerSec > 0.38;
    if (!frozen) frozenT = null; else if (frozenT === null) frozenT = lastT;
    const drawT = frozen ? frozenT : t; lastT = t;
    group.visible = !!visible;
    if (!group.visible) return { frozen, centerAU: o.centerAU, innerAU: o.innerAU, outerAU: o.outerAU };
    for (const p of pools) p.count = 0;
    for (const s of states) { place(s, drawT); pools[s.k].count = Math.max(pools[s.k].count, s.ix + 1); }
    for (const p of pools) { p.instanceMatrix.needsUpdate = true; if (p.instanceColor) p.instanceColor.needsUpdate = true; }
    return { frozen, centerAU: o.centerAU, innerAU: o.innerAU, outerAU: o.outerAU };
  }
  return { group, update, center: new THREE.Vector3(0, o.centerAU * S, 0), options: o, meshes: pools };
}
