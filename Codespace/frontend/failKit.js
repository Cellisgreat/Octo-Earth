// OCTO-EARTH "failed attempts" page (update p38): shared scaffolding for the independent model views.
// Each model has its own scene, camera, controls, labels and right-hand HUD panel. The panel DOM is built ONCE
// (buttons / sliders / chart); only its '.dyn' part is rewritten, so dragging a slider is never interrupted.
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createRealEarth, createStarfield, createSun } from './earthAssets.js';
import { createLabels, esc } from './cineKit.js';

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;

/** Add a compact, explicitly schematic solar-system context: Sun, Earth's 1-AU orbit, 2.7-AU target orbit,
 *  plus a Moon and lunar orbit. It is visual context only; it does not alter any model physics. Earth/Sun separation
 *  and lunar distance are deliberately compressed so both the local failed-attempt mechanism and the context can
 *  be explored with camera POVs. Pass an existing createSun() object to avoid a duplicate Sun. */
export function addSolarOrbitContext(scene, opt = {}) {
  const o = {
    sunPosition: [-60, 0, 0], earthPosition: [0, 0, 0], auScale: 60, targetAU: 2.7,
    sunRadius: 4.5, moonOrbitRadius: 4.0, moonRadius: 0.273, moonPhase: -Math.PI / 2,
    sunObject: null, addSun: true, ...opt,
  };
  const asVector = (v) => v && v.isVector3 ? v.clone() : V3(...v);
  const sunPosition = asVector(o.sunPosition), earthPosition = asVector(o.earthPosition);
  const context = new THREE.Group(); context.name = 'schematic solar-system context'; scene.add(context);
  const sun = o.sunObject || (o.addSun ? createSun(o.sunRadius) : null);
  if (sun) { sun.group.position.copy(sunPosition); if (!sun.group.parent) scene.add(sun.group); }
  const loop = (center, radius, material, count = 192) => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const a = 2 * Math.PI * i / count;
      pts.push(V3(center.x + radius * Math.cos(a), center.y + radius * Math.sin(a), center.z));
    }
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), material);
    line.frustumCulled = false; context.add(line); return line;
  };
  const earthOrbit = loop(sunPosition, o.auScale, new THREE.LineBasicMaterial({ color: 0x36c9ff, transparent: true, opacity: 0.46, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  const targetOrbit = loop(sunPosition, o.auScale * o.targetAU, new THREE.LineBasicMaterial({ color: 0x58eca6, transparent: true, opacity: 0.40, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  const moonGroup = new THREE.Group(); moonGroup.name = 'schematic Moon orbit'; context.add(moonGroup);
  const moonOrbit = loop(V3(), o.moonOrbitRadius, new THREE.LineBasicMaterial({ color: 0xc5a8ff, transparent: true, opacity: 0.48, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  // The loop above is scene-centred; rebase its vertices into the Moon group's local Earth-centred frame.
  const moonPts = moonOrbit.geometry.attributes.position;
  for (let i = 0; i < moonPts.count; i++) moonPts.setXYZ(i, moonPts.getX(i), moonPts.getY(i), 0);
  moonPts.needsUpdate = true;
  context.remove(moonOrbit); moonGroup.add(moonOrbit);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(o.moonRadius, 32, 20), new THREE.MeshStandardMaterial({
    color: 0xb8b6b0, roughness: 0.96, metalness: 0, emissive: 0x161616,
  }));
  moon.name = 'Moon (schematic)'; moon.position.set(o.moonOrbitRadius * Math.cos(o.moonPhase), o.moonOrbitRadius * Math.sin(o.moonPhase), 0); moonGroup.add(moon);
  function setEarthPosition(p) { earthPosition.copy(asVector(p)); moonGroup.position.copy(earthPosition); }
  setEarthPosition(earthPosition);
  const point = (x, y, z = 0) => V3(sunPosition.x + x, sunPosition.y + y, sunPosition.z + z);
  return {
    group: context, sun, sunPosition, earthPosition, earthOrbit, targetOrbit, moon, moonGroup, moonOrbit,
    anchors: {
      sun: V3(sunPosition.x, sunPosition.y, sunPosition.z + o.sunRadius + 2),
      orbit: point(0, o.auScale, 1), target: point(0, o.auScale * o.targetAU, 1),
      moon: V3(earthPosition.x + o.moonOrbitRadius * Math.cos(o.moonPhase), earthPosition.y + o.moonOrbitRadius * Math.sin(o.moonPhase), earthPosition.z + o.moonRadius + 0.4),
    },
    setEarthPosition,
    update(t, visualTime = t) { moonGroup.rotation.z = 0.06 * t; if (sun && sun.update) sun.update(visualTime); },
  };
}

/** Deterministic pseudo-random number in [0,1) for integer i and channel k. */
export const hash = (i, k = 0) => { const x = Math.sin((i + 1) * 12.9898 + (k + 1) * 78.233) * 43758.5453; return x - Math.floor(x); };
/** Seconds -> readable simulated duration. */
export function fmtDur(s) {
  if (!Number.isFinite(s)) return 'never';
  if (s < 60) return `${s < 10 ? s.toFixed(2) : s.toFixed(1)} s`;
  if (s < 3600) return `${(s / 60).toFixed(1)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} h`;
  if (s < 3.15576e7) return `${(s / 86400).toFixed(1)} days`;
  const y = s / 3.15576e7; return y < 1e5 ? `${y.toLocaleString('en-US', { maximumFractionDigits: y < 10 ? 2 : 0 })} years` : `${y.toExponential(2)} years`;
}

/**
 * Basic scene for one model. o: { id, title, sunDir (unit vector towards the Sun), labels: {key: colour}, cam: {pos, target},
 * controlsHtml, note, earth: true/false, earthOpt }
 */
export function makeBase(renderer, canvas, container, o) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0d0a08); // warm charcoal display palette
  const camera = new THREE.PerspectiveCamera(o.fov || 42, 1, 0.02, 20000); camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.minDistance = o.minDist || 1.6; controls.maxDistance = o.maxDist || 400; controls.enabled = false;
  camera.position.set(...o.cam.pos); controls.target.set(...o.cam.target); controls.update();
  const starfield = createStarfield(6000, 9000, o.seed || 3); scene.add(starfield);
  const sunDir = (o.sunDir || V3(-1, 0, 0)).clone().normalize();
  scene.add(new THREE.AmbientLight(0x745a45, 0.42));
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.6); sun.position.copy(sunDir).multiplyScalar(100); scene.add(sun);
  let earth = null;
  if (o.earth !== false) {
    earth = createRealEarth(renderer, { segments: 128, spinRate: 0.05, ...(o.earthOpt || {}) });
    earth.group.rotation.x = 0; earth.setSun(sunDir); scene.add(earth.group);
  }
  const panel = document.createElement('div'); panel.id = `${o.id}Panel`; panel.className = 'small cinepanel fa-panel'; panel.hidden = true;
  const povs = o.povs || {};
  const povHtml = Object.keys(povs).length ? `<div class="btns small cam fa-pov"><span class="dim">POV:</span>${Object.entries(povs).map(([k, p], i) => `<button data-pov="${k}" class="${i ? '' : 'on'}" title="${p.tip || ''}">${p.label}</button>`).join('')}</div>` : '';
  panel.innerHTML = `<div class="cineh">${o.title}</div><div class="cstage"></div>${povHtml}<div class="fa-ctl">${o.controlsHtml || ''}</div><div class="dyn"></div><div class="csub dim">${o.note || ''}</div>`;
  container.appendChild(panel);
  const stageEl = panel.querySelector('.cstage'), dynEl = panel.querySelector('.dyn'), ctlEl = panel.querySelector('.fa-ctl');
  const lbl = createLabels(container, canvas, camera, o.labels || {});
  let lastRenderWall = performance.now() / 1000;
  const B = {
    scene, camera, controls, earth, sun, sunDir, starfield, panel, stageEl, dynEl, ctlEl, lbl, active: false,
    setStage(text, cls = '') { if (stageEl.textContent !== text) stageEl.textContent = text; const c = `cstage ${cls}`; if (stageEl.className !== c) stageEl.className = c; },
    setDyn(html) { if (dynEl.innerHTML !== html) dynEl.innerHTML = html; },
    render() {                                    // centred view (info box left, HUD right: no offset needed)
      const wall = performance.now() / 1000, dt = Math.min(0.1, Math.max(0, wall - lastRenderWall)); lastRenderWall = wall;
      const w = canvas.clientWidth, h = canvas.clientHeight; camera.aspect = w / Math.max(1, h); camera.clearViewOffset();
      camera.updateProjectionMatrix(); controls.update(); camera.updateMatrixWorld(); starfield.userData.update(wall);
      if (earth) { earth.setSun(sunDir); earth.update(dt); }
      renderer.render(scene, camera);
    },
    setActive(on) { B.active = on; controls.enabled = on; panel.hidden = !on; if (!on) lbl.hide(); },
    /** Smoothly move the camera to a preset (no automatic camera: the user keeps control between moves). */
    fly(pos, target, dur = 1.6) { B._fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: V3(...pos), t1: V3(...target), k: 0, dur }; },
    updateCam(dt) {
      const f = B._fly; if (!f) return;
      f.k = Math.min(1, f.k + dt / f.dur); const k = f.k * f.k * (3 - 2 * f.k);
      camera.position.lerpVectors(f.p0, f.p1, k); controls.target.lerpVectors(f.t0, f.t1, k); if (f.k >= 1) B._fly = null;
    },
  };
  controls.addEventListener('start', () => { B._fly = null; });
  /** Switch to one of the model's camera POVs (smooth flight; dragging afterwards is free). */
  B.pov = (key, dur = 1.6) => {
    const p = povs[key]; if (!p) return; const v = typeof p.get === 'function' ? p.get() : p;
    B.fly(v.pos, v.target, dur); B.povKey = key;
    for (const b of panel.querySelectorAll('[data-pov]')) b.classList.toggle('on', b.dataset.pov === key);
  };
  B.povs = povs; B.povKey = Object.keys(povs)[0] || null;
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-pov]'); if (b) B.pov(b.dataset.pov); });
  return B;
}

const BEAM_VS = 'varying vec3 vN; varying vec3 vW; varying vec2 vUv; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const BEAM_FS = `uniform vec3 col; uniform float inten; uniform float time; uniform float len;
varying vec3 vN; varying vec3 vW; varying vec2 vUv;
void main(){
  vec3 V = normalize(cameraPosition - vW); float f = abs(dot(normalize(vN), V));
  float s = 0.75 + 0.25 * sin(vUv.y * len * 2.2 - time * 9.0) * sin(vUv.x * 37.0 + time * 1.3);
  float a = pow(f, 1.6) * inten * s;
  gl_FragColor = vec4(col * a, a);
}`;
/** A glowing beam (cylinder along +y of its own frame, length 1, radius 1). Use setEnds(a, b, radius). */
export function createBeam(color = 0xffb36b) {
  const uni = { col: { value: new THREE.Color(color) }, inten: { value: 1 }, time: { value: 0 }, len: { value: 10 } };
  const mat = new THREE.ShaderMaterial({ uniforms: uni, vertexShader: BEAM_VS, fragmentShader: BEAM_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true), mat);
  const coreMat = mat.clone(); coreMat.uniforms = { col: { value: new THREE.Color(0xffffff) }, inten: uni.inten, time: uni.time, len: uni.len };
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 32, 1, true), coreMat);
  const g = new THREE.Group(); g.add(outer); g.add(core);
  const _d = V3(), _q = new THREE.Quaternion(), Y = V3(0, 1, 0);
  function setEnds(a, b, r) {
    _d.subVectors(b, a); const L = _d.length(); g.position.copy(a).addScaledVector(_d, 0.5);
    _q.setFromUnitVectors(Y, _d.normalize()); g.quaternion.copy(_q); g.scale.set(r, L, r); uni.len.value = L / Math.max(r, 1e-3);
  }
  return { group: g, uniforms: uni, setEnds, set(inten, t) { uni.inten.value = inten; uni.time.value = t; g.visible = inten > 1e-3; } };
}

/** Arrow (shaft + head) whose geometry is unit length along +y; set(origin, dir, length, colour). */
export function createArrow(color = 0xff9b5e, shaftR = 0.035) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthTest: true });
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(shaftR, shaftR, 1, 10), mat); g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(shaftR * 3, shaftR * 7, 14), mat); g.add(head);
  const _q = new THREE.Quaternion(), Y = V3(0, 1, 0), _d = V3();
  function set(origin, dir, len) {
    if (len <= 1e-4) { g.visible = false; return; } g.visible = true;
    _d.copy(dir).normalize(); g.position.copy(origin); g.quaternion.copy(_q.setFromUnitVectors(Y, _d));
    const hl = Math.min(len * 0.45, shaftR * 7); shaft.scale.set(1, len - hl, 1); shaft.position.y = (len - hl) / 2; head.position.y = len - hl / 2; head.scale.setScalar(1);
  }
  return { group: g, set, mat };
}

/** Shue et al. (1997) magnetopause radius r(theta) [same unit as r0], theta from the Sun direction. */
export const shue = (r0, alpha, th) => r0 * Math.pow(2 / (1 + Math.cos(th)), alpha);
/** Surface of revolution of a Shue-type boundary around the Sun-Earth line (Sun at -x). */
export function shueSurface(r0, alpha, color, opacity, thMax = 2.3) {
  const pts = [];
  for (let i = 0; i <= 60; i++) { const th = thMax * i / 60, r = shue(r0, alpha, th); pts.push(new THREE.Vector2(r * Math.sin(th), -r * Math.cos(th))); }
  const geo = new THREE.LatheGeometry(pts, 72); geo.rotateZ(Math.PI / 2);          // lathe axis y -> x axis; apex towards -x
  geo.scale(-1, 1, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, op: { value: opacity } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vW; void main(){ vec3 V = normalize(cameraPosition - vW); float f = 1.0 - abs(dot(normalize(vN), V)); float a = op * (0.15 + 1.6 * pow(f, 2.5)); gl_FragColor = vec4(col * a, a); }',
  });
  return new THREE.Mesh(geo, mat);
}

/** Small reusable 2-D chart on a canvas: series of [x, y] in data units, with axis labels and horizontal / vertical marks. */
export function drawChart(cv, o) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth || 320, H = cv.clientHeight || 150;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const L = 40, R = 8, T = 10, Bm = 24, pw = W - L - R, ph = H - T - Bm;
  const X = (x) => L + pw * (x - o.x0) / (o.x1 - o.x0), Y = (y) => T + ph * (1 - (y - o.y0) / (o.y1 - o.y0));
  c.fillStyle = 'rgba(8,12,20,.6)'; c.fillRect(L, T, pw, ph);
  c.font = '10px system-ui, sans-serif'; c.fillStyle = '#9fb6d6'; c.strokeStyle = '#26344a'; c.lineWidth = 1;
  for (const yt of o.yTicks) { c.beginPath(); c.moveTo(L, Y(yt)); c.lineTo(L + pw, Y(yt)); c.stroke(); c.fillText(String(yt), 4, Y(yt) + 3); }
  for (const xt of o.xTicks) { c.fillText(xt >= 1000 ? `${xt / 1000}k` : String(xt), X(xt) - 8, H - 10); }
  c.fillText(o.xLabel, L + pw - c.measureText(o.xLabel).width, H - 1);
  for (const m of o.hMarks || []) { c.strokeStyle = m.col; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(L, Y(m.y)); c.lineTo(L + pw, Y(m.y)); c.stroke(); c.setLineDash([]); c.fillStyle = m.col; c.fillText(m.label, L + 4, Y(m.y) - 3); }
  for (const m of o.vMarks || []) { c.strokeStyle = m.col; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(m.x), T); c.lineTo(X(m.x), T + ph); c.stroke(); c.setLineDash([]); c.fillStyle = m.col; c.fillText(m.label, X(m.x) - c.measureText(m.label).width - 3, T + ph - 4); }
  c.save(); c.beginPath(); c.rect(L, T, pw, ph); c.clip();
  for (const s of o.series) {
    c.strokeStyle = s.col; c.lineWidth = s.w || 2; c.setLineDash(s.dash || []); c.beginPath();
    s.data.forEach(([x, y], i) => { const px = X(x), py = Y(Math.min(o.y1 + 1, y)); if (i) c.lineTo(px, py); else c.moveTo(px, py); });
    c.stroke(); c.setLineDash([]);
  }
  if (o.marker) { c.fillStyle = o.marker.col; c.beginPath(); c.arc(X(o.marker.x), Y(Math.min(o.y1, o.marker.y)), 4, 0, 7); c.fill(); }
  c.restore();
  let ly = T + ph * 0.42 + (o.legendDy || 0); c.font = '10px system-ui, sans-serif';
  for (const s of o.series) { if (!s.label) continue; c.fillStyle = s.col; const w = c.measureText(s.label).width; c.fillStyle = 'rgba(8,12,20,.75)'; c.fillRect(L + 3, ly - 9, w + 4, 12); c.fillStyle = s.col; c.fillText(s.label, L + 5, ly); ly += 12; }
}
export { esc };
