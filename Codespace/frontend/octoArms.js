// OCTO-EARTH shared arm rig (update p37).
//
// The launcher ring and its 8 arms, as ONE reusable component. It is the same mechanism that the solar-system
// overview draws on Earth (ovextras.js used to build these meshes itself; it now calls createArmRig), and the two
// cinematic views (hydrogenScene.js, dysonScene.js) use exactly the same meshes, materials and arm shape:
//
//   * ring of radius RING_R around Earth's centre, 4 struts down to the surface, 8 root hubs (the shoulders)
//   * every arm has the fixed length ARM_L = 2 Earth radii; its path still comes from armCurve() in launcher.js,
//     but the visible arm is four rigid box-beam links joined by exposed servo drums, pistons and a three-jaw gripper
//   * 3 clear hinge joints per arm (orange caps) and a 3-finger, two-link claw at the tip (the end effector)
//
// Everything is in Earth radii in the parent's coordinates with Earth's centre at the origin; the caller scales the
// group. The ring plane is spanned by e1, e2 and its axis is ax (setFrame).
//
// Extra features used by the cinematic views (they do nothing in the overview):
//   * strain (0..1+): joints and segments are tinted towards hot red and the arm vibrates
//   * breakArm(): the arm snaps at a segment; the outer part flies off as one rigid piece (position + rotation are
//     analytic functions of time, so pause / replay are exact), the stump droops
//   * a pool of pre-created fragment shards (spawnFragments) - nothing is created or deleted while animating
import * as THREE from './vendor/three.module.js';
import { ARM_L, RING_R, armCurve } from './launcher.js';

export const SUPPORT_ARM_IDS = Object.freeze([0, 4]);
export const LAUNCH_ARM_COUNT = 6;
export const isSupportArm = (k) => SUPPORT_ARM_IDS.includes(k);
export const launchArmSlot = (k) => isSupportArm(k) ? -1 : (k < 4 ? k - 1 : k - 2);

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UPY = V3(0, 1, 0), N_LINKS = 4, VIS_SLOTS = N_LINKS + 1;
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _basis = new THREE.Matrix4(), _sc = V3(), _u = V3(), _mid = V3(), _seg = V3(),
  _a = V3(), _b = V3(), _c = V3(), _side = V3(), _side2 = V3(), _boxX = V3(), _boxY = V3(), _boxZ = V3(),
  _jawBase = V3(), _elbow = V3(), _endDir = V3(), _end = V3(), _col = new THREE.Color();
const COL_COOL = new THREE.Color(1, 1, 1), COL_HOT = new THREE.Color(1.0, 0.22, 0.12), COL_SEG_HOT = new THREE.Color(1.0, 0.55, 0.45);

/** Materials of the mechanism. 'overview' = the exact look of the solar-system overview (self-lit so it reads at
 *  small size); 'cinematic' = the same colours, less self-glow, more metal, for the lit close-up scenes. */
export function armMaterials(look = 'overview') {
  if (look === 'cinematic') {
    return {
      metal: new THREE.MeshStandardMaterial({ color: 0xc4ccd8, metalness: 0.75, roughness: 0.3, emissive: 0x1a2230, emissiveIntensity: 0.28 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x66717f, metalness: 0.7, roughness: 0.38, emissive: 0x0c1118, emissiveIntensity: 0.3 }),
      joint: new THREE.MeshStandardMaterial({ color: 0xffb060, metalness: 0.3, roughness: 0.45, emissive: 0x6a3008, emissiveIntensity: 0.5 }),
    };
  }
  return {
    metal: new THREE.MeshStandardMaterial({ color: 0xc4ccd8, metalness: 0.55, roughness: 0.35, emissive: 0x3a4658, emissiveIntensity: 0.5 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x66717f, metalness: 0.6, roughness: 0.4, emissive: 0x1c2430, emissiveIntensity: 0.45 }),
    joint: new THREE.MeshStandardMaterial({ color: 0xffb060, emissive: 0xff8a30, emissiveIntensity: 0.58 }),
  };
}

