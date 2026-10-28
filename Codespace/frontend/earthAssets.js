// OCTO-EARTH realistic Earth, star field and Sun for the cinematic views (update p37).
//
// Textures are bundled locally in frontend/assets/earth/ (no network access at run time). They are derived from
// NASA public-domain imagery (see assets/earth/CREDITS.txt):
//   earth_day_4096.jpg      Blue Marble Next Generation, Dec 2004, topography + bathymetry (NASA Earth Observatory)
//   earth_night_4096.jpg    Black Marble 2016 city lights (NASA Earth Observatory / Suomi NPP VIIRS), lights only
//   earth_clouds_2048.jpg   Blue Marble cloud composite (NASA Visible Earth), used as cloud opacity
//   earth_normal_2048.jpg   approximate relief shading DERIVED from the day image (land brightness), not elevation data
//   earth_ocean_mask_2048.png  water mask derived from the day image (where the ocean glint is drawn)
// If a texture cannot be loaded the views fall back to a small bundled-style procedural texture and say so in
// earthTextureStatus().
//
// Lighting is done in the shader: day side lit by the Sun direction, a soft twilight band, city lights on the night
// side only, a sun glint on water, clouds that are lit / dark with the same terminator, and a thin atmosphere rim.
import * as THREE from './vendor/three.module.js';

function glowTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

const BASE = './assets/earth/';
export const EARTH_ASSETS = {
  day: 'earth_day_4096.jpg', night: 'earth_night_4096.jpg', clouds: 'earth_clouds_2048.jpg',
  normal: 'earth_normal_2048.jpg', ocean: 'earth_ocean_mask_2048.png',
};
const STATUS = { requested: false, loaded: [], failed: [] };
let TEX = null;
const blackTex = () => { const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); t.needsUpdate = true; return t; };
const flatNormal = () => { const t = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1); t.needsUpdate = true; return t; };
function fallbackDayTexture() {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), im = g.createImageData(W, H), d = im.data;
  const h = (x, y) => { let n = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lat = Math.abs((y / H - 0.5) * Math.PI), n = 0.58 * h(Math.floor(x / 5), Math.floor(y / 4)) + 0.28 * h(Math.floor(x / 13), Math.floor(y / 11)) + 0.14 * h(x, y);
    const ice = lat > 1.18 && h(x, y) < 0.7, land = n > 0.54, o = (y * W + x) * 4;
    d[o] = ice ? 190 : land ? 74 + 42 * n : 9 + 10 * n;
    d[o + 1] = ice ? 215 : land ? 92 + 44 * n : 38 + 35 * n;
    d[o + 2] = ice ? 238 : land ? 48 + 18 * n : 100 + 80 * n; d[o + 3] = 255;
  }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}

/** Load (once) and share the Earth textures; textures appear when loaded, fallbacks are used until then. */
export function earthTextures(renderer) {
  if (TEX) return TEX;
  STATUS.requested = true;
  const loader = new THREE.TextureLoader();
  const aniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
  TEX = { day: fallbackDayTexture(), night: blackTex(), clouds: blackTex(), normal: flatNormal(), ocean: blackTex(), real: false, listeners: [] };
  for (const [key, file] of Object.entries(EARTH_ASSETS)) {
    loader.load(BASE + file, (t) => {
      if (key === 'day' || key === 'night') t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso; t.wrapS = THREE.RepeatWrapping;
      TEX[key] = t; STATUS.loaded.push(file); if (key === 'day') TEX.real = true;
      for (const f of TEX.listeners) f(key, t);
    }, undefined, () => { STATUS.failed.push(file); console.warn('[OCTO-EARTH] texture not found, using fallback:', BASE + file); });
  }
  return TEX;
}
export function earthTextureStatus() {
  return { ...STATUS, real: !!(TEX && TEX.real), note: STATUS.failed.length ? `missing: ${STATUS.failed.join(', ')} (procedural fallback in use)` : '' };
}

