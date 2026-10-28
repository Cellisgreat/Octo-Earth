// OCTO-EARTH "failed attempts" page (update p40): four independent model screens, viewed one at a time.
// Model 1 deliberately merges the p38 laser-push and Dyson-beam ideas into one laser -> arm-held collector model.
// One WebGL renderer and one animation loop; each model is created on first view and only the active model is updated
// and drawn. Physics numbers: failedPhysics.js (mirrored in failed_models.py).
import * as THREE from './vendor/three.module.js';
import { createHydrogenScoopView } from './hydrogenScene.js';
import { createMagnetView } from './magnetScene.js';
import { createDysonView } from './dysonScene.js';
import { createThrusterView } from './thrusterScene.js';
import { DV_REQ, F_REQ, DYSON, LASER, K, ARM_STRUCT, laser } from './failedPhysics.js';
import { fmtE, esc } from './cineKit.js';

const $ = (id) => document.getElementById(id);
const canvas = $('scene'), center = $('center');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

function laserDysonWrapped() {
  const v = createDysonView(renderer, canvas, center);
  v.key = 'laser-dyson';
  const fullPush = laser(LASER.P_REQ), safePush = laser(LASER.P_SAFE);
  v.info = {
    title: 'Laser + Dyson collector (radiation pressure)',
    idea: 'A schematic Dyson swarm powers one laser emitter. Its single beam points at the reflective front of one collector held by Earth’s 8 real arms; the collector faces the laser, reflects the beam onto Earth, and transmits the light-pressure load through its arm mounts.',
    calculations: [
      `Common target: Δv = ${fmtE(DV_REQ, 2)} m/s, requiring an average tangential push of ${fmtE(F_REQ, 2)} N for 10,000 years.`,
      `Radiation pressure: F = P/c. The report-scale ${fmtE(DYSON.P, 2)} W beam gives ${fmtE(DYSON.F, 2)} N (${fmtE(100 * DYSON.frac, 1)}% of F_req); with the reflected beam absorbed at Earth, ideal total force on Earth + mechanism is (P/c) d.`,
      `To meet F_req needs ${fmtE(LASER.P_REQ, 2)} W (${fmtE(100 * LASER.P_REQ / K.L_SUN, 1)}% of solar luminosity). Full absorption gives a simple global-equilibrium estimate of ${fmtE(fullPush.Tsurf, 0)} K; oceans boil in ${fmtE(fullPush.tOceans, 2)} s and the energy-only Earth-unbinding estimate is ${fmtE(fullPush.tUnbind / 86400, 1)} days.`,
      `At the report-scale beam, the same equilibrium estimate is ${fmtE(DYSON.Tsurf, 0)} K. At the separate +2 K screening setting (${fmtE(LASER.P_SAFE, 2)} W), the ideal 10,000-year orbit estimate is ${safePush.a10k.toFixed(8)} AU.`,
      `Arm limit is a stylized capacity proxy: SF is assumed allowable load / simulated peak load. The proxy falls below SF 1.5 near ${fmtE(100 * ARM_STRUCT.ARM_CAP_FRAC / ARM_STRUCT.SF_MIN, 1)}% beam power; no real segment, hinge, buckling or thermal design is certified.`,
    ],
    fails: [`The collector faces the incoming laser. With the assumed load proportional to power, the guide's minimum safety factor SF ≥ ${ARM_STRUCT.SF_MIN.toFixed(1)} is violated at about ${(100 * ARM_STRUCT.ARM_CAP_FRAC / ARM_STRUCT.SF_MIN).toFixed(1)} % beam power. The assumed allowable load is first reached at ${(100 * ARM_STRUCT.ARM_CAP_FRAC).toFixed(0)} %; the later break cascade is a dramatic illustration, not a structural prediction.`,
      `Even before the illustrative break, the full ${fmtE(DYSON.P, 2)} W beam gives ${fmtE(DYSON.F, 2)} N = ${(100 * DYSON.frac).toFixed(1)} % of the ${fmtE(F_REQ, 2)} N needed for 2.7 AU.`,
      `Reflected beam heating: ~${fmtE(DYSON.Tsurf, 0)} K at full Dyson-beam power. Reaching F_req by radiation pressure needs ${fmtE(LASER.P_REQ, 2)} W; global equilibrium is ~${fmtE(fullPush.Tsurf, 0)} K and the absorbed-beam estimate unbinds Earth in about 43.6 days.`],
  };
  return v;
}
const MODELS = [
  { label: 'Laser + Dyson collector', make: laserDysonWrapped },
  { label: 'Hydrogen harvesting', make: () => createHydrogenScoopView(renderer, canvas, center) },
  { label: 'Magnetic arms', make: () => createMagnetView(renderer, canvas, center) },
  { label: 'Earth-derived thrusters', make: () => createThrusterView(renderer, canvas, center) },
];
const views = [null, null, null, null];
let cur = -1;
const get = (i) => views[i] || (views[i] = MODELS[i].make());

