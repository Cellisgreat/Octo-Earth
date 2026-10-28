// OCTO-EARTH failed model 4: Earth-derived reaction mass and planetary thrusters.
// A transparent rocket-equation screen, not a new force/orbit model in the main simulator.
import * as THREE from './vendor/three.module.js';
import { makeBase, addSolarOrbitContext, createArrow, V3, clamp, hash } from './failKit.js';
import { hudRow, hudBar, fmtE } from './cineKit.js';
import { K, DV_REQ, F_REQ, THRUSTER, thruster } from './failedPhysics.js';

export const TH = { T_ANIM: 30, EXHAUST_LENGTH: 2.7, PARTICLES: 220 };
const propLog = (m) => Math.log10(m);

export function createThrusterView(renderer, canvas, container) {
  const ctl = `<div class="fa-slider" title="Total reaction mass removed from Earth's initial mass and expelled during a 10,000-year burn. Logarithmic scale."><span class="dim">Earth propellant</span> <input type="range" id="thM" min="${propLog(THRUSTER.PROP_MIN)}" max="${propLog(THRUSTER.PROP_MAX)}" step="0.01" value="${propLog(THRUSTER.PROP_DEFAULT)}"> <b class="mono" id="thMv"></b></div>
    <div class="btns small"><button data-th="ref" title="Reset the example to 1e23 kg of Earth-derived reaction mass.">Reference budget</button><button data-th="max" title="Show the largest mass in this deliberately huge test range: 1e24 kg.">Largest tested budget</button></div>`;
  const B = makeBase(renderer, canvas, container, {
    id: 'th', title: '4 &middot; EARTH-DERIVED THRUSTERS <span class="dim">(rocket equation)</span>', controlsHtml: ctl,
    cam: { pos: [4.4, -7.5, 3.6], target: [0, -0.15, 0] }, maxDist: 500, minDist: 0.3,
    povs: {
      wide: { label: 'Overview', pos: [4.4, -7.5, 3.6], target: [0, -0.15, 0], tip: 'Earth, conceptual thruster ring, exhaust plume and push direction.' },
      engines: { label: 'Thruster array', pos: [0.3, -5.6, 1.8], target: [0, -1.15, 0], tip: 'Close view of the schematic Earth-mounted thruster nozzles and expelled mass.' },
      above: { label: 'Above Earth', pos: [0, 0, 7.5], target: [0, 0, 0], tip: 'View the conceptual array around the planet.' },
      system: { label: 'Sun & orbits', pos: [-60, -420, 200], target: [-60, 0, 0], tip: 'Schematic Sun, 1-AU orbit, 2.7-AU target orbit and Earth-Moon context.' },
      moon: { label: 'Earth & Moon', pos: [8, -11, 8], target: [0, -1.5, 0], tip: 'Close view of Earth and schematic lunar orbit.' },
    },
    labels: { earth: '#9fd0ff', engine: '#ffb36b', plume: '#ffd39a', thrust: '#ff8754', sun: '#ffcc5b', orbit: '#ff9966', target: '#ffc56e', moon: '#d6d7da' },
    note: 'Illustrative planetary-rocket calculation: propellant is removed from Earth, then expelled opposite the desired push. Earth size, gravity and orbital response to that mass loss are not simulated; no thruster hardware, exhaust interaction, power plant or heat rejection is modeled. The orbit result uses the ideal rocket equation and the common 1 → 2.7 AU slow-spiral Δv requirement.'
  });
  const { scene, earth } = B;
  const solar = addSolarOrbitContext(scene, { sunPosition: [-60, 0, 0], earthPosition: [0, 0, 0], auScale: 60, sunRadius: 4.5, moonOrbitRadius: 4.0, moonRadius: 0.273 });
  const S = { t: 0, running: false, started: false, ended: false, propLog: propLog(THRUSTER.PROP_DEFAULT), idle: 0, wall: 0, lastDyn: -1 };

  // Concept-only engine collar; its geometry is not a proposed buildable design.
  const engines = new THREE.Group(); engines.name = 'schematic Earth-derived thruster array (display only)'; earth.group.add(engines);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(1.035, 0.045, 8, 96),
    new THREE.MeshStandardMaterial({ color: 0x95836f, metalness: 0.68, roughness: 0.42, emissive: 0x21140e, emissiveIntensity: 0.28 }));
  collar.name = 'schematic thruster support collar'; engines.add(collar);
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xaebdce, metalness: 0.66, roughness: 0.36, emissive: 0x21140e, emissiveIntensity: 0.2 });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xff9a58, metalness: 0.24, roughness: 0.32, emissive: 0x6f2f18, emissiveIntensity: 0.65 });
  for (let k = 0; k < 8; k++) {
    const a = 2 * Math.PI * k / 8, x = 0.72 * Math.cos(a), z = 0.72 * Math.sin(a);
    const nozzle = new THREE.Group(); nozzle.position.set(x, -0.78, z); nozzle.rotation.x = Math.PI; engines.add(nozzle);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.17, 0.32, 16), nozzleMat); body.position.y = 0; nozzle.add(body);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.025, 8, 20), lipMat); lip.rotation.x = Math.PI / 2; lip.position.y = -0.15; nozzle.add(lip);
  }
  const outerFlameMat = new THREE.MeshBasicMaterial({ color: 0xff8a4d, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const coreFlameMat = new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const outerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.55, TH.EXHAUST_LENGTH, 28, 1, true), outerFlameMat);
  const coreFlame = new THREE.Mesh(new THREE.ConeGeometry(0.23, TH.EXHAUST_LENGTH * 0.66, 20, 1, true), coreFlameMat);
  outerFlame.rotation.x = coreFlame.rotation.x = Math.PI;
  outerFlame.position.set(0, -1 - TH.EXHAUST_LENGTH / 2, 0); coreFlame.position.set(0, -1 - TH.EXHAUST_LENGTH * 0.34, 0);
  engines.add(outerFlame, coreFlame);

  const ppos = new Float32Array(TH.PARTICLES * 3), pcol = new Float32Array(TH.PARTICLES * 3);
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3)); pgeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
  const pmat = new THREE.PointsMaterial({ vertexColors: true, size: 0.075, sizeAttenuation: true, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(pgeo, pmat); particles.frustumCulled = false; engines.add(particles);
  const thrustArrow = createArrow(0xff8754, 0.055); scene.add(thrustArrow.group);

  function state() {
    const mProp = Math.pow(10, S.propLog), total = thruster(mProp, THRUSTER.VE);
    const frac = S.started ? clamp(S.t / TH.T_ANIM, 0, 1) : 0;
    const spent = mProp * frac, now = thruster(spent, THRUSTER.VE);
    return { mProp, total, frac, spent, now, years: frac * K.T_MISSION_Y };
  }
  const reference = thruster(), maximum = thruster(THRUSTER.PROP_MAX);
  function draw() {
    const s = state(), tv = S.started ? S.t : S.idle, running = S.started && !S.ended;
    solar.update(tv, performance.now() / 1000);
    const visualPower = clamp(Math.log10(Math.max(1, s.total.thrust) / 1e12) / 4, 0.15, 1);
    outerFlameMat.opacity = (running ? 0.28 : 0.11) * visualPower;
    coreFlameMat.opacity = (running ? 0.36 : 0.12) * visualPower;
    outerFlame.scale.set(0.7 + 0.45 * visualPower, 0.75 + 0.45 * visualPower, 0.7 + 0.45 * visualPower);
    coreFlame.scale.set(0.75 + 0.3 * visualPower, 0.75 + 0.3 * visualPower, 0.75 + 0.3 * visualPower);
    const flowTime = running ? S.t : tv * 0.22;
    for (let i = 0; i < TH.PARTICLES; i++) {
      const age = ((flowTime * (0.5 + 0.7 * hash(i, 1)) + hash(i, 2)) % 1 + 1) % 1;
      const angle = 2 * Math.PI * hash(i, 3), spread = 0.08 + age * (0.18 + 0.34 * visualPower);
      ppos[3 * i] = spread * Math.cos(angle);
      ppos[3 * i + 1] = -1.08 - age * TH.EXHAUST_LENGTH;
      ppos[3 * i + 2] = spread * Math.sin(angle);
      const fade = (0.2 + 0.8 * (1 - age)) * (running ? 1 : 0.28);
      pcol.set([0.45 * fade, 0.78 * fade, fade], 3 * i);
    }
    pgeo.attributes.position.needsUpdate = true; pgeo.attributes.color.needsUpdate = true;
    thrustArrow.set(V3(0, 1.13, 0), V3(0, 1, 0), S.started ? 0.42 + 1.35 * clamp(s.total.thrustFraction, 0, 1) : 0.36);
    return s;
  }

  const slider = B.panel.querySelector('#thM'), massLabel = B.panel.querySelector('#thMv');
  const massButtons = [...B.panel.querySelectorAll('[data-th]')];
  function setMassControlsLocked(locked) { slider.disabled = locked; for (const button of massButtons) button.disabled = locked; }
  slider.addEventListener('input', () => { S.propLog = +slider.value; S.lastDyn = -1; dyn(); });
  B.ctlEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-th]'); if (!b) return;
    S.propLog = propLog(b.dataset.th === 'max' ? THRUSTER.PROP_MAX : THRUSTER.PROP_DEFAULT);
    slider.value = String(S.propLog); S.lastDyn = -1; dyn();
  });
  function dyn() {
    const s = state(), t = s.total;
    massLabel.textContent = `${fmtE(s.mProp, 2)} kg`;
    if (!S.started) B.setStage('READY - choose a mass budget, then Start', '');
    else if (S.ended) B.setStage(`10,000 YEARS: ${fmtE(100 * t.dvProgress, 2)} % OF REQUIRED Δv - a = ${t.a10k.toFixed(5)} AU`, 'bad');
    else B.setStage(`THRUSTING - ${Math.round(s.years).toLocaleString('en-US')} years · ${fmtE(100 * s.now.dvProgress, 2)} % of required Δv` + (S.running ? '' : ' - PAUSED'), 'warn');
    let h = '';
    h += hudRow('Mission clock', `${Math.round(s.years).toLocaleString('en-US')} of 10,000 years`, '30 s of animation = 10,000 simulated years; this is a display clock, not a mission run.');
    h += hudRow('Chosen Earth-derived propellant', `${fmtE(s.spent, 2)} / ${fmtE(s.mProp, 2)} kg expelled`, 'The selected total is removed from Earth’s initial mass. The animated plume is only a visual cue.');
    h += hudRow('Remaining Earth mass after full burn', `${fmtE(t.finalMass, 2)} kg · ${fmtE(100 * (1 - t.massFraction), 2)} % of start`, 'Mf = M_E − m_prop; engine mass, extracted material handling and changes to Earth’s size/gravity are not simulated.');
    h += hudRow('Exhaust speed', `${(THRUSTER.VE / 1000).toFixed(1)} km/s · Isp ${fmtE(THRUSTER.VE / THRUSTER.G0, 0)} s`, 'Fixed reference assumption; ideal directed exhaust, no engine or propellant-loss penalty.');
    h += hudRow('Average mass flow', `${fmtE(t.mdot, 2)} kg/s`, 'Selected propellant divided evenly over the 10,000-year burn.');
    h += hudRow('Ideal thrust', `${fmtE(t.thrust, 2)} N = ${fmtE(100 * t.thrustFraction, 2)} % of F<sub>req</sub>`, 'T = mdot × v_e. F_req is the constant-initial-mass average tangential push used for the common comparison.');
    h += hudRow('Δv gained so far / final', `${fmtE(s.now.dv, 2)} / ${fmtE(t.dv, 2)} of ${fmtE(DV_REQ, 0)} m/s`, 'Tsiolkovsky rocket equation: Δv = v_e ln(M0/Mf); here M0 = M_E and Mf = M_E − m_prop.');
    h += hudRow('Calculated orbit now / at 10,000 y', `${s.now.a10k.toFixed(6)} / ${t.a10k.toFixed(5)} AU (target 2.7 AU)`, 'Maps the ideal slow-spiral Δv to a = a0 / (1 − Δv/vcirc,0)^2; not integrated by the main model.', 'bad');
    h += hudRow('Propellant required at this v_e', `${fmtE(t.mNeed, 2)} kg = ${fmtE(100 * t.needFractionEarth, 1)} % of initial Earth mass`, 'Rearrange rocket equation: m_prop,req = M_E [1 − exp(−Δv_req/v_e)]. This leaves only the remainder of Earth before accounting for engines.', 'bad');
    h += hudRow('Chosen budget vs required', `${fmtE(t.needMultiple, 2)}× more mass needed · ${fmtE(100 * t.dvProgress, 2)} % of required Δv`, 'The default 1e23 kg is already about 1.36 lunar masses; it remains short even though collection is assumed unnecessary.');
    h += hudRow('Largest tested budget', `${fmtE(maximum.mProp, 2)} kg → ${fmtE(maximum.dv, 0)} m/s · ${maximum.a10k.toFixed(5)} AU`, `The slider tops out below the ${fmtE(t.mNeed, 2)} kg rocket-equation requirement, so even its maximum stays short.`, 'bad');
    h += `<div class="crow"><span class="cl">Δv progress</span><span class="cv">${fmtE(100 * s.now.dvProgress, 2)} % ${hudBar(s.now.dvProgress, '#ff6a4d')}</span></div>`;
    h += hudRow('Minimum exhaust kinetic energy', `${fmtE(t.energy, 2)} J chosen · ${fmtE(t.reqEnergy, 2)} J required`, 'E = ½ m_prop v_e² in the ideal exhaust frame; excludes engine, conversion and trajectory losses.');
    h += hudRow('Average power lower bound', `${fmtE(t.power, 2)} W chosen · ${fmtE(t.reqPower, 2)} W required`, `Required case is ~${fmtE(t.reqPowerMultipleSun, 2)}× the sunlight Earth absorbs today; this is only the exhaust kinetic-energy floor.`, 'bad');
    h += `<div class="fa-verdict">FAILS: at 10 km/s, the reference ${fmtE(s.mProp, 2)} kg budget gives only ${fmtE(100 * t.dvProgress, 2)} % of the needed Δv and ${t.a10k.toFixed(5)} AU. The ideal rocket equation needs ${fmtE(t.mNeed, 2)} kg (${fmtE(100 * t.needFractionEarth, 1)} % of Earth's starting mass).</div>`;
    B.setDyn(h);
  }
  function placeLabels() {
    B.lbl.set('engine', V3(0, -1.05, 0.2), 'schematic thruster ring · reaction mass from Earth');
    B.lbl.set('plume', S.started ? V3(0.45, -2.2, 0.4) : null, 'exhaust −orbit direction');
    B.lbl.set('thrust', V3(0, 1.55, 0.5), `push +orbit · ${fmtE(state().total.thrust, 1)} N (schematic arrow)`);
    B.lbl.set('earth', V3(0, 0, -1.35), 'Earth');
    B.lbl.set('sun', solar.anchors.sun, 'Sun (schematic; distances compressed)');
    B.lbl.set('orbit', solar.anchors.orbit, 'Earth orbit: 1 AU (schematic)');
    B.lbl.set('target', solar.anchors.target, 'target orbit: 2.7 AU (schematic)');
    B.lbl.set('moon', solar.moon.getWorldPosition(V3()).add(V3(0, 0, 0.6)), 'Moon (orbit distance compressed)');
    B.lbl.declutter();
  }
  function reset() { Object.assign(S, { t: 0, running: false, started: false, ended: false, lastDyn: -1, idle: 0 }); draw(); dyn(); setMassControlsLocked(false); }
  function start() { reset(); S.started = true; S.running = true; setMassControlsLocked(true); }
  function togglePause() { if (!S.started || S.ended) { start(); return; } S.running = !S.running; S.lastDyn = -1; }
  function update(dt) {
    dt = Math.min(0.1, Math.max(0, dt));
    if (S.running) { S.t += dt; if (S.t >= TH.T_ANIM) { S.t = TH.T_ANIM; S.running = false; S.ended = true; S.lastDyn = -1; } }
    else if (!S.started) S.idle += dt;
    draw(); B.updateCam(dt);
    S.wall += dt; if (S.lastDyn < 0 || S.wall - S.lastDyn > 0.25) { S.lastDyn = S.wall; dyn(); }
  }
  function render() { B.render(); placeLabels(); }
  reset();
  return {
    key: 'thruster', S, B, update, render, start, reset, togglePause, setActive: B.setActive, panel: B.panel, state,
    info: {
      title: 'Earth-derived thrusters (reaction mass)',
      idea: 'Earth-mounted thrusters eject material taken from Earth opposite the desired orbital push. This model tests one explicit fuel budget with the ideal rocket equation; it is independent of the asteroid mass-driver.',
      calculations: [
        `Common requirement: Δv = ${fmtE(DV_REQ, 2)} m/s for 1 → 2.7 AU in 10,000 years.`,
        `Reference assumption: v_e = ${(THRUSTER.VE / 1000).toFixed(1)} km/s (Isp ≈ ${fmtE(THRUSTER.VE / THRUSTER.G0, 0)} s); chosen m_prop = ${fmtE(reference.mProp, 2)} kg = ${fmtE(100 * reference.massFraction, 2)}% of Earth, about ${fmtE(reference.moonMasses, 2)} lunar masses.`,
        `Δv = v_e ln[M_E/(M_E − m_prop)] gives ${fmtE(reference.dv, 2)} m/s; the slow-spiral estimate is a = ${reference.a10k.toFixed(5)} AU.`,
        `Rearranging for the target gives m_prop,req = M_E[1 − exp(−Δv_req/v_e)] = ${fmtE(reference.mNeed, 2)} kg (${fmtE(100 * reference.needFractionEarth, 1)}% of initial Earth mass).`,
        `At the same v_e, ideal exhaust kinetic energy is ${fmtE(reference.reqEnergy, 2)} J, or ${fmtE(reference.reqPower, 2)} W averaged over 10,000 years; losses are omitted.`,
        `Even the slider ceiling of ${fmtE(maximum.mProp, 2)} kg gives only ${fmtE(maximum.dv, 0)} m/s and ${maximum.a10k.toFixed(5)} AU; the requirement lies above the tested range.`,
      ],
      fails: [
        `The explicit ${fmtE(reference.mProp, 2)} kg budget is already ${fmtE(reference.moonMasses, 2)} lunar masses, yet provides only ${fmtE(100 * reference.dvProgress, 2)}% of the required Δv and ends at ${reference.a10k.toFixed(5)} AU.`,
        `At 10 km/s exhaust, the ideal rocket equation requires ${fmtE(reference.mNeed, 2)} kg — ${fmtE(reference.needMultiple, 1)} times the chosen amount and ${fmtE(100 * reference.needFractionEarth, 1)}% of Earth's initial mass.`,
        `The required exhaust-energy floor averages ${fmtE(reference.reqPower, 2)} W (${fmtE(reference.reqPowerMultipleSun, 1)} times the sunlight Earth absorbs). Engine, power plant, heat rejection, steering and structural losses are not included.`,
      ],
    },
  };
}
