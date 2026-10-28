// OCTO-EARTH asteroid render assets (visual only; no asteroid catalog or extra physics is implied).
// The primary docked rock and the overview belt use seeded irregular geometry + procedural regolith textures.
import * as THREE from './vendor/three.module.js';

const hash = (i, k = 0) => {
  let x = Math.imul((i + 1) ^ Math.imul(k + 17, 0x45d9f3b), 0x27d4eb2d);
  x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
};
/** Seeded, lumpy rocky body with shallow impact basins. Unit radius; caller controls scale. */
export function createAsteroidGeometry(seed = 1, detail = 3) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  const craters = [];
  const count = 10 + detail * 9;
  for (let i = 0; i < count; i++) {
    const z = 2 * hash(seed * 71 + i, 1) - 1, a = 2 * Math.PI * hash(seed * 71 + i, 2), r = Math.sqrt(1 - z * z);
    const radius = 0.055 + 0.20 * hash(seed * 71 + i, 3);
    craters.push({ c: new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z), radius, depth: 0.025 + 0.055 * hash(seed * 71 + i, 4) });
  }
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const h1 = hash(Math.round((v.x + 1) * 511) + seed, Math.round((v.y + 1) * 317));
    const h2 = hash(Math.round((v.z + 1) * 271) + seed, Math.round((v.x - v.y + 2) * 113));
    let radial = 0.91 + 0.11 * h1 + 0.035 * Math.sin(7 * v.x + 4 * v.z + seed) * Math.sin(8 * v.y - 2 * v.x);
    for (const c of craters) {
      const d = Math.acos(Math.max(-1, Math.min(1, v.dot(c.c))));
      const x = d / c.radius;
      if (x < 1.25) {
        const bowl = Math.max(0, 1 - x * x);
        const rim = Math.exp(-(((x - 0.88) / 0.12) ** 2));
        radial -= c.depth * bowl;
        radial += 0.018 * rim;
      }
    }
    radial += 0.025 * (h2 - 0.5);
    v.multiplyScalar(Math.max(0.72, radial)); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}

/** A deterministic charcoal / umber regolith texture with ejecta rims and fine albedo mottling. */
export function asteroidTexture(seed = 1, width = 1024, height = 512) {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  const ctx = c.getContext('2d');
  const base = 48 + Math.floor(hash(seed, 2) * 24);
  ctx.fillStyle = `rgb(${base + 8},${base + 3},${base - 2})`; ctx.fillRect(0, 0, width, height);
  // broad albedo fields; a deterministic sparse distribution avoids a tiled, uniform surface.
  for (let i = 0; i < 2200; i++) {
    const x = hash(seed + i, 11) * width, y = hash(seed + i, 12) * height;
    const rx = 2 + hash(seed + i, 13) * 35, ry = 1 + hash(seed + i, 14) * 16;
    const v = hash(seed + i, 15), a = 0.025 + 0.11 * hash(seed + i, 16);
    ctx.fillStyle = v > 0.52 ? `rgba(178,153,126,${a})` : `rgba(9,12,16,${a * 1.45})`;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, hash(seed + i, 17) * Math.PI, 0, 2 * Math.PI); ctx.fill();
  }
  // crater bowls, dark interiors, bright weathered rims and gently feathered ejecta.
  const nC = 190;
  for (let i = 0; i < nC; i++) {
    const x = hash(seed + i, 21) * width, y = hash(seed + i, 22) * height;
    const r = 1.2 + hash(seed + i, 23) * (i < 35 ? 17 : 6);
    const grad = ctx.createRadialGradient(x, y, Math.max(0.4, r * 0.12), x, y, r);
    grad.addColorStop(0, 'rgba(9,10,12,0.42)');
    grad.addColorStop(0.56, 'rgba(21,22,24,0.28)');
    grad.addColorStop(0.79, 'rgba(192,172,147,0.35)');
    grad.addColorStop(1, 'rgba(62,55,49,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // fine grain / regolith speckle.
  for (let i = 0; i < 10500; i++) {
    const x = hash(seed + i, 31) * width, y = hash(seed + i, 32) * height;
    const b = hash(seed + i, 33) > 0.5, a = 0.035 + hash(seed + i, 34) * 0.10;
    ctx.fillStyle = b ? `rgba(225,207,180,${a})` : `rgba(4,6,8,${a})`;
    ctx.fillRect(x, y, 0.6 + hash(seed + i, 35) * 1.6, 0.5 + hash(seed + i, 36) * 1.1);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 4; return tex;
}

export function createAsteroidMaterial(seed = 1, options = {}) {
  const map = asteroidTexture(seed, options.width || 1024, options.height || 512);
  return new THREE.MeshStandardMaterial({
    map, bumpMap: map, bumpScale: options.bumpScale ?? 0.045,
    color: options.color ?? 0xffffff, roughness: 0.97, metalness: 0.015, flatShading: options.flatShading ?? true,
    vertexColors: !!options.vertexColors,
  });
}

export function createAsteroidMesh(seed = 1, detail = 3, options = {}) {
  return new THREE.Mesh(createAsteroidGeometry(seed, detail), createAsteroidMaterial(seed, options));
}
