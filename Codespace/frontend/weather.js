// OCTO-EARTH – focused Earth climate view with a draggable no-mirror / space-mirror split comparison.
// Recorded missions use the model's with- and without-mirror temperatures; idle view uses a labelled 2.7-AU reference
// plus a default-design mirror calculation. The mirror ring is schematic display art, enlarged for visibility.
// Climate state comes from the Python model; NASA Earth/cloud maps, ice sheen, wind tracers, storms and ocean-flow
// streaks are illustrative and add no weather, optical, or orbit physics. Playback continues in the shared app loop.
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { fbm } from './pov.js';
import { createRealEarth, earthTextures } from './earthAssets.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const SUN_DIR = V3(1, 0, 0);                  // sunlight direction in this Earth-only scene
const N_WIND = 1300;                          // illustrative atmospheric wind tracers
const N_OCEAN = 900;                          // illustrative ocean-flow tracers, not an ocean simulation
const DEFAULT_LIFE = { dT: 45, T_ice: 263, T_grow: [278, 313] };   // same numbers as LIFE_* in octoearth_rl.py

function hash(i, k) { let h = Math.imul(i + 1, 374761393) ^ Math.imul(k + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const num = (v, d = 1) => (v !== null && v !== undefined && Number.isFinite(+v)) ? (+v).toFixed(d) : 'N/A';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tempC = (k, d = 1) => { const c = k - 273.15; return `${c < 0 ? '−' : ''}${Math.abs(c).toFixed(d)} °C`; };

/**
 * Life indicators from the global-mean temperature T [K] – the JavaScript twin of octoearth_rl.life_indicators.
 * Local temperature at latitude lat: T(lat) = T + dT/3 - dT * sin(lat)^2 (its area average is exactly T).
 */
export function lifeFromT(T, L = DEFAULT_LIFE) {
  const dT = L.dT, Tice = L.T_ice, [g0, g1] = L.T_grow;
  const Tat = (x) => T + dT / 3 - dT * x * x;                       // x = sin(latitude)
  const xIce = clamp(Math.sqrt(Math.max(0, (T + dT / 3 - Tice) / dT)), 0, 1);
  let grow = 0; const n = 400;
  for (let k = 0; k < n; k++) { const x = (k + 0.5) / n, t = Tat(x); if (t >= g0 && t <= g1) grow += 1 / n; }
  const state = xIce <= 0 ? 'snowball (frozen to the equator)' : T > 313 ? 'hothouse' : xIce < 0.5 ? 'cold, ice to mid-latitudes'
    : T < 278 ? 'cool, large ice caps' : 'temperate, like today';
  return { T_equator_K: Tat(0), T_pole_K: Tat(1), ice_line_deg: Math.asin(xIce) / D2R, liquid_frac: xIce, grow_frac: grow, state, Tat };
}

// Same albedo branches and effective greenhouse emissivity as climate_equilibrium() in octoearth_rl.py.
// The one-box equilibrium is used for the idle/reference calculation; missions still use the recorded two-box model.
const SIGMA_SB = 5.670374419e-8, EARTH_RADIUS_M = 6.371e6, EARTH_SPHERE_M2 = 4 * Math.PI * EARTH_RADIUS_M ** 2;
const CLIM_EPS = 1361.0 * (1 - 0.30) / 4 / (SIGMA_SB * 288.0 ** 4);
const DEFAULT_MIRROR_CAP_1AU = 1.6e15 * Math.cos(Math.PI / 4) * 0.90 / (Math.PI * EARTH_RADIUS_M ** 2);
function previewAlbedo(T) { return T >= 280 ? 0.30 : T <= 255 ? 0.60 : 0.30 + 0.30 * (280 - T) / 25; }
export function climateEquilibrium(sRel, q_w = 0) {
  const imbalance = (T) => sRel * 1361.0 * (1 - previewAlbedo(T)) / 4 + q_w / EARTH_SPHERE_M2 - CLIM_EPS * SIGMA_SB * T ** 4;
  let lo = imbalance(280) > 0 ? 280 : 100, hi = lo === 280 ? 450 : 280;
  for (let i = 0; i < 100; i++) { const mid = 0.5 * (lo + hi); if (imbalance(mid) > 0) lo = mid; else hi = mid; }
  return 0.5 * (lo + hi);
}
/** No-mirror equilibrium plus a labelled, default-design mirror-ring comparison for the idle/reference view. */
export function climatePreviewState(rAU = 2.7, mirrorOptions = {}) {
  const sun = 1 / (rAU * rAU), Tno = climateEquilibrium(sun);
  const mirrorOn = mirrorOptions.mirrorsOn !== false;
  const cap1AU = Number.isFinite(mirrorOptions.capRel1AU) ? Math.max(0, mirrorOptions.capRel1AU) : DEFAULT_MIRROR_CAP_1AU;
  const capRel = mirrorOn ? cap1AU * sun : 0;
  const mirrorNeedRel = Math.max(0, 1 - sun); // illustrative design target: restore today's total sunlight
  const mirRel = Math.min(capRel, mirrorNeedRel);
  const Twith = climateEquilibrium(sun + mirRel);
  return { preview: true, mirrorPreview: true, mirrorOn, mirrorCanReachTarget: mirRel + 1e-9 >= mirrorNeedRel,
    mirrorNeedRel, t: 0, T: Tno, Tno, Twith, sun, mirRel, capRel,
    noTxt: lifeFromT(Tno).state, withTxt: lifeFromT(Twith).state, rAU, md: mirrorOptions.md || null, life: DEFAULT_LIFE };
}

// ---------------------------------------------------------------- procedural storm texture (small, one-time asset)
/** A spiral cloud texture for cyclones (transparent outside the spiral arms). */
function spiralTexture() {
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), img = g.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2), r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
    const arm = 0.5 + 0.5 * Math.cos(2 * (th - 3.2 * Math.log(r + 0.05)));
    const eye = clamp((r - 0.06) / 0.08, 0, 1), fall = clamp(1 - r, 0, 1);
    const al = clamp(arm * 1.4 - 0.25, 0, 1) * fall * eye + 0.35 * fall * fall * eye;
    const o = (y * S + x) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = 255 * clamp(al, 0, 1);
  }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- the view