function placeInstance(mesh, idx, pos, dir, sx, sy, sz) {
  _q.setFromUnitVectors(UPY, _u.copy(dir).normalize()); _sc.set(sx, sy, sz); _m.compose(pos, _q, _sc); mesh.setMatrixAt(idx, _m);
}
function placeBeam(mesh, idx, a, b, side, width, depth) {
  _boxY.subVectors(b, a); const len = _boxY.length();
  if (len < 1e-4) { hideInstance(mesh, idx); return; }
  _boxY.multiplyScalar(1 / len);
  _boxX.copy(side).addScaledVector(_boxY, -side.dot(_boxY));
  if (_boxX.lengthSq() < 1e-7) _boxX.set(0, 0, 1).addScaledVector(_boxY, -_boxY.z);
  _boxX.normalize(); _boxZ.crossVectors(_boxX, _boxY).normalize();
  _basis.makeBasis(_boxX, _boxY, _boxZ); _q.setFromRotationMatrix(_basis);
  _mid.addVectors(a, b).multiplyScalar(0.5); _sc.set(width, len * 1.02, depth); _m.compose(_mid, _q, _sc); mesh.setMatrixAt(idx, _m);
}
function hideInstance(mesh, idx) { _sc.set(0, 0, 0); _m.compose(_mid.set(0, 0, 0), _q.identity(), _sc); mesh.setMatrixAt(idx, _m); }

/**
 * Build the ring + 8 arms.
 * opt: { nseg = 10, look = 'overview' | 'cinematic', fragments = 0 (size of the shard pool), armL = ARM_L, ringR = RING_R }
 */