const EARTH_VS = `
varying vec2 vUv; varying vec3 vN; varying vec3 vT; varying vec3 vW;
uniform vec3 axis;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vT = normalize(cross(axis, vN) + vec3(1e-5));
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const EARTH_FS = `
uniform sampler2D dayMap, nightMap, normalMap, oceanMap, cloudMap;
uniform vec3 sunDir; uniform float cloudShift; uniform float nightGain; uniform float bumpK;
uniform vec3 heatDir; uniform float heatSpot; uniform float spotCos; uniform float heatGlobal; uniform float scorch;   // p38 laser heating
varying vec2 vUv; varying vec3 vN; varying vec3 vT; varying vec3 vW;
void main(){
  vec3 N = normalize(vN), T = normalize(vT), B = normalize(cross(N, T));
  vec3 nm = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
  vec3 Np = normalize(T * nm.x * bumpK + B * nm.y * bumpK + N * nm.z);
  vec3 L = normalize(sunDir), V = normalize(cameraPosition - vW);
  float ndl = dot(N, L), lit = max(dot(Np, L), 0.0);
  float day = smoothstep(-0.12, 0.18, ndl);
  vec3 dcol = texture2D(dayMap, vUv).rgb;
  float sh = texture2D(cloudMap, vUv + vec2(cloudShift - 0.0025, 0.0)).g;       // cloud shadow
  vec3 col = dcol * (0.025 + 1.25 * lit * (1.0 - 0.45 * sh)) * day;
  col += vec3(0.95, 0.42, 0.18) * 0.10 * exp(-pow(ndl / 0.10, 2.0)) * (1.0 - sh);   // twilight band
  float ocean = texture2D(oceanMap, vUv).r;
  vec3 H = normalize(L + V);
  col += vec3(1.0, 0.92, 0.78) * pow(max(dot(N, H), 0.0), 70.0) * ocean * day * 0.85 * (1.0 - sh);
  col += vec3(0.25, 0.45, 0.85) * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.35 * day;   // haze towards the limb
  float night = 1.0 - smoothstep(-0.2, 0.08, ndl);
  col += texture2D(nightMap, vUv).rgb * night * nightGain * (1.0 - 0.7 * sh);
  // p38: heating by an external beam (all zero by default = normal Earth)
  float hd = dot(N, normalize(heatDir));
  float spot = heatSpot * smoothstep(spotCos - 0.06, spotCos + 0.04, hd);
  float burnt = scorch * max(smoothstep(spotCos - 0.45, spotCos, hd), heatGlobal);
  float lum = dot(dcol, vec3(0.3, 0.55, 0.15));
  col = mix(col, vec3(0.06, 0.045, 0.035) * (0.4 + 2.0 * lum) * (0.15 + lit), burnt);          // charred ground, no seas
  float g = max(spot, heatGlobal);
  vec3 hot = mix(vec3(0.9, 0.12, 0.02), vec3(1.0, 0.55, 0.12), smoothstep(0.15, 0.55, g));
  hot = mix(hot, vec3(1.0, 0.93, 0.8), smoothstep(0.8, 1.0, g));
  float crack = 0.75 + 0.5 * texture2D(normalMap, vUv * 3.0).r;                                  // lava texture
  float crack2 = 0.55 + 0.9 * texture2D(normalMap, vUv * 7.0 + vec2(0.13, 0.31)).g * texture2D(dayMap, vUv * 2.0).r;
  col = mix(col, hot * crack * crack2 * (0.6 + 0.4 * g), clamp(g * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const CLOUD_FS = `
uniform sampler2D cloudMap; uniform vec3 sunDir; uniform float fade;
varying vec2 vUv; varying vec3 vN; varying vec3 vT; varying vec3 vW;
void main(){
  float a = texture2D(cloudMap, vUv).g; a = smoothstep(0.08, 0.85, a);
  vec3 N = normalize(vN); float ndl = dot(N, normalize(sunDir));
  float l = 0.03 + 1.05 * smoothstep(-0.15, 0.35, ndl) * max(ndl + 0.15, 0.0);
  vec3 c = vec3(1.0) * l + vec3(0.9, 0.45, 0.25) * 0.10 * exp(-pow(ndl / 0.1, 2.0));
  gl_FragColor = vec4(c, a * 0.92 * fade);
  #include <colorspace_fragment>
}`;
const ATM_FS = `
uniform vec3 sunDir; uniform float hot; varying vec3 vN; varying vec3 vW; varying vec2 vUv; varying vec3 vT;
void main(){
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float rim = pow(1.0 - abs(dot(N, V)), 2.6);
  float lit = smoothstep(-0.35, 0.45, dot(N, normalize(sunDir)));
  vec3 c = mix(vec3(0.32, 0.58, 1.0) * (0.08 + 1.25 * lit), vec3(1.0, 0.45, 0.12) * (1.0 + 2.0 * hot), hot);
  float a = mix(0.08 + lit, 1.0, hot);
  gl_FragColor = vec4(c * rim, rim * a);
}`;

/**
 * A realistic Earth (radius 1 in its own units; scale the returned group). Axis = +z of the group (tilt it with the
 * group's rotation if wanted). Call setSun(worldDirection) whenever the Sun direction changes and update(dt) to spin.
 */
export function createRealEarth(renderer, opt = {}) {
  const o = { segments: 128, spinRate: 0.02, cloudRate: 0.0035, ...opt };
  const T = earthTextures(renderer);
  const group = new THREE.Group();
  const spin = new THREE.Group(); group.add(spin);
  const sunDir = new THREE.Vector3(1, 0, 0);
  const axisW = new THREE.Vector3(0, 0, 1);
  const uni = {
    dayMap: { value: T.day }, nightMap: { value: T.night }, normalMap: { value: T.normal }, oceanMap: { value: T.ocean }, cloudMap: { value: T.clouds },
    sunDir: { value: sunDir }, axis: { value: axisW }, cloudShift: { value: 0 }, nightGain: { value: 1.7 }, bumpK: { value: 0.9 },
    heatDir: { value: new THREE.Vector3(1, 0, 0) }, heatSpot: { value: 0 }, spotCos: { value: 0.99 }, heatGlobal: { value: 0 }, scorch: { value: 0 },
  };
  const surface = new THREE.Mesh(new THREE.SphereGeometry(1, o.segments, o.segments / 2),
    new THREE.ShaderMaterial({ uniforms: uni, vertexShader: EARTH_VS, fragmentShader: EARTH_FS }));
  surface.rotation.x = Math.PI / 2; spin.add(surface);                      // texture north pole on +z
  const cloudUni = { cloudMap: { value: T.clouds }, sunDir: { value: sunDir }, axis: { value: axisW }, fade: { value: 1 } };
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, o.segments, o.segments / 2),
    new THREE.ShaderMaterial({ uniforms: cloudUni, vertexShader: EARTH_VS, fragmentShader: CLOUD_FS, transparent: true, depthWrite: false }));
  clouds.rotation.x = Math.PI / 2; spin.add(clouds);
  const atmUni = { sunDir: { value: sunDir }, axis: { value: axisW }, hot: { value: 0 } };
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.045, 96, 48),
    new THREE.ShaderMaterial({ uniforms: atmUni, vertexShader: EARTH_VS, fragmentShader: ATM_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  group.add(atmo);
  T.listeners.push((key, t) => {
    if (key === 'day') uni.dayMap.value = t; else if (key === 'night') uni.nightMap.value = t; else if (key === 'normal') uni.normalMap.value = t;
    else if (key === 'ocean') uni.oceanMap.value = t; else if (key === 'clouds') { uni.cloudMap.value = t; cloudUni.cloudMap.value = t; }
  });
  let cloudRot = 0;
  function setSun(dirWorld) { sunDir.copy(dirWorld).normalize(); }
  function update(dt) {
    spin.rotation.z += o.spinRate * dt; cloudRot += o.cloudRate * dt;
    clouds.rotation.z = cloudRot;                                            // clouds drift longitudinally over the ground
    uni.cloudShift.value = -cloudRot / (2 * Math.PI);
    group.updateMatrixWorld(); axisW.set(0, 0, 1).transformDirection(group.matrixWorld);
  }
  return { group, spin, surface, clouds, atmo, setSun, update, uniforms: uni, cloudUniforms: cloudUni, atmUniforms: atmUni };
}

const STAR_VS = `
attribute vec3 color; attribute float aSize; attribute float aPhase; attribute float aRate; attribute float aBase;
uniform float time; varying vec3 vColor; varying float vAlpha;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  float pulse = 0.5 + 0.5 * sin(time * aRate + aPhase);
  float fade = smoothstep(0.08, 0.94, pulse);
  vAlpha = aBase * mix(0.28, 0.76, fade);
  vColor = color * (0.86 + 0.34 * pulse);
  gl_PointSize = clamp(aSize * (0.92 + 0.28 * pulse), 1.0, 2.8);
}`;
const STAR_FS = `
varying vec3 vColor; varying float vAlpha;
void main(){
  float r = length(gl_PointCoord - vec2(0.5));
  float core = 1.0 - smoothstep(0.06, 0.30, r);
  float halo = 1.0 - smoothstep(0.10, 0.50, r);
  float a = vAlpha * (core + 0.12 * halo);
  gl_FragColor = vec4(vColor * (0.82 + core * 0.34), a);
  #include <colorspace_fragment>
}`;
/** Decorative sky points. Their slow fade/twinkle is a visual effect, not astronomical star data. */
export function createStarfield(radius = 4000, n = 5000, seed = 1) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), phase = new Float32Array(n), rate = new Float32Array(n), base = new Float32Array(n);
  const h = (i, k) => { const x = Math.sin((i + 1) * 12.9898 + (k + seed) * 78.233) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < n; i++) {
    const z = 2 * h(i, 1) - 1, ph = 2 * Math.PI * h(i, 2), r = Math.sqrt(1 - z * z);
    pos.set([r * Math.cos(ph) * radius, r * Math.sin(ph) * radius, z * radius], 3 * i);
    const b = 0.58 + 0.42 * Math.pow(h(i, 3), 1.8), t = h(i, 4);
    col.set(t < 0.16 ? [b, b * 0.86, b * 0.76] : t > 0.84 ? [b * 0.86, b * 0.93, b] : [b, b, b * 0.99], 3 * i);
    size[i] = 0.78 + 1.12 * Math.pow(h(i, 5), 2.25);
    phase[i] = h(i, 6) * 2 * Math.PI;
    rate[i] = 0.12 + 0.58 * h(i, 7);
    base[i] = 0.52 + 0.34 * Math.pow(h(i, 8), 0.75);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1)); g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  g.setAttribute('aRate', new THREE.BufferAttribute(rate, 1)); g.setAttribute('aBase', new THREE.BufferAttribute(base, 1));
  const mat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 } }, vertexShader: STAR_VS, fragmentShader: STAR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.userData.isStarfield = true;
  pts.userData.update = (t) => { mat.uniforms.time.value = Number.isFinite(t) ? t : 0; };
  return pts;
}