export function createWeatherView(renderer, canvas, container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x100b08);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 5000); camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 1.35; controls.maxDistance = 18; controls.enabled = false;
  const P = { active: false, labels: true, T: 288, Tno: 288, Twith: 288, sun: 1, mirRel: 0, capRel: 0,
    life: lifeFromT(288), S: null, panelWall: 0, split: 0.5, dragging: false };

  // Illumination only: no Sun marker or simulated mirror-light surrogate; the comparison ring below is static display art.
  scene.add(new THREE.AmbientLight(0x78604d, 0.18));
  const sunLight = new THREE.DirectionalLight(0xfff6e8, 1.2); sunLight.position.copy(SUN_DIR).multiplyScalar(50); scene.add(sunLight);

  // One large Earth fills the view: bundled NASA day/night/cloud imagery, animated cloud layer, flow tracers and storms.
  // Keep the same parent tilt-group contract as the earlier working Weather scene. All Earth-surface
  // layers, flow tracers and labels share this axis so camera-relative labels stay attached while rotating.
  const tilt = new THREE.Group(); scene.add(tilt); tilt.rotation.y = 23.44 * D2R;
  const earthVisual = createRealEarth(renderer, { segments: 160, spinRate: 0, cloudRate: 0.0045 });
  earthVisual.setSun(SUN_DIR); earthVisual.cloudUniforms.fade.value = 0.58; tilt.add(earthVisual.group);
  const spin = earthVisual.spin;
  // A lightweight ice sheen communicates the no-mirror equilibrium without rebuilding large map textures per frame.
  const climateMat = new THREE.MeshStandardMaterial({ color: 0xc9e9ff, emissive: 0x152b3d, emissiveIntensity: 0.12,
    roughness: 0.42, metalness: 0.01, transparent: true, opacity: 0, depthWrite: false, side: THREE.FrontSide });
  const climateShell = new THREE.Mesh(new THREE.SphereGeometry(1.006, 112, 56), climateMat); climateShell.rotation.x = Math.PI / 2; spin.add(climateShell);
  // Schematic ring of small Earth-orbiting mirrors. Their rendered orbit is compressed to 3.2 R_E; the model's
  // stated hardware orbit is 20 R_E. Panels and ring are visible only on the mirror-on half of the comparison.
  const MIRROR_R_DRAW = 3.2, N_CLIMATE_MIRRORS = 36;
  const mirrorGroup = new THREE.Group(); scene.add(mirrorGroup);
  const mirrorPanels = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.24, 0.018),
    new THREE.MeshPhysicalMaterial({ color: 0xeaf5ff, side: THREE.DoubleSide, metalness: 0.98, roughness: 0.045,
      clearcoat: 1, clearcoatRoughness: 0.02, emissive: 0x7f4a2f, emissiveIntensity: 0.18 }), N_CLIMATE_MIRRORS);
  mirrorPanels.name = 'schematic Earth space-mirror ring (display only)'; mirrorPanels.frustumCulled = false; mirrorGroup.add(mirrorPanels);
  const mirrorOrbit = new THREE.Mesh(new THREE.TorusGeometry(MIRROR_R_DRAW, 0.018, 6, 180),
    new THREE.MeshBasicMaterial({ color: 0xffc487, transparent: true, opacity: 0.36, depthWrite: false, blending: THREE.AdditiveBlending }));
  mirrorOrbit.rotation.y = Math.PI / 2; mirrorGroup.add(mirrorOrbit);
  const mirrorQ = new THREE.Quaternion(), mirrorM = new THREE.Matrix4(), mirrorPos = V3(), mirrorNormal = V3(), mirrorScale = V3(1, 1, 1);
  for (let k = 0; k < N_CLIMATE_MIRRORS; k++) {
    const a = 2 * Math.PI * k / N_CLIMATE_MIRRORS, cy = Math.cos(a), sz = Math.sin(a);
    mirrorPos.set(0, MIRROR_R_DRAW * cy, MIRROR_R_DRAW * sz);
    // Normal halfway between the Sun-facing direction (+X) and the direction from each panel back to Earth.
    mirrorNormal.set(1, -cy, -sz).normalize();
    mirrorQ.setFromUnitVectors(V3(0, 0, 1), mirrorNormal);
    mirrorM.compose(mirrorPos, mirrorQ, mirrorScale); mirrorPanels.setMatrixAt(k, mirrorM);
  }
  mirrorPanels.instanceMatrix.needsUpdate = true; mirrorGroup.visible = false;
  const cloudTropics = new THREE.Group(), cloudMid = new THREE.Group(); spin.add(cloudTropics); spin.add(cloudMid);
  const spiralTex = spiralTexture(), cyclones = [];
  const addCyclone = (parent, latD, lonD, size, nh, tropical) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: spiralTex, transparent: true, depthWrite: false, roughness: 1, side: THREE.DoubleSide }));
    const r = tropical ? 1.016 : 1.021, la = latD * D2R, lo = lonD * D2R;
    const p = V3(Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la));
    m.position.copy(p).multiplyScalar(r); m.lookAt(p.clone().multiplyScalar(2));
    const holder = new THREE.Group(); holder.add(m); parent.add(holder);
    cyclones.push({ m, nh, tropical, spinRate: (nh ? 1 : -1) * (tropical ? 1.6 : 0.8) });   // counter-clockwise in the north
  };
  [[48, 20], [55, 140], [43, 250], [-50, 70], [-56, 200], [-46, 310]].forEach(([la, lo], k) => addCyclone(cloudMid, la, lo, 0.42 + 0.08 * (k % 3), la > 0, false));
  [[16, 100], [-14, 280]].forEach(([la, lo]) => addCyclone(cloudTropics, la, lo, 0.22, la > 0, true));
  // wind tracers: short streaks that follow the three-cell circulation (relative to the spinning surface)
  const wind = { lat: new Float32Array(N_WIND), lon: new Float32Array(N_WIND), age: new Float32Array(N_WIND), life: new Float32Array(N_WIND) };
  const windPos = new Float32Array(N_WIND * 6), windCol = new Float32Array(N_WIND * 6), windGeo = new THREE.BufferGeometry();
  windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3)); windGeo.setAttribute('color', new THREE.BufferAttribute(windCol, 3));
  const windLines = new THREE.LineSegments(windGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  windLines.name = 'illustrative atmospheric wind-flow streaks'; windLines.userData.displayOnly = true;
  windLines.frustumCulled = false; spin.add(windLines);
  const respawn = (k, seed) => { wind.lat[k] = Math.asin(2 * hash(k, seed) - 1); wind.lon[k] = 2 * Math.PI * hash(seed, k); wind.age[k] = 0; wind.life[k] = 2.5 + 4 * hash(k + 9, seed); };
  for (let k = 0; k < N_WIND; k++) { respawn(k, 1); wind.age[k] = wind.life[k] * hash(k, 77); }
  /** Surface wind of the three-cell circulation at latitude lat [rad]: east-west u and north-south v (visual units). */
  function windAt(lat, lon, t) {
    const a = Math.abs(lat);
    const u = -Math.sin(6 * a) * 0.11 + 0.025 * Math.sin(3 * lon + 0.4 * t + 5 * lat);   // trades (east) / westerlies / polar easterlies
    const v = -Math.sin(6 * lat) * 0.035 + 0.015 * Math.cos(2 * lon - 0.3 * t + 7 * lat); // toward the rain belt, poleward 30-60
    return [u, v];
  }
  // Ocean-surface current streaks are a separate illustration, kept on the ocean mask when it is available.
  // Their gyre-like flow is an animation only; it is not a computed ocean circulation or climate-model state.
  const ocean = { lat: new Float32Array(N_OCEAN), lon: new Float32Array(N_OCEAN), age: new Float32Array(N_OCEAN), life: new Float32Array(N_OCEAN) };
  const oceanPos = new Float32Array(N_OCEAN * 6), oceanCol = new Float32Array(N_OCEAN * 6), oceanGeo = new THREE.BufferGeometry();
  oceanGeo.setAttribute('position', new THREE.BufferAttribute(oceanPos, 3)); oceanGeo.setAttribute('color', new THREE.BufferAttribute(oceanCol, 3));
  const oceanLines = new THREE.LineSegments(oceanGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
  oceanLines.name = 'schematic ocean-current flow streaks'; oceanLines.userData.displayOnly = true;
  oceanLines.frustumCulled = false; spin.add(oceanLines);
  const texSet = earthTextures(renderer), maskCanvas = document.createElement('canvas'), maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  let oceanMask = null, maskW = 0, maskH = 0;
  function cacheOceanMask(texture) {
    const image = texture && texture.image;
    if (!image || !image.width || image.width < 2 || !image.height) return;
    try {
      maskCanvas.width = image.width; maskCanvas.height = image.height;
      maskCtx.clearRect(0, 0, image.width, image.height); maskCtx.drawImage(image, 0, 0);
      oceanMask = maskCtx.getImageData(0, 0, image.width, image.height).data; maskW = image.width; maskH = image.height;
    } catch (e) { oceanMask = null; maskW = maskH = 0; }
  }
  if (texSet.ocean && texSet.ocean.image && texSet.ocean.image.width > 1) cacheOceanMask(texSet.ocean);
  texSet.listeners.push((key, texture) => { if (key === 'ocean') cacheOceanMask(texture); });
  function isOcean(lat, lon) {
    const la = clamp(lat, -Math.PI / 2, Math.PI / 2);
    if (oceanMask && maskW > 1 && maskH > 1) {
      const u = ((0.5 + ((lon % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI)) % 1);
      const x = Math.min(maskW - 1, Math.floor(u * maskW));
      const y = Math.min(maskH - 1, Math.max(0, Math.floor((0.5 - la / Math.PI) * maskH)));
      return oceanMask[(y * maskW + x) * 4] > 105; // bundled grayscale mask: bright = water
    }
    // Procedural fallback uses the same seeded continent field as the climate-color overlay.
    const c = Math.cos(la), x = c * Math.cos(lon), z = c * Math.sin(lon);
    return fbm(x * 1.9 + 7, Math.sin(la) * 1.9 + 3, z * 1.9 + 11, 4) <= 0.53;
  }
  const respawnOcean = (k, seed) => {
    let la = 0, lo = 0, found = false;
    for (let j = 0; j < 36; j++) {
      la = Math.asin(2 * hash(k + j * 19, seed + 31) - 1); lo = 2 * Math.PI * hash(seed + j * 7, k + 53);
      if (isOcean(la, lo)) { found = true; break; }
    }
    if (!found) { la = 0.15 * Math.sin(k * 1.7); lo = 2 * Math.PI * hash(k, seed); }
    ocean.lat[k] = la; ocean.lon[k] = lo; ocean.age[k] = 0; ocean.life[k] = 4 + 6 * hash(k + 11, seed + 9);
  };
  for (let k = 0; k < N_OCEAN; k++) { respawnOcean(k, 1); ocean.age[k] = ocean.life[k] * hash(k, 91); }
  function currentAt(lat, lon, t) {
    const band = Math.tanh((Math.abs(lat) - 0.34) * 5.2);
    const u = 0.038 * band + 0.012 * Math.sin(2 * lon + 0.09 * t) + 0.008 * Math.cos(3 * lon - 0.05 * t);
    const v = 0.018 * Math.sin(2 * lon + 0.07 * t) * Math.sin(2 * lat) + 0.009 * Math.cos(3 * lon - 0.04 * t);
    return [u, v];
  }
  function updateOcean(dt, t) {
    let o = 0;
    for (let k = 0; k < N_OCEAN; k++) {
      ocean.age[k] += dt;
      const la0 = ocean.lat[k], lo0 = ocean.lon[k], [u, v] = currentAt(la0, lo0, t), cl = Math.max(0.2, Math.cos(la0));
      const la1 = la0 + v * dt * 1.8, lo1 = lo0 + u * dt / cl * 1.8;
      if (ocean.age[k] > ocean.life[k] || Math.abs(la1) > 1.48 || !isOcean(la1, lo1)) {
        respawnOcean(k, Math.floor(t * 13) + k); oceanPos.fill(0, o, o + 6); oceanCol.fill(0, o, o + 6); o += 6; continue;
      }
      ocean.lat[k] = la1; ocean.lon[k] = lo1;
      const tail = 0.42, latTail = la1 - v * tail * 1.8, lonTail = lo1 - u * tail / cl * 1.8;
      const tailOnWater = isOcean(latTail, lonTail), R = 1.031;
      const x0 = tailOnWater ? R * Math.cos(latTail) * Math.cos(lonTail) : R * Math.cos(la1) * Math.cos(lo1);
      const y0 = tailOnWater ? R * Math.cos(latTail) * Math.sin(lonTail) : R * Math.cos(la1) * Math.sin(lo1);
      const z0 = tailOnWater ? R * Math.sin(latTail) : R * Math.sin(la1);
      const x1 = R * Math.cos(la1) * Math.cos(lo1), y1 = R * Math.cos(la1) * Math.sin(lo1), z1 = R * Math.sin(la1);
      oceanPos.set([x0, y0, z0, x1, y1, z1], o);
      const fade = Math.sin(Math.PI * clamp(ocean.age[k] / ocean.life[k], 0, 1)), sp = clamp(Math.hypot(u, v) / 0.05, 0, 1);
      const r = 0.06 * fade, g = (0.42 + 0.34 * sp) * fade, b = (0.72 + 0.27 * sp) * fade;
      oceanCol.set([r * 0.12, g * 0.12, b * 0.15, r, g, b], o); o += 6;
    }
    oceanGeo.attributes.position.needsUpdate = true; oceanGeo.attributes.color.needsUpdate = true;
    oceanLines.material.opacity = 0.72;
  }

  // Read-only flow labels and a worked climate card accompany the globe; the split divider is a separate accessible control.
  const LCOL = { wind: '#67d8ff', ocean: '#36bfff', ice: '#e8f6ff' };
  const LBL = {};
  for (const [k, col] of Object.entries(LCOL)) { const d = document.createElement('div'); d.className = 'blabel mono small povlbl'; d.style.color = col; d.style.display = 'none'; container.appendChild(d); LBL[k] = d; }
  const panel = document.createElement('div'); panel.id = 'wxPanel'; panel.className = 'small'; panel.hidden = true; container.appendChild(panel);
  const compare = document.createElement('div'); compare.id = 'wxCompare'; compare.className = 'wxCompare'; compare.hidden = true;
  compare.innerHTML = `<div class="wxCompareLabels" aria-hidden="true"><span class="wxNoLabel">NO MIRROR RING</span><span class="wxWithLabel">SPACE-MIRROR RING</span></div>
    <div class="wxCompareDivider" role="slider" tabindex="0" aria-orientation="horizontal" aria-valuemin="8" aria-valuemax="92" aria-valuenow="50"
      aria-valuetext="50 percent no-mirror, 50 percent mirror-ring view" aria-label="Drag to compare Earth without mirrors and with the space-mirror ring"><span class="wxCompareGrip">◀　▶</span></div>
    <div class="wxCompareHint" aria-hidden="true">DRAG DIVIDER TO COMPARE · ring artwork enlarged for visibility</div>`;
  container.appendChild(compare);
  const divider = compare.querySelector('.wxCompareDivider');
  const setSplit = (value) => {
    P.split = clamp(value, 0.08, 0.92); compare.style.setProperty('--wx-split', `${(P.split * 100).toFixed(1)}%`);
    const pct = Math.round(P.split * 100); divider.setAttribute('aria-valuenow', String(pct));
    divider.setAttribute('aria-valuetext', `${pct} percent no-mirror, ${100 - pct} percent mirror-ring view`);
  };
  const splitAt = (clientX) => { const rect = canvas.getBoundingClientRect(); if (rect.width > 0) setSplit((clientX - rect.left) / rect.width); };
  divider.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    P.dragging = true; splitAt(e.clientX); divider.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
  });
  divider.addEventListener('pointermove', (e) => { if (P.dragging) { splitAt(e.clientX); e.preventDefault(); } });
  const endSplitDrag = (e) => { P.dragging = false; if (divider.hasPointerCapture(e.pointerId)) divider.releasePointerCapture(e.pointerId); };
  divider.addEventListener('pointerup', endSplitDrag); divider.addEventListener('pointercancel', endSplitDrag);
  divider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault(); setSplit(e.key === 'Home' ? 0.08 : e.key === 'End' ? 0.92 : P.split + (e.key === 'ArrowRight' ? 0.02 : -0.02));
    }
  });
  setSplit(P.split);

  const _lv = V3();
  function label(k, pos, text) {
    const el = LBL[k];
    if (!P.labels || !pos || !text) { el.style.display = 'none'; return; }
    _lv.copy(pos).project(camera);
    if (_lv.z > 1 || Math.abs(_lv.x) > 1 || Math.abs(_lv.y) > 1) { el.style.display = 'none'; return; }
    if (el.textContent !== text) el.textContent = text; el.style.display = 'block';
    const w = canvas.clientWidth, h = canvas.clientHeight;
    el.style.left = `${clamp((_lv.x * 0.5 + 0.5) * w + 8, 2, w - el.offsetWidth - 2)}px`; el.style.top = `${clamp((-_lv.y * 0.5 + 0.5) * h - 6, 2, h - el.offsetHeight - 2)}px`;
  }
  function hideLabels() { for (const el of Object.values(LBL)) el.style.display = 'none'; }
  /** A point at latitude latD on the meridian that faces the camera (shifted by dLon), in world coordinates. */
  const _axis = V3(), _c = V3(), _e = V3();
  function facingPoint(latD, dLonD, r = 1.03) {
    _axis.set(0, 0, 1).applyQuaternion(tilt.quaternion);
    _c.copy(camera.position).normalize(); _c.addScaledVector(_axis, -_c.dot(_axis)); if (_c.lengthSq() < 1e-6) _c.set(1, 0, 0); _c.normalize();
    _c.applyAxisAngle(_axis, dLonD * D2R); const la = latD * D2R;
    const p = V3().copy(_c).multiplyScalar(Math.cos(la)).addScaledVector(_axis, Math.sin(la)).multiplyScalar(r);
    _e.copy(camera.position).normalize(); return p.dot(_e) > 0.25 ? p : null;
  }

  function lookDefault() { camera.position.set(6.1, -7.1, 3.2); controls.target.set(0, 0, 0); controls.update(); }
  lookDefault();

  // ---------------------------------------------------------------- per-frame update
  let wallSpin = 0;
  /** Update only small uniforms/particle buffers here; never rebuild a large climate texture in the render loop. */
  function update(S, dt, wall) {
    P.S = S;
    const L = S.life || DEFAULT_LIFE;
    const rAU = Number.isFinite(S.rAU) && S.rAU > 0 ? S.rAU : 1;
    const sun = Number.isFinite(S.sun) && S.sun > 0 ? S.sun : 1 / (rAU * rAU);
    const qW = Number.isFinite(S.q_w_W) ? S.q_w_W : 0;
    // The recorded no-mirror counterfactual wins; idle view solves the same albedo/effective-emissivity equilibrium.
    const T = Number.isFinite(S.Tno) ? S.Tno : climateEquilibrium(sun, qW);
    const Twith = Number.isFinite(S.Twith) ? S.Twith : Number.isFinite(S.T) ? S.T : T;
    P.T = T; P.Tno = T; P.Twith = Twith; P.rAU = rAU; P.sun = sun;
    P.mirRel = Number.isFinite(S.mirRel) ? Math.max(0, S.mirRel) : 0;
    P.capRel = Number.isFinite(S.capRel) ? Math.max(0, S.capRel) : 0;
    P.qW = qW; P.S = S; P.life = lifeFromT(T, L); P.mirrorOn = S.mirrorOn !== false;
    const frozen = clamp((L.T_ice + 12 - T) / 45, 0, 1);
    climateShell.visible = frozen > 0.015;
    climateMat.opacity = 0.86 * frozen;
    earthVisual.uniforms.nightGain.value = 0;
    sunLight.intensity = 2.6 * Math.sqrt(clamp(sun, 0, 2));

    // Wall-clock animation is deliberately decoupled from mission time. The view cannot pause the playback engine.
    wallSpin += dt;
    spin.rotation.z = 2 * Math.PI * wallSpin / 80;
    earthVisual.setSun(SUN_DIR); earthVisual.update(dt);
    earthVisual.cloudUniforms.fade.value = 0.42;
    cloudTropics.rotation.z = -0.018 * wallSpin;
    cloudMid.rotation.z = 0.03 * wallSpin;
    for (const c of cyclones) {
      c.m.rotateZ(c.spinRate * dt);
      c.m.material.opacity = c.tropical ? 0.18 : 0.34;
    }

    // Animated wind tracers.
    const tw = wallSpin; let o = 0;
    for (let k = 0; k < N_WIND; k++) {
      wind.age[k] += dt;
      if (wind.age[k] > wind.life[k] || Math.abs(wind.lat[k]) > 1.45) respawn(k, Math.floor(wall * 10) + k);
      const la = wind.lat[k], lo = wind.lon[k], [u, v] = windAt(la, lo, tw), cl = Math.max(0.2, Math.cos(la));
      wind.lon[k] = lo + u * dt / cl * 2.2; wind.lat[k] = la + v * dt * 2.2;
      const tail = 0.35, la0 = la - v * tail * 2.2, lo0 = lo - u * tail / cl * 2.2, R = 1.026;
      windPos[o] = R * Math.cos(la0) * Math.cos(lo0); windPos[o + 1] = R * Math.cos(la0) * Math.sin(lo0); windPos[o + 2] = R * Math.sin(la0);
      windPos[o + 3] = R * Math.cos(la) * Math.cos(lo); windPos[o + 4] = R * Math.cos(la) * Math.sin(lo); windPos[o + 5] = R * Math.sin(la);
      const f = Math.sin(Math.PI * clamp(wind.age[k] / wind.life[k], 0, 1)), sp = clamp(Math.hypot(u, v) / 0.11, 0, 1);
      const cr = (0.30 + 0.60 * sp) * f, cg = (0.62 + 0.32 * sp) * f, cb = f;
      windCol.set([cr * 0.12, cg * 0.12, cb * 0.12, cr, cg, cb], o); o += 6;
    }
    windGeo.attributes.position.needsUpdate = true; windGeo.attributes.color.needsUpdate = true;
    windLines.material.opacity = 0.88;
    updateOcean(dt, tw);
    if (wall - P.panelWall > 0.25) { P.panelWall = wall; renderPanel(); }
  }

  // Worked energy-balance comparison; mission values are recorded model outputs, idle values are labelled equilibria.
  function renderPanel() {
    const S = P.S; if (!S) return;
    const L = S.life || DEFAULT_LIFE, withLife = lifeFromT(P.Twith, L);
    const snowball = P.life.ice_line_deg < 1 || P.Tno < 200;
    const state = snowball ? 'SNOWBALL EARTH · ICE TO EQUATOR' : esc(P.life.state).toUpperCase();
    const source = S.preview ? `REFERENCE · ${num(P.rAU, 2)} AU` : S.has ? `MISSION · YEAR ${Math.round(S.t).toLocaleString('en-US')}` : 'MODEL EQUILIBRIUM';
    const motion = S.activity || (S.playing ? 'PLAYBACK RUNNING' : 'CLIMATE VIEW');
    const geometricSunFlux = 1361 / (P.rAU * P.rAU), sunFlux = 1361 * P.sun, mirrorFlux = 1361 * P.mirRel, totalFlux = sunFlux + mirrorFlux;
    const aNo = previewAlbedo(P.Tno), aWith = previewAlbedo(P.Twith);
    const eqNo = climateEquilibrium(P.sun, P.qW), eqWith = climateEquilibrium(P.sun + P.mirRel, P.qW);
    const mirrorState = S.preview ? (S.mirrorOn === false ? 'mirror system disabled in the selected configuration'
      : S.mirrorCanReachTarget ? 'default design can restore 1.0× today’s sunlight' : 'selected mirror capacity cannot restore 1.0× today’s sunlight')
      : (P.mirrorOn ? 'mirror light follows the recorded mission' : 'mirror ring disabled in this mission configuration');
    const mirrorKind = S.preview ? 'ILLUSTRATIVE DEFAULT-DESIGN SCENARIO' : 'RECORDED TWO-BOX MODEL';
    const noLabel = `${num(P.Tno, 1)} K <span>${tempC(P.Tno)}</span>`;
    const withLabel = `${num(P.Twith, 1)} K <span>${tempC(P.Twith)}</span>`;
    const earthBlackBody = Math.pow(1361.0 * (1 - 0.294) / (4 * SIGMA_SB), 0.25);
    const note = S.preview ? 'Preview: no-mirror equilibrium versus the configured default mirror design aimed to restore today’s total sunlight; not a mission result.'
      : 'Mission temperatures are time-integrated surface/deep-ocean model outputs. The no-mirror value is the model equilibrium counterfactual using the same sunlight and recorded waste heat.';
    const h = `<div class="wxKicker">EARTH · SPACE-MIRROR RING COMPARISON</div>
      <div class="wxDistance">${num(P.rAU, 3)} AU from the Sun · ${source}</div>
      <div class="wxScenario"><span>${mirrorKind}</span><span>${esc(motion)}</span></div>
      <div class="wxTempCompare">
        <div class="wxTempCard noMirror"><span>WITHOUT MIRRORS</span><b>${noLabel}</b><small>A = ${num(aNo, 3)} · ${esc(state)}</small></div>
        <div class="wxTempCard withMirror"><span>WITH MIRROR RING</span><b>${withLabel}</b><small>A = ${num(aWith, 3)} · ${esc(withLife.state)}</small></div>
      </div>
      <div class="wxFlows"><span><i class="windMark"></i>wind flow (illustrative)</span><span><i class="oceanMark"></i>ocean flow (illustrative)</span></div>
      <div class="wxCalcTitle">SUNLIGHT &amp; MIRROR INPUT</div>
      <div class="wxCalcRows">
        <div><span>Distance-law sunlight, S₀/r²</span><b>1361 / (${num(P.rAU, 3)}²) = ${num(geometricSunFlux, 1)} W/m²</b></div>
        <div><span>Model sunlight (shade included)</span><b>1361 × ${num(P.sun, 4)} = ${num(sunFlux, 1)} W/m²</b></div>
        <div><span>Mirror contribution</span><b>+${num(P.mirRel, 4)} × today = +${num(mirrorFlux, 1)} W/m²</b></div>
        <div><span>Total light used by model</span><b>${num(totalFlux, 1)} W/m²</b></div>
        <div><span>Mirror capacity at this distance</span><b>${num(P.capRel, 3)} × today</b></div>
        <div><span>Recorded waste heat reaching Earth</span><b>${num(P.qW, 3)} W</b></div>
      </div>
      <div class="wxFormula" data-formula="climate-balance" role="button" tabindex="0" title="Click to inspect the climate energy-balance calculation"><b>Equilibrium formula</b><code>T<sub>eq</sub> = {[(S<sub>sun</sub> + S<sub>mirror</sub>)(1−A)/4 + q<sub>w</sub>/(4πR<sub>E</sub>²)] / (ε<sub>eff</sub>σ)}<sup>1/4</sup></code>
        <div>No mirrors: ${num(eqNo, 1)} K · with recorded/illustrative mirror input: ${num(eqWith, 1)} K</div>
        <small>Albedo A(T): 0.30 at ≥280 K; 0.60 at ≤255 K; linear between. ε<sub>eff</sub> = 0.6105 is a fixed effective greenhouse emissivity calibrated to 288 K at 1 AU and A = 0.30; σ = 5.670374419×10⁻⁸ W m⁻² K⁻⁴.</small>
      </div>
      <div class="wxModelNote"><b>Model vs. equilibrium:</b> ${esc(note)} The active mission integrates a two-box surface/deep-ocean model with heat exchange; the formula above is its equilibrium reference, not a substitute for that time history.</div>
      <div class="wxReference"><b>Separate Earth reference · 1 AU, not this scenario</b>
        <span>Black-body (ε = 1, NASA Bond A = 0.294): ${num(earthBlackBody, 1)} K · NASA mean surface: 288.15 K (15 °C).</span>
        <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" target="_blank" rel="noopener noreferrer">NASA NSSDC Earth Fact Sheet ↗</a></div>
      <div class="wxMirrorNote">${esc(mirrorState)}. Mirror panels are schematic display art, drawn at 3.2 Earth radii (the configured orbit is 20 Earth radii); no optics or new climate physics is added by this view.</div>`;
    if (panel.innerHTML !== h) panel.innerHTML = h;
  }

  function placeLabels() {
    if (!P.labels) { hideLabels(); return; }
    const frozen = P.life.ice_line_deg < 1 || P.T < 200;
    label('wind', facingPoint(42, 18), 'WIND FLOW');
    label('ocean', facingPoint(-12, 135), frozen ? 'OCEAN FLOW · UNDER ICE' : 'OCEAN FLOW');
    label('ice', facingPoint(0, -40), frozen ? 'SNOWBALL · ICE TO EQUATOR' : `ICE LINE ${num(P.life.ice_line_deg, 0)}°`);
    const placed = [];
    for (const el of Object.values(LBL)) {
      if (el.style.display === 'none') continue;
      let y = parseFloat(el.style.top), x = parseFloat(el.style.left); const w = el.offsetWidth, hh = el.offsetHeight;
      for (let n = 0; n < 8; n++) { const hit = placed.find((b) => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + hh > b.y); if (!hit) break; y = hit.y + hit.h + 2; }
      el.style.top = `${y}px`; placed.push({ x, y, w, h: hh });
    }
  }
  function applyComparisonSide(withMirrors) {
    const L = (P.S && P.S.life) || DEFAULT_LIFE, Tside = withMirrors ? P.Twith : P.Tno;
    const frozen = clamp((L.T_ice + 12 - Tside) / 45, 0, 1);
    climateShell.visible = frozen > 0.015; climateMat.opacity = 0.86 * frozen;
    climateMat.color.setHex(withMirrors ? 0xc7efff : 0xc9e9ff);
    mirrorGroup.visible = !!withMirrors;
    sunLight.intensity = 2.6 * Math.sqrt(clamp(P.sun + (withMirrors ? P.mirRel : 0), 0, 2));
  }
  function render() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    camera.aspect = w / h;
    camera.clearViewOffset(); camera.updateProjectionMatrix();
    controls.update(); camera.updateMatrixWorld(); scene.updateMatrixWorld(); hideLabels();
    const splitX = Math.max(1, Math.min(w - 1, Math.round(w * P.split)));
    renderer.setScissorTest(true);
    applyComparisonSide(false); renderer.setScissor(0, 0, splitX, h); renderer.render(scene, camera);
    applyComparisonSide(true); renderer.setScissor(splitX, 0, w - splitX, h); renderer.render(scene, camera);
    renderer.setScissorTest(false);
  }
  function setActive(on) {
    const entering = !!on && !P.active;
    P.active = !!on; controls.enabled = !!on; panel.hidden = !on; compare.hidden = !on;
    if (entering) lookDefault();
    if (!on) { hideLabels(); mirrorGroup.visible = false; renderer.setScissorTest(false); }
    else renderPanel();
  }
  return { scene, camera, controls, P, update, render, setActive, hideLabels, lookDefault, panel, compare, setSplit };
}