export function createArmRig(opt = {}) {
  const o = { n: 8, nseg: 10, look: 'overview', fragments: 0, armL: ARM_L, ringR: RING_R, ...opt };
  const N = o.n, NSEG = o.nseg;
  const group = new THREE.Group();
  const mat = armMaterials(o.look);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(o.ringR, 0.07, 10, 128), mat.metal); group.add(ring);
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 12);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const struts = new THREE.InstancedMesh(unitCyl, mat.dark, 4);
  const segs = new THREE.InstancedMesh(box, mat.metal, N * VIS_SLOTS);       // 4 rigid links + one optional split link
  const rails = new THREE.InstancedMesh(box, mat.dark, N * VIS_SLOTS * 2);  // paired structural rails on each link
  const joints = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 16), mat.dark, N * 3);
  const jointCaps = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 16), mat.joint, N * 6);
  const claws = new THREE.InstancedMesh(box, mat.metal, N * 6);              // two rigid links per each of 3 jaws
  const clawPads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), mat.joint, N * 3);
  const hubs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.15, 0.2, 16), mat.dark, N);
  for (const m of [struts, segs, rails, joints, jointCaps, claws, clawPads, hubs]) { m.frustumCulled = false; group.add(m); }
  for (let i = 0; i < N * VIS_SLOTS; i++) segs.setColorAt(i, COL_COOL);
  for (let i = 0; i < N * 3; i++) { joints.setColorAt(i, COL_COOL); clawPads.setColorAt(i, COL_HOT); }
  for (let i = 0; i < N * 6; i++) { jointCaps.setColorAt(i, COL_COOL); claws.setColorAt(i, COL_COOL); }
  // pre-created fragment shards (hidden until spawned; never created or removed while animating)
  const NF = o.fragments;
  const frags = NF ? new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1, 0), mat.dark, NF) : null;
  const fragState = [...Array(NF)].map(() => ({ on: false, t0: 0, p0: V3(), v: V3(), axis: V3(1, 0, 0), w: 0, s: 0.05 }));
  if (frags) { frags.frustumCulled = false; group.add(frags); for (let i = 0; i < NF; i++) hideInstance(frags, i); }

  const F = { e1: V3(1, 0, 0), e2: V3(0, 1, 0), ax: V3(0, 0, 1), phase: 0 };
  const arms = [...Array(N)].map((_, k) => ({
    k, dir: V3(), base: V3(), pts: [...Array(NSEG + 1)].map(() => V3()), tip: V3(), open: 0.35, strain: 0, broken: null, side: V3(),
  }));

  /** Ring plane e1, e2 (unit, orthogonal), axis ax; phaseDeg rotates the 8 roots around the axis. */
  function setFrame(e1, e2, ax, phaseDeg = 0) {
    F.e1.copy(e1); F.e2.copy(e2); F.ax.copy(ax); F.phase = phaseDeg * Math.PI / 180;
    _m.makeBasis(F.e1, F.e2, F.ax); ring.quaternion.setFromRotationMatrix(_m);
    for (let s2 = 0; s2 < 4; s2++) {           // struts from the surface up to the ring
      const a = (s2 * 90 + 22.5) * Math.PI / 180 + F.phase; _seg.copy(F.e1).multiplyScalar(Math.cos(a)).addScaledVector(F.e2, Math.sin(a));
      _mid.copy(_seg).multiplyScalar((1 + o.ringR) / 2); placeInstance(struts, s2, _mid, _seg, 0.04, o.ringR - 0.98, 0.04);
    }
    struts.instanceMatrix.needsUpdate = true;
    for (const arm of arms) {
      const ang = arm.k * Math.PI / 4 + F.phase;
      arm.dir.copy(F.e1).multiplyScalar(Math.cos(ang)).addScaledVector(F.e2, Math.sin(ang));
      arm.base.copy(arm.dir).multiplyScalar(o.ringR + 0.05);
      arm.side.copy(F.ax).multiplyScalar(arm.k % 2 ? -1 : 1);
      _mid.copy(arm.dir).multiplyScalar(o.ringR + 0.03); placeInstance(hubs, arm.k, _mid, arm.dir, 1, 1, 1);
    }
    hubs.instanceMatrix.needsUpdate = true;
  }
  setFrame(F.e1, F.e2, F.ax, 0);

  /** Rest pose target of arm k (reaching outward, alternately above / below the ring, slow sway with time t). */
  function restTarget(k, t, out) {
    const arm = arms[k];
    return out.copy(arm.base).addScaledVector(arm.dir, 1.25 + 0.12 * Math.sin(0.9 * t + k))
      .addScaledVector(F.ax, (k % 2 ? -0.7 : 0.7) + 0.18 * Math.sin(0.7 * t + 1.3 * k));
  }

  /** Shape of an intact arm: armCurve (fixed length) + a strain vibration across the arm. */
  function shapeArm(arm, T, t) {
    armCurve(arm.base, T, arm.side, arm.pts, NSEG, o.armL);
    if (arm.strain > 0.02) {
      _a.subVectors(arm.pts[NSEG], arm.pts[0]).normalize(); _b.crossVectors(_a, arm.side).normalize();
      const amp = 0.05 * Math.min(2, arm.strain) ** 1.5, w = 23 + 3 * arm.k;
      for (let j = 1; j <= NSEG; j++) {
        const env = Math.sin(Math.PI * j / NSEG) + 0.3 * j / NSEG;
        arm.pts[j].addScaledVector(_b, amp * env * Math.sin(w * t + 1.7 * arm.k + 0.6 * j)).addScaledVector(arm.side, 0.6 * amp * env * Math.sin(0.7 * w * t + arm.k));
      }
    }
  }

  /** Points of a broken arm at time t: stump drooping from the root, outer piece flying as one rigid body. */
  function shapeBroken(arm, t) {
    const B = arm.broken, dt = Math.max(0, t - B.t0);
    const droop = B.droop * (1 - Math.exp(-3 * dt)) + 0.05 * Math.exp(-1.2 * dt) * Math.sin(9 * dt);
    _q.setFromAxisAngle(B.droopAxis, droop);
    for (let j = 0; j <= B.s; j++) arm.pts[j].copy(B.stump[j]).sub(arm.base).applyQuaternion(_q).add(arm.base);
    _q2.setFromAxisAngle(B.axis, B.w * dt);
    _c.copy(B.p0).addScaledVector(B.v, dt);
    for (let j = B.s; j <= NSEG; j++) {
      const p = B.outer[j - B.s];
      B.outPts[j - B.s].copy(p).applyQuaternion(_q2).add(_c);
    }
  }

  /**
   * Pose all arms. targets[k] = claw target (Vector3, may be pulled in to reach); opts:
   *   open:   claw opening (number or array, radians), strain: number or array (0 = relaxed, >= 1 = overloaded)
   *   t:      time (s) for vibration and broken-piece motion
   */
  function pose(targets, opts = {}) {
    const t = opts.t || 0;
    for (const arm of arms) {
      arm.open = Array.isArray(opts.open) ? opts.open[arm.k] : (opts.open ?? 0.35);
      arm.strain = Array.isArray(opts.strain) ? opts.strain[arm.k] : (opts.strain || 0);
      if (arm.broken) shapeBroken(arm, t);
      else { _a.copy(targets[arm.k]); shapeArm(arm, _a, t); }
      const B = arm.broken;
      const P = (j) => (B && j > B.s ? B.outPts[j - B.s] : arm.pts[j]);
      const P0 = (j) => (B && j >= B.s ? B.outPts[j - B.s] : arm.pts[j]);
      const armSlot = arm.k * VIS_SLOTS;
      const strainLink = _col.copy(COL_COOL).lerp(COL_SEG_HOT, Math.min(1, Math.max(0, arm.strain - 0.35) / 0.9));
      function beam(slot, a, b) {
        const idx = armSlot + slot;
        placeBeam(segs, idx, a, b, arm.side, 0.22, 0.16);
        segs.setColorAt(idx, strainLink);
        const railOffset = 0.082;
        _a.copy(arm.side).multiplyScalar(railOffset);
        placeBeam(rails, idx * 2, _b.copy(a).add(_a), _c.copy(b).add(_a), arm.side, 0.045, 0.055);
        _a.copy(arm.side).multiplyScalar(-railOffset);
        placeBeam(rails, idx * 2 + 1, _b.copy(a).add(_a), _c.copy(b).add(_a), arm.side, 0.045, 0.055);
      }
      for (let sec = 0; sec < N_LINKS; sec++) {
        const j0 = Math.round(sec * NSEG / N_LINKS), j1 = Math.round((sec + 1) * NSEG / N_LINKS);
        if (B && j0 < B.s && j1 >= B.s) {
          beam(sec, arm.pts[j0], arm.pts[Math.max(j0, B.s - 1)]);  // stump-side link
          beam(N_LINKS, B.outPts[0], P0(j1));                      // detached outer link
        } else beam(sec, P0(j0), P(j1));
      }
      if (!B || B.s < 1 || B.s >= NSEG) {
        hideInstance(segs, armSlot + N_LINKS); hideInstance(rails, (armSlot + N_LINKS) * 2); hideInstance(rails, (armSlot + N_LINKS) * 2 + 1);
      } else {
        // Extra slot is only active when one of the four rigid links spans the snap.
        const split = Math.floor((B.s - 1) / (NSEG / N_LINKS));
        if (split < 0 || split >= N_LINKS) { hideInstance(segs, armSlot + N_LINKS); hideInstance(rails, (armSlot + N_LINKS) * 2); hideInstance(rails, (armSlot + N_LINKS) * 2 + 1); }
      }
      const jointCol = _col.copy(COL_COOL).lerp(COL_HOT, Math.min(1, Math.max(0, arm.strain - 0.3) / 0.7));
      for (let j = 0; j < 3; j++) {
        const pointIndex = Math.round((j + 1) * NSEG / N_LINKS), p = P0(pointIndex), ji = arm.k * 3 + j;
        placeInstance(joints, ji, p, arm.side, 0.13, 0.24, 0.13); joints.setColorAt(ji, jointCol);
        const capBase = (arm.k * 3 + j) * 2;
        placeInstance(jointCaps, capBase, _a.copy(p).addScaledVector(arm.side, 0.135), arm.side, 0.082, 0.04, 0.082);
        placeInstance(jointCaps, capBase + 1, _a.copy(p).addScaledVector(arm.side, -0.135), arm.side, 0.082, 0.04, 0.082);
        jointCaps.setColorAt(capBase, jointCol); jointCaps.setColorAt(capBase + 1, jointCol);
      }
      const tip = P(NSEG); arm.tip.copy(tip);
      _seg.subVectors(tip, P(NSEG - 1)).normalize();
      _side.crossVectors(_seg, F.ax); if (_side.lengthSq() < 1e-6) _side.set(1, 0, 0); _side.normalize(); _side2.crossVectors(_seg, _side).normalize();
      for (let c = 0; c < 3; c++) {
        const th = c * 2.09439510239;
        _a.copy(_side).multiplyScalar(Math.cos(th)).addScaledVector(_side2, Math.sin(th)).normalize();
        _b.copy(_seg).multiplyScalar(Math.cos(arm.open)).addScaledVector(_a, Math.sin(arm.open)).normalize();
        _jawBase.copy(tip).addScaledVector(_b, 0.025); _elbow.copy(_jawBase).addScaledVector(_b, 0.16);
        _endDir.copy(_b).addScaledVector(_a, -0.32 * (1 - Math.min(1, arm.open))).normalize();
        _end.copy(_elbow).addScaledVector(_endDir, 0.12);
        const fi = arm.k * 6 + c * 2;
        placeBeam(claws, fi, _jawBase, _elbow, _a, 0.085, 0.07);
        placeBeam(claws, fi + 1, _elbow, _end, _a, 0.065, 0.06);
        claws.setColorAt(fi, strainLink); claws.setColorAt(fi + 1, strainLink);
        placeInstance(clawPads, arm.k * 3 + c, _end, _endDir, 0.055, 0.07, 0.055);
      }
    }
    for (const m of [segs, rails, joints, jointCaps, claws, clawPads]) m.instanceMatrix.needsUpdate = true;
    segs.instanceColor.needsUpdate = true; joints.instanceColor.needsUpdate = true; jointCaps.instanceColor.needsUpdate = true; claws.instanceColor.needsUpdate = true;
    updateFragments(t);
  }

  /**
   * Snap arm k between point s-1 and s (1 <= s < NSEG) at time t0. The outer part flies off with velocity v
   * (Earth radii per second) and spins at w rad/s around a random axis; the stump droops by 'droop' radians.
   * Uses the arm's CURRENT shape, so call it after a pose().
   */
  function breakArm(k, s, t0, v, w = 1.5, droop = 0.45, axisSeed = 0) {
    const arm = arms[k]; if (arm.broken) return false;
    s = Math.max(1, Math.min(NSEG - 1, s));
    const p0 = arm.pts[s].clone();
    const axis = V3(Math.sin(1.7 + axisSeed * 2.3), Math.cos(0.9 + axisSeed * 1.1), Math.sin(0.4 + axisSeed)).normalize();
    arm.broken = {
      s, t0, p0, v: v.clone(), w, axis, droop,
      droopAxis: V3().crossVectors(arm.dir, F.ax).normalize().multiplyScalar(arm.k % 2 ? 1 : -1),
      stump: arm.pts.slice(0, s + 1).map((p) => p.clone()),
      outer: arm.pts.slice(s).map((p) => p.clone().sub(p0)),
      outPts: arm.pts.slice(s).map((p) => p.clone()),
    };
    return true;
  }

  /** Release n shards from the pool at position p (parent coords) at time t0, around velocity v. */
  let fragNext = 0;
  function spawnFragments(p, n, t0, v, spread = 0.6, size = 0.05, seed = 0) {
    for (let i = 0; i < n && NF; i++) {
      const f = fragState[fragNext]; fragNext = (fragNext + 1) % NF;
      const h1 = Math.sin(12.9898 * (i + 1) + 78.233 * (seed + 1)) * 43758.5453, h2 = Math.sin(39.346 * (i + 1) + 11.135 * (seed + 2)) * 24634.6345, h3 = Math.sin(73.156 * (i + 1) + 52.235 * (seed + 3)) * 12345.678;
      const r1 = h1 - Math.floor(h1), r2 = h2 - Math.floor(h2), r3 = h3 - Math.floor(h3);
      const th = 2 * Math.PI * r1, z = 2 * r2 - 1, rr = Math.sqrt(1 - z * z);
      f.on = true; f.t0 = t0; f.p0.copy(p); f.v.copy(v).add(_a.set(rr * Math.cos(th), rr * Math.sin(th), z).multiplyScalar(spread * (0.35 + 0.65 * r3)));
      f.axis.set(r2 - 0.5, r3 - 0.5, r1 - 0.5).normalize(); f.w = 2 + 6 * r3; f.s = size * (0.5 + r1);
    }
  }
  function updateFragments(t) {
    if (!NF) return;
    for (let i = 0; i < NF; i++) {
      const f = fragState[i];
      if (!f.on || t < f.t0) { hideInstance(frags, i); continue; }
      const dt = t - f.t0; _q.setFromAxisAngle(f.axis, f.w * dt); _sc.setScalar(f.s);
      _m.compose(_c.copy(f.p0).addScaledVector(f.v, dt), _q, _sc); frags.setMatrixAt(i, _m);
    }
    frags.instanceMatrix.needsUpdate = true;
  }

  /** Back to intact arms, no fragments. */
  function reset() {
    for (const arm of arms) { arm.broken = null; arm.strain = 0; }
    for (const f of fragState) f.on = false; fragNext = 0;
  }
  /** Position of joint j (0 shoulder .. 2 wrist) of arm k. */
  function jointPoint(k, j, out) { return out.copy(arms[k].pts[Math.round((j + 1) * NSEG / N_LINKS)]); }

  return {
    group, arms, frame: F, setFrame, restTarget, pose, breakArm, spawnFragments, reset, jointPoint,
    meshes: { ring, struts, segs, rails, joints, jointCaps, claws, clawPads, hubs, frags }, materials: mat, NSEG, N, armL: o.armL, ringR: o.ringR,
    brokenCount: () => arms.filter((a) => a.broken).length,
  };
}
