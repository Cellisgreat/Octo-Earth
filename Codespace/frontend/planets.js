// OCTO-EARTH: Mercury, Venus and Jupiter from the physics records in the solar-system overview (update p35).
// Display-only Saturn/Uranus/Neptune markers are constructed separately in planetaryBackdrop.js; they are not simulated.
//
// Planet positions, velocities and paths in this module come from physics records: every viewer row carries the
// simulated heliocentric states [AU, km/s] of Mercury, Venus and Jupiter (R_PL.., R_PLV.., R_DPL..). Between two
// recorded states each body follows its exact two-body (Kepler) arc from the earlier state, so fast Mercury never
// cuts across its orbit. The surface meshes and procedural textures are display-only and do not change those states.
import * as THREE from './vendor/three.module.js';
import { planetTexture, createPlanetAtmosphere } from './planetTextures.js';

export const R_PL = 34, R_PLV = 43, R_DPL = 52;       // first column of positions (3 x 3), velocities (3 x 3), distances (3)
export const NAMES = ['Mercury', 'Venus', 'Jupiter'];
const COLORS = [0xb8b2a8, 0xf3d9a0, 0xd9b48a];
const ORBIT_COLORS = [0x4fa3ff, 0x60dfff, 0xc084fc]; // cool display-only orbit guides; recorded paths unchanged
export const PLANET_MARKER_BOOST = 1.55;              // larger overview-only discs; positions and osculating paths are unchanged
const SIZES = [0.13, 0.20, 0.42].map((r) => r * PLANET_MARKER_BOOST); // visual radii in scene units, deliberately not to scale
const AU = 1.495978707e11, YEAR_S = 31557600, GM_SUN = 1.32712440018e20;
const KMS2AUY = 1000 * YEAR_S / AU;
const GMS = [2.2031868551e13, 3.24858592e14, 1.26712764e17];
const MU = GMS.map((g) => (GM_SUN + g) * YEAR_S * YEAR_S / (AU * AU * AU));   // AU^3 / yr^2

// ---- exact two-body propagation (universal variables; same method as kepler_step in octoearth_rl.py)
function stumpC(z) { if (z > 1e-8) { const s = Math.sqrt(z); return (1 - Math.cos(s)) / z; } if (z < -1e-8) { const s = Math.sqrt(-z); return (Math.cosh(s) - 1) / -z; } return 0.5 - z / 24; }
function stumpS(z) { if (z > 1e-8) { const s = Math.sqrt(z); return (s - Math.sin(s)) / (s * s * s); } if (z < -1e-8) { const s = Math.sqrt(-z); return (Math.sinh(s) - s) / (s * s * s); } return 1 / 6 - z / 120; }
/** Position after dt (same units as mu: AU, AU/yr, yr) from position r and velocity v. */
export function keplerPos(r, v, mu, dt) {
  if (dt === 0) return r.slice();
  const r0 = Math.hypot(r[0], r[1], r[2]), v0sq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  const rv = r[0] * v[0] + r[1] * v[1] + r[2] * v[2], smu = Math.sqrt(mu), alpha = 2 / r0 - v0sq / mu;
  let x = alpha > 1e-12 ? smu * alpha * dt : smu * dt / r0;
  for (let k = 0; k < 60; k++) {
    const z = alpha * x * x, C = stumpC(z), S = stumpS(z);
    const F = rv / smu * x * x * C + (1 - alpha * r0) * x * x * x * S + r0 * x - smu * dt;
    const dF = rv / smu * x * (1 - z * S) + (1 - alpha * r0) * x * x * C + r0;
    const dx = F / dF; x -= dx;
    if (Math.abs(dx) <= 1e-13 * Math.abs(x) + 1e-14) break;
  }
  const z = alpha * x * x, f = 1 - x * x / r0 * stumpC(z), g = dt - x * x * x / smu * stumpS(z);
  return [f * r[0] + g * v[0], f * r[1] + g * v[1], f * r[2] + g * v[2]];
}

/** Osculating orbit {a, e, P, Q} (AU, unit vectors) for drawing an ellipse. */
function orbitOf(p, v, mu) {
  const r = Math.hypot(...p), v2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  const h = [p[1] * v[2] - p[2] * v[1], p[2] * v[0] - p[0] * v[2], p[0] * v[1] - p[1] * v[0]], hm = Math.hypot(...h);
  const ev = [(v[1] * h[2] - v[2] * h[1]) / mu - p[0] / r, (v[2] * h[0] - v[0] * h[2]) / mu - p[1] / r, (v[0] * h[1] - v[1] * h[0]) / mu - p[2] / r];
  const e = Math.hypot(...ev), a = -mu / (2 * (v2 / 2 - mu / r));
  const P = e > 1e-9 ? ev.map((x) => x / e) : p.map((x) => x / r), W = h.map((x) => x / hm);
  const Q = [W[1] * P[2] - W[2] * P[1], W[2] * P[0] - W[0] * P[2], W[0] * P[1] - W[1] * P[0]];
  return { a, e, P, Q };
}