$('faDv').textContent = DV_REQ.toLocaleString('en-US', { maximumFractionDigits: 0 });
$('faF').textContent = fmtE(F_REQ, 2);

function show(i) {
  i = ((i % MODELS.length) + MODELS.length) % MODELS.length;
  if (i === cur) return;
  let v;
  try { v = get(i); } catch (e) { showErr(e); return; }
  if (cur >= 0 && views[cur]) { views[cur].setActive(false); if (views[cur].hideLabels) views[cur].hideLabels(); }
  cur = i; v.setActive(true);
  for (const b of document.querySelectorAll('#faTabs button')) b.classList.toggle('on', +b.dataset.m === i);
  $('faTitle').textContent = `${i + 1}. ${v.info.title}`;
  $('faIdea').textContent = v.info.idea;
  $('faCalculations').innerHTML = (v.info.calculations || []).map((f) => `<li>${esc(f)}</li>`).join('');
  $('faFails').innerHTML = v.info.fails.map((f) => `<li>${esc(f)}</li>`).join('');
  $('faWhich').textContent = `model ${i + 1} of ${MODELS.length}: ${MODELS[i].label}`;
  if (location.hash !== `#${i + 1}`) history.replaceState(null, '', `#${i + 1}`);
  syncBar();
}
function syncBar() {
  const v = views[cur]; if (!v) return;
  const S = v.S, t = !S.started ? 'Pause' : S.ended ? 'Pause' : S.running ? 'Pause' : 'Resume';
  if ($('faPause').textContent !== t) $('faPause').textContent = t;
  $('faPause').disabled = !S.started || !!S.ended;
}
function showErr(e) { console.error(e); const d = $('faErr'); d.hidden = false; d.textContent = `Error: ${e && e.message ? e.message : e}`; }

document.querySelector('#faTabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (b) show(+b.dataset.m); });
$('faPrev').onclick = () => show(cur - 1);
$('faNext').onclick = () => show(cur + 1);
$('faStart').onclick = () => { views[cur].start(); syncBar(); };
$('faPause').onclick = () => { views[cur].togglePause(); syncBar(); };
$('faReset').onclick = () => { views[cur].reset(); syncBar(); };
$('faInfoHide').onclick = () => { const b = $('faInfoBody'); b.hidden = !b.hidden; $('faInfoHide').textContent = b.hidden ? '+' : '-'; };
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
  if (e.key >= '1' && e.key <= '4') show(+e.key - 1);
  else if (e.key === 'ArrowRight') show(cur + 1);
  else if (e.key === 'ArrowLeft') show(cur - 1);
  else if (e.key === ' ') { e.preventDefault(); views[cur].togglePause(); syncBar(); }
  else if (e.key === 'r' || e.key === 'R') { views[cur].reset(); syncBar(); }
});

let lastW = 0, lastH = 0;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w !== lastW || h !== lastH) { lastW = w; lastH = h; renderer.setSize(w, h, false); }
}
let last = performance.now(), fpsN = 0, fpsT = 0;
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  resize();
  const v = views[cur];
  if (v) { try { v.update(dt); v.render(); } catch (e) { showErr(e); return; } }
  fpsN++; fpsT += dt; if (fpsT > 1) { $('faFps').textContent = `${Math.round(fpsN / fpsT)} fps`; fpsN = 0; fpsT = 0; syncBar(); }
  requestAnimationFrame(frame);
}
const h0 = parseInt((location.hash || '#1').slice(1), 10);
show(Number.isFinite(h0) && h0 >= 1 && h0 <= MODELS.length ? h0 - 1 : 0);
requestAnimationFrame(frame);

// test hook: views, switching and fast-forward (advances the active model by 'sec' seconds of animation time)
window.__fa = {
  views, show, get, cur: () => cur, K,
  ff(sec) { const v = views[cur]; let t = 0; while (t < sec) { v.update(0.1); t += 0.1; } v.render(); syncBar(); return v.S; },
};