const SUN_VS = 'varying vec3 vP; varying vec3 vN; varying vec3 vW; void main(){ vP = position; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const SUN_FS = `
uniform float time; varying vec3 vP; varying vec3 vN; varying vec3 vW;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
void main(){
  vec3 dir = normalize(vP);
  float drift = time * 0.11;
  // Advected, warped convection cells move like molten currents instead of a fixed painted pattern.
  float warpA = noise(dir * 5.3 + vec3(drift * 0.38, -drift * 0.27, drift * 0.19));
  float warpB = noise(dir * 8.0 + vec3(-drift * 0.22, drift * 0.31, drift * 0.40));
  vec3 flow = dir * 27.0 + vec3((warpA - 0.5) * 6.0, (warpB - 0.5) * 4.5, 0.0)
            + vec3(drift * 2.10, -drift * 1.25, drift * 0.80);
  float cells = noise(flow);
  float detail = noise(flow * 2.35 + vec3(-drift * 2.2, drift * 1.7, drift * 2.6));
  float broad = noise(dir * 7.4 + vec3(-drift * 0.12, drift * 0.16, drift * 0.08));
  float granule = smoothstep(0.28, 0.75, cells);
  float darkLane = 1.0 - smoothstep(0.015, 0.16, abs(cells - 0.48));
  float simmer = sin(time * 0.72 + detail * 7.0 + broad * 3.5);
  float heat = clamp(0.10 + 0.61 * granule + 0.16 * detail + 0.13 * broad - 0.20 * darkLane + 0.025 * simmer, 0.0, 1.0);
  vec3 c = mix(vec3(0.42, 0.028, 0.004), vec3(0.88, 0.085, 0.006), smoothstep(0.03, 0.28, heat));
  c = mix(c, vec3(1.0, 0.25, 0.018), smoothstep(0.22, 0.56, heat));
  c = mix(c, vec3(1.0, 0.68, 0.20), smoothstep(0.54, 0.82, heat));
  float hotFilament = smoothstep(0.83, 0.99, heat) * smoothstep(0.44, 0.96, detail);
  c = mix(c, vec3(1.0, 0.98, 0.82), hotFilament * 0.78);
  vec3 V = normalize(cameraPosition - vW); float mu = max(dot(normalize(vN), V), 0.0);
  float limb = 0.31 + 0.69 * pow(mu, 0.55);                         // solar-like limb darkening
  c = c * limb * 1.26 + vec3(0.18, 0.025, 0.002) * pow(1.0 - mu, 3.0);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;
/**
 * Luminous Sun: faster lava-like flowing granulation and several independent illustrative flare regions.
 * The magnetic-loop animations are display art only—not solar observations or solar-activity physics.
 */
export function createSun(radius = 6) {
  const group = new THREE.Group();
  const uni = { time: { value: 0 } };
  const disc = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), new THREE.ShaderMaterial({ uniforms: uni, vertexShader: SUN_VS, fragmentShader: SUN_FS }));
  disc.userData.focusName = 'Sun'; disc.userData.focusRadius = radius; group.add(disc);

  // Restrained layered corona; its brightness breathes only with the display-only flare events.
  const glowA = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,241,207,0.82)', 'rgba(255,170,72,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.42, toneMapped: false }));
  glowA.scale.setScalar(radius * 2.9); group.add(glowA);
  const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,205,125,0.30)', 'rgba(255,130,48,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.12, toneMapped: false }));
  glowB.scale.setScalar(radius * 5.0); group.add(glowB);

  // Five small active-region sites each carry two thin loops (ten arcs total), with independent timing.
  // Staggered, short bursts avoid a synchronized flame shell; all marks, lights and motions are decorative.
  const activity = new THREE.Group(); activity.name = 'illustrative solar active regions (display only)'; group.add(activity);
  const regionSpecs = [
    { lat:  0.16, lon: -0.78, first:  2.7, gain: 1.00, loopScale: 1.00, halo: 0xff5b1e },
    { lat: -0.24, lon: -2.15, first:  6.5, gain: 0.91, loopScale: 0.94, halo: 0xff6b27 },
    { lat:  0.64, lon: -1.55, first: 10.2, gain: 0.96, loopScale: 1.06, halo: 0xff7040 },
    { lat: -0.52, lon:  0.55, first: 14.8, gain: 0.84, loopScale: 0.92, halo: 0xff5c23 },
    { lat:  0.31, lon:  2.45, first: 18.4, gain: 0.89, loopScale: 1.02, halo: 0xff7131 },
  ];
  const loopSpecs = [
    { height: 1.55, shift: -0.020, width: 0.160, halo: 0.0090, core: 0.0036, gain: 1.00, delay: 0.00, azimuth: -0.18 },
    { height: 1.38, shift:  0.055, width: 0.120, halo: 0.0074, core: 0.0029, gain: 0.76, delay: 0.13, azimuth: 0.34 },
  ];
  const regions = [];
  const axis = new THREE.Vector3(0, 0, 1);
  const flareLight = new THREE.PointLight(0xffd29a, 0, radius * 2.2, 2); activity.add(flareLight);
  for (let regionIndex = 0; regionIndex < regionSpecs.length; regionIndex++) {
    const spec = regionSpecs[regionIndex];
    const region = new THREE.Group(); region.name = `illustrative active region ${regionIndex + 1}`; activity.add(region);
    const normal = new THREE.Vector3(Math.cos(spec.lat) * Math.cos(spec.lon), Math.cos(spec.lat) * Math.sin(spec.lon), Math.sin(spec.lat)).normalize();
    const frame = new THREE.Group(); frame.quaternion.setFromUnitVectors(axis, normal); region.add(frame);
    const active = new THREE.Group(); frame.add(active);

    const spotGeo = new THREE.CircleGeometry(radius * 0.018, 18);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0x55240f, transparent: true, opacity: 0.33,
      depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    for (const x of [-0.047, 0.052]) {
      const spot = new THREE.Mesh(spotGeo, spotMat.clone());
      spot.position.set(x * radius, 0, Math.sqrt(1 - x * x) * radius * 1.002);
      spot.name = 'illustrative sunspot'; active.add(spot);
    }

    const activeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,252,218,0.94)', 'rgba(255,116,34,0)'),
      color: 0xffc36a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.018, toneMapped: false }));
    activeGlow.name = 'illustrative active-region glow';
    activeGlow.position.set(0, 0, radius * 1.004); activeGlow.scale.set(radius * 0.18, radius * 0.13, 1); active.add(activeGlow);

    const flareGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,230,0.96)', 'rgba(255,72,20,0)'),
      color: 0xffa04a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.008, toneMapped: false }));
    flareGlow.name = 'illustrative flare-apex glow'; active.add(flareGlow);

    const loops = [];
    for (let loopIndex = 0; loopIndex < loopSpecs.length; loopIndex++) {
      const loopSpec = loopSpecs[loopIndex];
      const width = loopSpec.width * spec.loopScale;
      const shift = loopSpec.shift * spec.loopScale;
      const height = 1.0 + (loopSpec.height - 1.0) * spec.loopScale;
      const root = new THREE.Group(); root.position.set(0, 0, radius * 0.985);
      root.name = 'illustrative erupting prominence loop'; active.add(root);
      const top = height - 0.985;
      const surfaceZ = (x, y) => Math.sqrt(Math.max(0.001, 1 - x * x - y * y)) - 0.985;
      const points = [
        new THREE.Vector3(-width * radius, (shift - 0.006) * radius, surfaceZ(-width, shift - 0.006) * radius),
        new THREE.Vector3(-width * 0.82 * radius, (shift - 0.018) * radius, radius * 0.075),
        new THREE.Vector3(-width * 0.39 * radius, (shift + 0.010) * radius, radius * top * 0.78),
        new THREE.Vector3( width * 0.06 * radius, (shift + 0.026) * radius, radius * top),
        new THREE.Vector3( width * 0.49 * radius, (shift + 0.012) * radius, radius * top * 0.84),
        new THREE.Vector3( width * 0.83 * radius, (shift - 0.014) * radius, radius * 0.078),
        new THREE.Vector3( width * radius, (shift - 0.004) * radius, surfaceZ(width, shift - 0.004) * radius),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const haloMat = new THREE.MeshBasicMaterial({ color: spec.halo, transparent: true, opacity: 0.012,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffedc3, transparent: true, opacity: 0.020,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, radius * loopSpec.halo * spec.loopScale, 6, false), haloMat);
      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, radius * loopSpec.core * spec.loopScale, 5, false), coreMat);
      halo.renderOrder = core.renderOrder = 2; root.add(halo, core);
      loops.push({ root, haloMat, coreMat, gain: loopSpec.gain, delay: loopSpec.delay, azimuth: loopSpec.azimuth, phase: regionIndex * 1.71 + loopIndex * 1.13 });
    }

    // Independent event clocks: short rising flashes recur at varied intervals rather than in lockstep.
    const eventSeed = radius * 11.7 + 9.1 + (regionIndex + 1) * 19.19;
    const seeded = (i) => { const x = Math.sin((i + 1) * 12.9898 + eventSeed * 78.233) * 43758.5453; return x - Math.floor(x); };
    const flareStarts = [], flareStrengths = [];
    let nextFlare = spec.first + seeded(0) * 6.5;
    for (let i = 0; i < 1024; i++) {
      flareStarts.push(nextFlare); flareStrengths.push(0.55 + 0.45 * seeded(1000 + i));
      nextFlare += 23 + seeded(i + 1) * 28;
    }
    let flareCursor = 0;
    const localFlarePulse = (now) => {
      while (flareCursor + 1 < flareStarts.length && now >= flareStarts[flareCursor + 1]) flareCursor++;
      const age = now - flareStarts[flareCursor];
      if (age < 0 || age > 4.6) return 0;
      if (age < 0.16) return Math.sin((age / 0.16) * Math.PI * 0.5) * flareStrengths[flareCursor];
      if (age < 0.42) return flareStrengths[flareCursor];
      const tail = Math.exp(-(age - 0.42) / 1.18);
      const flicker = 0.93 + 0.07 * Math.sin((age - 0.42) * 7.2 + eventSeed);
      return tail * flicker * flareStrengths[flareCursor];
    };
    regions.push({ spec, normal, activeGlow, flareGlow, loops, eventSeed, localFlarePulse });
  }

  const sunLight = new THREE.PointLight(0xfff2dd, 3.0, 0, 0); group.add(sunLight);
  return { group, light: sunLight, disc, activity, update(t) {
    const now = Number.isFinite(t) ? t : 0;
    uni.time.value = now;
    // Slow apparent spin and gently moving, independently timed prominences are visual only.
    activity.rotation.y = now * 0.0012;
    activity.rotation.x = 0.004 * Math.sin(now * 0.07 + radius * 11.7);
    let maxPulse = 0, brightestRegion = null;
    for (const region of regions) {
      const shimmer = 0.94 + 0.06 * Math.sin(now * 5.8 + region.eventSeed);
      const pulse = region.localFlarePulse(now) * shimmer;
      if (pulse > maxPulse) { maxPulse = pulse; brightestRegion = region; }
      region.activeGlow.material.opacity = 0.016 + 0.36 * pulse;
      region.activeGlow.scale.set(radius * (0.15 + 0.12 * pulse), radius * (0.11 + 0.085 * pulse), 1);
      const sway = Math.sin(now * 2.1 + region.eventSeed) * pulse;
      region.flareGlow.material.opacity = 0.008 + 0.56 * pulse;
      region.flareGlow.position.set(radius * 0.012 * sway, radius * 0.016 * Math.cos(now * 1.7 + region.eventSeed) * pulse,
        radius * (1.16 + 0.28 * pulse));
      region.flareGlow.scale.set(radius * (0.045 + 0.11 * pulse), radius * (0.075 + 0.17 * pulse), 1);
      for (const loop of region.loops) {
        const staggeredPulse = region.localFlarePulse(now - loop.delay) * shimmer;
        const flutter = 0.91 + 0.09 * Math.sin(now * (5.4 + loop.phase * 0.17) + loop.phase);
        const energy = Math.min(1, staggeredPulse * loop.gain * region.spec.gain * flutter);
        loop.root.position.set(radius * 0.004 * Math.sin(now * 1.3 + loop.phase) * energy,
          radius * 0.004 * Math.cos(now * 1.1 + loop.phase) * energy, radius * 0.985);
        loop.root.scale.set(0.94 + 0.10 * energy, 0.94 + 0.13 * energy,
          0.56 + 0.92 * energy + 0.035 * energy * Math.sin(now * 3.1 + loop.phase));
        loop.root.rotation.set(0.025 * energy * Math.sin(now * 1.6 + loop.phase),
          0.022 * energy * Math.cos(now * 1.4 + loop.phase), loop.azimuth + 0.035 * energy * Math.sin(now * 0.8 + loop.phase));
        loop.haloMat.opacity = 0.012 + 0.39 * energy;
        loop.coreMat.opacity = 0.020 + 0.72 * energy;
      }
    }
    if (brightestRegion) flareLight.position.copy(brightestRegion.normal).multiplyScalar(radius * 1.08);
    flareLight.intensity = 0.04 + 2.8 * maxPulse;
    flareLight.distance = radius * (0.72 + 0.95 * maxPulse);
    glowA.material.opacity = 0.40 + 0.16 * maxPulse;
    glowB.material.opacity = 0.10 + 0.10 * maxPulse;
  } };
}

// Shared, cached environment maps give the glossy mirror / photovoltaic surfaces a real scene to reflect.
const SPACE_ENVS = new WeakMap();
export function makeSpaceEnv(renderer, sunDir = new THREE.Vector3(-1, 0, 0)) {
  const d = sunDir.clone().normalize();
  const key = `${d.x.toFixed(3)},${d.y.toFixed(3)},${d.z.toFixed(3)}`;
  let cache = SPACE_ENVS.get(renderer);
  if (!cache) { cache = new Map(); SPACE_ENVS.set(renderer, cache); }
  if (cache.has(key)) return cache.get(key).texture;
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { sd: { value: d } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 sd; varying vec3 vD; void main(){ float s = max(dot(normalize(vD), sd), 0.0); vec3 c = vec3(0.04, 0.03, 0.025) + vec3(0.18, 0.12, 0.085) * (0.5 + 0.5 * vD.z) + vec3(1.0, 0.85, 0.6) * (pow(s, 300.0) * 40.0 + pow(s, 8.0) * 0.6); gl_FragColor = vec4(c, 1.0); }',
  })));
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.02); pm.dispose();
  cache.set(key, rt);
  return rt.texture;
}