export function createPlanets(scene, S) {
  const group = new THREE.Group(); scene.add(group);
  const meshes = [], orbits = [];
  for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(SIZES[k], 40, 24),
      new THREE.MeshStandardMaterial({ map: planetTexture(NAMES[k].toLowerCase()), color: 0xffffff,
        roughness: 0.88, metalness: 0.01, emissive: new THREE.Color(COLORS[k]).multiplyScalar(0.006) }));
    if (NAMES[k] === 'Venus') m.add(createPlanetAtmosphere(SIZES[k], 0xffd9a1, 0.25));
    else if (NAMES[k] === 'Jupiter') m.add(createPlanetAtmosphere(SIZES[k], 0xffdfbd, 0.15));
    m.name = `${NAMES[k]} (simulated marker; enlarged, procedural surface art)`;
    m.userData.focusName = NAMES[k]; m.userData.focusRadius = SIZES[k];
    group.add(m); meshes.push(m);
    const pos = new Float32Array(257 * 3), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setDrawRange(0, 0);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ORBIT_COLORS[k], transparent: true, opacity: 0.40, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    l.frustumCulled = false; l.userData.pos = pos; group.add(l); orbits.push(l);
  }
  let frame = 0;
  function drawOrbit(k, p, v) {
    const el = orbitOf(p, v, MU[k]), l = orbits[k], pos = l.userData.pos;
    if (!(el.e < 0.99) || !(el.a > 0)) { l.geometry.setDrawRange(0, 0); return; }
    const b = el.a * Math.sqrt(1 - el.e * el.e);
    for (let i = 0; i <= 256; i++) {
      const E = i / 256 * 2 * Math.PI, x = el.a * (Math.cos(E) - el.e), y = b * Math.sin(E);
      for (let c = 0; c < 3; c++) pos[i * 3 + c] = (x * el.P[c] + y * el.Q[c]) * S;
    }
    l.geometry.attributes.position.needsUpdate = true; l.geometry.setDrawRange(0, 257);
  }
  /** Planet states at time t [yr] from the recorded rows (bsearch = index of the last row with t_row <= t). */
  function statesFromRows(rows, i, t) {
    if (!rows.length || rows[0].length <= R_DPL + 2) return null;
    const q = rows[Math.max(0, i)], t0 = q[0], out = [];
    for (let k = 0; k < 3; k++) {
      const p = [q[R_PL + 3 * k], q[R_PL + 3 * k + 1], q[R_PL + 3 * k + 2]];
      const v = [q[R_PLV + 3 * k] * KMS2AUY, q[R_PLV + 3 * k + 1] * KMS2AUY, q[R_PLV + 3 * k + 2] * KMS2AUY];
      out.push({ p: keplerPos(p, v, MU[k], Math.max(0, t - t0)), v, pRec: p });
    }
    return out;
  }
  function statesFromInit(I) {
    if (!I || !Array.isArray(I.planets_r) || !Array.isArray(I.planets_v_kms)) return null;
    return I.planets_r.map((p, k) => ({ p, v: I.planets_v_kms[k].map((x) => x * KMS2AUY), pRec: p }));
  }
  /** Fast-training-only display ephemeris: solar Kepler arcs from the recorded spawn, not part of PPO physics. */
  function statesFromInitAt(I, t) {
    const start = statesFromInit(I); if (!start) return null;
    return start.map((s, k) => {
      const el = orbitOf(s.p, s.v, MU[k]), period = 2 * Math.PI * Math.sqrt(el.a ** 3 / MU[k]);
      const dt = Number.isFinite(period) && period > 0 ? ((t % period) + period) % period : 0;
      const p = keplerPos(s.p, s.v, MU[k], dt);
      return { p, v: s.v, pRec: s.p, displayOnly: true };
    });
  }
  /** Reference Kepler markers used before mission states exist and as a training-display fallback. */
  function referenceStates(t = 0) {
    const a0 = [0.387098, 0.723332, 5.2044], e0 = [0.20563, 0.00677, 0.0489], M0 = [1.1, 4.0, 2.4];
    return a0.map((a, k) => {
      const e = e0[k], period = 2 * Math.PI * Math.sqrt(a ** 3 / MU[k]);
      const M = M0[k] + 2 * Math.PI * (((t % period) + period) % period) / period;
      let E = M;
      for (let it = 0; it < 10; it++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      const n = 2 * Math.PI / period, den = 1 - e * Math.cos(E), b = a * Math.sqrt(1 - e * e);
      const p = [a * (Math.cos(E) - e), b * Math.sin(E), 0];
      const v = [-a * Math.sin(E) * n / den, b * Math.cos(E) * n / den, 0];
      return { p, v, pRec: p, displayOnly: true };
    });
  }
  /** Draw; returns the Earth distances [AU]. opts: {on, orbits}. */
  function update(states, earthP, opts) {
    const show = !!(states && opts.on);
    group.visible = show;
    if (!show) return null;
    const d = [];
    for (let k = 0; k < 3; k++) {
      const s = states[k]; meshes[k].position.set(s.p[0] * S, s.p[1] * S, s.p[2] * S);
      meshes[k].rotation.z += 0.01;
      orbits[k].visible = opts.orbits;
      if (opts.orbits && ((frame % 20) === k || orbits[k].geometry.drawRange.count === 0)) drawOrbit(k, s.pRec, s.v);
      d.push(earthP ? Math.hypot(s.p[0] - earthP[0], s.p[1] - earthP[1], s.p[2] - earthP[2]) : NaN);
    }
    frame++;
    return d;
  }
  function hide() { group.visible = false; }
  return { update, hide, statesFromRows, statesFromInit, statesFromInitAt, referenceStates, meshes, group };
}
