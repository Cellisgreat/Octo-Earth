// Procedural, display-only equatorial textures for the non-Earth bodies.
// These maps add surface character only; they do not supply ephemerides, rotation states, forces, or geology.
import * as THREE from './vendor/three.module.js';

const CACHE = new Map();
const W = 512, H = 256;
const fract = (x) => x - Math.floor(x);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a, b, t) => a + (b - a) * t;
const mod = (x, n) => ((x % n) + n) % n;

function hash(x, y, seed) {
  const z = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return fract(z);
}
function valueNoise(u, v, scale, seed) {
  const x = u * scale, y = v * scale, ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const x0 = mod(ix, scale), x1 = mod(ix + 1, scale);
  const a = mix(hash(x0, iy, seed), hash(x1, iy, seed), sx);
  const b = mix(hash(x0, iy + 1, seed), hash(x1, iy + 1, seed), sx);
  return mix(a, b, sy);
}
function fbm(u, v, seed) {
  return 0.52 * valueNoise(u, v, 4, seed) + 0.28 * valueNoise(u, v, 11, seed + 1) +
    0.14 * valueNoise(u, v, 29, seed + 2) + 0.06 * valueNoise(u, v, 67, seed + 3);
}
function paletteMix(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }

function bodyColor(kind, lon, lat, u, v) {
  const n = fbm(u, v, kind.length * 31), fine = valueNoise(u, v, 91, kind.length * 53);
  if (kind === 'jupiter' || kind === 'saturn' || kind === 'uranus' || kind === 'neptune' || kind === 'venus') {
    const cfg = {
      venus:   { lo: [158, 121, 72], hi: [244, 224, 176], freq: 12, contrast: 0.72 },
      jupiter: { lo: [105, 66, 51], hi: [224, 195, 157], freq: 29, contrast: 0.84 },
      saturn:  { lo: [157, 132, 93], hi: [237, 220, 183], freq: 22, contrast: 0.62 },
      uranus:  { lo: [76, 148, 162], hi: [190, 229, 230], freq: 19, contrast: 0.30 },
      neptune: { lo: [14, 47, 112], hi: [47, 143, 205], freq: 25, contrast: 0.62 },
    }[kind];
    const turbulence = 1.55 * (n - 0.5) + 0.25 * Math.sin(lon * 2 + lat * 4);
    const band = 0.5 + 0.5 * Math.sin(lat * cfg.freq + turbulence);
    let c = paletteMix(cfg.lo, cfg.hi, clamp(0.5 + (band - 0.5) * cfg.contrast + (fine - 0.5) * 0.22));
    if (kind === 'jupiter') {
      const dx = Math.atan2(Math.sin(lon - 2.25), Math.cos(lon - 2.25)) * Math.max(0.25, Math.cos(lat));
      const d = Math.sqrt((dx / 0.19) ** 2 + ((lat + 0.24) / 0.09) ** 2);
      const spot = clamp((1.2 - d) * 1.7, 0, 0.88);
      c = paletteMix(c, [177, 81, 49], spot);
      const eye = clamp((0.28 - d) * 5, 0, 0.48);
      c = paletteMix(c, [225, 151, 107], eye);
    } else if (kind === 'neptune') {
      const dx = Math.atan2(Math.sin(lon - 3.55), Math.cos(lon - 3.55)) * Math.max(0.25, Math.cos(lat));
      const d = Math.sqrt((dx / 0.22) ** 2 + ((lat + 0.18) / 0.1) ** 2);
      c = paletteMix(c, [10, 26, 64], clamp((1.1 - d) * 0.62, 0, 0.55));
    }
    const stormLight = (kind === 'jupiter' || kind === 'saturn') ? 8 : 4;
    return c.map((x) => clamp(x + (fine - 0.5) * stormLight, 0, 255));
  }
  if (kind === 'mars') {
    let c = paletteMix([74, 37, 29], [202, 113, 68], clamp(0.20 + 0.95 * n + 0.18 * Math.sin(lon * 2.2 + lat * 3)));
    const darkBasalt = clamp((0.32 - n) * 1.9, 0, 0.42);
    c = paletteMix(c, [74, 69, 61], darkBasalt);
    const cap = clamp((Math.abs(lat) - 1.28) * 4.2, 0, 0.85);
    return paletteMix(c, [224, 219, 204], cap).map((x) => clamp(x + (fine - 0.5) * 10, 0, 255));
  }
  if (kind === 'mercury') {
    const c = paletteMix([69, 67, 63], [175, 169, 155], 0.18 + 0.85 * n);
    return c.map((x) => clamp(x + (fine - 0.5) * 18, 0, 255));
  }
  // Gray basaltic lunar surface with subtle highland variation; craters are drawn over the map below.
  const c = paletteMix([72, 72, 69], [174, 171, 160], 0.18 + 0.82 * n);
  return c.map((x) => clamp(x + (fine - 0.5) * 9, 0, 255));
}

function paintCraters(ctx, count, seed) {
  for (let i = 0; i < count; i++) {
    const x = hash(i, 7, seed) * W, y = hash(i, 19, seed) * H;
    const r = 2.2 + 15 * Math.pow(hash(i, 31, seed), 2.1);
    const locations = [x];
    if (x < r * 1.4) locations.push(x + W);
    if (x > W - r * 1.4) locations.push(x - W);
    for (const cx of locations) {
      const g = ctx.createRadialGradient(cx - r * 0.2, y - r * 0.23, r * 0.08, cx, y, r * 1.3);
      g.addColorStop(0, 'rgba(28,27,25,0.46)');
      g.addColorStop(0.58, 'rgba(48,46,42,0.32)');
      g.addColorStop(0.76, 'rgba(13,13,12,0.43)');
      g.addColorStop(0.86, 'rgba(244,239,226,0.34)');
      g.addColorStop(1, 'rgba(80,78,72,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, y, r * (0.84 + 0.28 * hash(i, 41, seed)), r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/** Shared, cached equirectangular texture for a realistic-but-schematic body surface. */
export function planetTexture(kind = 'moon') {
  if (CACHE.has(kind)) return CACHE.get(kind);
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d'), img = ctx.createImageData(W, H), data = img.data;
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI;
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W, v = (y + 0.5) / H, lon = 2 * Math.PI * u;
      const c = bodyColor(kind, lon, lat, u, v), o = (y * W + x) * 4;
      data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (kind === 'moon' || kind === 'mercury' || kind === 'mars') paintCraters(ctx, kind === 'moon' ? 115 : 78, kind.length * 13);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping; texture.anisotropy = 4; texture.needsUpdate = true;
  CACHE.set(kind, texture); return texture;
}

// Thin, colour-tinted limb scattering for bodies with atmospheres. This is a display-only shell:
// it has no weather, pressure, chemistry, or effect on the temperature/simulation models.
const ATMOSPHERE_VS = `
varying vec3 vNormalW;
varying vec3 vViewW;
varying vec3 vWorld;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorld = worldPosition.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewW = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}`;
const ATMOSPHERE_FS = `
uniform vec3 uColor;
uniform float uStrength;
varying vec3 vNormalW;
varying vec3 vViewW;
varying vec3 vWorld;
void main() {
  vec3 normal = normalize(vNormalW);
  vec3 viewDir = normalize(vViewW);
  float edge = pow(1.0 - clamp(abs(dot(normal, viewDir)), 0.0, 1.0), 2.15);
  vec3 toSun = normalize(-vWorld);
  float daylight = 0.22 + 0.78 * max(dot(normal, toSun), 0.0);
  gl_FragColor = vec4(uColor, edge * uStrength * daylight);
  #include <colorspace_fragment>
}`;

/** A restrained, Sun-facing atmospheric rim. Geometry and shader are strictly visual. */
export function createPlanetAtmosphere(radius, color = 0xffffff, strength = 0.18) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uStrength: { value: clamp(strength, 0, 1) },
    },
    vertexShader: ATMOSPHERE_VS,
    fragmentShader: ATMOSPHERE_FS,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.035, 48, 32), material);
  shell.name = 'subtle atmospheric limb (display only)';
  shell.renderOrder = 1;
  shell.userData.displayOnly = true;
  return shell;
}

