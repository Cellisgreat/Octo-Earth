# OCTO-EARTH - results report

Generated 2026-10-25 06:12:28  |  preset **hypothetical**

> **Historical pre-hold archive.** This comparison predates the controlled-target-hold task and uses the older first-capture success definition. It is not evidence of current PPO performance or active maintenance. No current-version PPO retraining or target-hold evaluation is claimed.

## Feasibility gate (analytic)

**FEASIBLE within this model (physically hypothetical scale)**

- Required slow-spiral delta-v 1 -> 2.7 AU: 11,658 m/s (Hohmann two-impulse: 10,997 m/s)
- Orbital energy change of Earth+Moon: 1.697e+33 J; angular momentum change 1.741e+40 kg m^2/s
- Average power just for the orbital energy change over 10,000 y: 5.377e+21 W  (= 3.10e+04 x all sunlight intercepted by Earth)
- Minimum launch energy with this reservoir: 1.664e+35 J -> average power 5.273e+23 W (= 1.38e-03 x total solar luminosity)
- Reaction mass needed at max speed: 1.415e+22 kg (0.193 lunar masses); available 3.000e+22 kg
- Max launch speed = 1.67% of c (non-relativistic model; error grows above ~10% c)
- Solar collectors: 30% of the Sun's output = 1.148e+26 W intercepted at 0.5 AU; electricity delivered to the arms 1.290e+25 W with Earth at 1 AU, 1.114e+25 W at 2.7 AU; launcher peak demand (max packet rate and speed) 6.338e+24 W -> the beams supply 1.76x the peak demand
- [OK ] mass: needs launch speed 2.355e+06 m/s with ALL 3.00e+22 kg; max allowed 5.000e+06 m/s (mass-limited delta-v capacity 2.475e+04 m/s vs required 1.166e+04 m/s)
- [OK ] energy: minimum energy drawn 1.664e+35 J vs available 3.817e+36 J (reserve 3.000e+35 J + collectors 1.114e+25 W x 10,000 y)
- [OK ] rate: at max packet rate and speed the transfer needs >= 1,771 years (mission 10,000 y)
- [OK ] combined: slowest speed meeting mass AND time limits 2.355e+06 m/s -> needs 3.000e+22 kg and 1.664e+35 J

## Physics checks

- PASS - 1 two-body motion vs Kepler: Kepler 1-orbit closure 1.4e-14; N-body vs Kepler after 1 y: 261.0 m
- PASS - 2 gravity of Sun / Earth / Moon / asteroid / fragments: Sun->Earth 6.133e-03, Moon->Earth 3.715e-05, Earth(+asteroid)->Moon 3.035e-03, Mars->Earth 5.594e-10 at 1.85 AU (Earth->Mars 5.233e-09, ratio = mass ratio) m/s^2; Jupiter->Earth 2.651e-07 at 4.62 AU, Venus->Earth 1.122e-08, Mercury->Earth 4.914e-10; asteroid mass scales Earth's pull by 1.005023; fragment(1e20 kg @1e6 km)->Earth 6.674e-09 m/s^2
- PASS - 3 equal and opposite forces: |sum m a| / sum|m a| = 7.2e-17
- PASS - 4+6 momentum & angular momentum in ejection: high-fidelity ejection: |dP|/(M_E v_E) = 1.1e-14 (round-off), |dL|/|L| = 1.3e-16; fast model |dP|/(dm u) = 1.2e-05 (incl. 1 ms of solar gravity)
- PASS - 5 energy accounting of propulsion: measured system energy change vs 1/2 mu u^2 - G dm M/R: rel diff 2.6e-08; drawn = KE/eta; budget never exceeded (tiny budget -> packet reduced to 1.11e+17 kg)
- PASS - 7 finite asteroid mass & fragment mass accounting: total mass + escaped mass - initial = 0.0e+00 (rel); merges=20, escaped 1.60e+19 kg; reservoir cannot go negative (5e18 kg reservoir -> ejected 5.00e+18 kg)
- PASS - 8 reversed ejection direction: prograde da = +0.0225 AU, retrograde da = -0.0217 AU (asymmetry 0.03)
- PASS - 9 fragment fall-back / escape / Earth impact: sub-escape packet falls back (no net recoil, energy lost): True; fast packet leaves the system and is ledgered as escaped: True; fragment aimed at Earth merges with momentum conserved: True
- PASS - 11 reproducibility (fixed seed): identical results for seed 7 (a=1.638128 AU)
- PASS - 13 viewer continuity (interpolation of recorded states): ballistic join between rows 1.1e-11 AU without the planets' pull (no hidden jumps); Mars + Mercury + Venus + Jupiter move Earth by up to 1.4e-04 AU in 5 y (smooth, far below the drawing accuracy); viewer Hermite curve vs exact arc max 3.3e-05 AU; recoil |v_post - v_pre| matches recorded value to 5.7e-12; packet path bends 6.4e-05 (relative) from a straight line after 1 day under solar gravity
- PASS - 14 Moon in the fast (training) model: 1 y without thrust: Earth-Moon distance fast 363,297-405,504 km vs N-body 361,806-399,330 km (max diff 10,422 km); Moon's orbital phase drifts 22 deg/yr (Sun's tide on the Moon not in the fast model); barycentre diff 84 km; Earth wobble from the Moon's pull 4,874 km; recoil changes the Earth-Moon relative velocity by Earth's recoil only (rel. error 6.4e-12); Moon bound: yes
- PASS - 15 Mars gravity (both models, two-way): 20 y without thrust: Mars position fast vs N-body 483 km, Earth-Moon centre 2,846 km; Mars placed 0.02 AU ahead of Earth, after 1 y, changes Earth's velocity by 27.6 m/s (gravity on vs off); Earth<->Mars pull equal and opposite (momentum residual 6.6e-10); Mars is kicked 9.47x harder than Earth (= mass ratio), so Mars's orbit changes too
- PASS - 16 planetary-safety limits and Mars shield: safe distance 3.67 million km (0.0246 AU, set by: tide on Earth); tide ratio at the tide limit = 1.000000000000 x limit; forecast vs simulated 10-y closest approach 0.3797 vs 0.3730 AU (1.8e-02); shielded heuristic mission (seed 5): closest Mars pass 0.0503 AU, 536 shield overrides, outcome success
- PASS - 17 solar collectors and microwave power beaming: power chain 3.828e+26 W x 0.3 x (1 - lanes 5.1e-05) x rated 0.25 x temperature 0.696 (panels 450 K, energy balance 8e-17) x age 0.950 x 0.8 x capture 0.999 x 0.85 = 1.290e+25 W at 1 AU (exact to 0e+00); Goubau tau=1 -> 0.6321 (0e+00); belt covers |latitude| <= 17.5 deg; with a reserve of only 1e28 J the fast / N-body engines launched 1.44e+32 / 1.44e+32 J powered by the beams (bookkeeping residual 1e-16, never more than offered); collectors off -> never more than the reserve: True; 5e+06 collectors of 64,950 km each; Earth's clear sunlight lane 1.8e-05 of the belt; beams supply 2.0x the launcher's peak demand
- PASS - 18 climate + space mirrors + energy ledger: equilibrium today 288.00 K, at 2.7 AU without extra light 152 K (frozen); mirrors 1.6e+15 m^2 (8e+12 kg) can send 1.10 x today's sunlight at 2.7 AU; heuristic mission with the space mirrors: success, final 288.1 K (max deviation 2.4 K, 0 y outside +-15 K); without it: deadline, 152 K; ledger: in 1.363e+37 J = reflected 1.36e+36 + collector heat 1.20e+37 + manufacturing 1.6e+31 + transmitter heat 5.39e+34 + spill 5.48e+33 + rectenna heat 3.15e+34 + packet KE 8.93e+34 + launcher heat 8.93e+34; mirrors: sunlight 8.55e+28 = onto Earth 1.16e+28 + past Earth 6.53e+28 + mirror heat 8.55e+27 (residual 4e-16); heat reaching Earth 1.26e+26 J
- PASS - 19 collector belt station keeping: 12 collectors x 300 y: station keeping ON -> max distance from the assigned slot 640 km (rms 589 km; spacing between collectors 64,950 km), control 96 m/s per year each; OFF -> the orbit's shape changes little (semi-major axis 34,900 km, e 1.7e-02, distance from the Sun swings by up to 1,296,747 km) but the collectors drift along the orbit up to 147,205,091 km = 2,266 slots (collisions); beam recoil 1.2e-04 of the Sun's pull, planets 2.5e-06, neighbour 3e-10, control limit 3.8e-03; belt's net pull on Earth 1e-09 (1 AU) / 1e-09 (target) of the Sun's
- PASS - 20 other planets: Mercury, Venus, Jupiter (both models, two-way): 100 y without thrust, fast vs N-body: Mercury 1.7e-04, Venus 1.3e-04, Jupiter 1.7e-05 AU, Earth-Moon centre 1.1e-04 AU; orbit sizes after 1,000 y change by 1.4e-06 (relative); Jupiter pulls Earth 2.65e-07 m/s^2 and Earth pulls Jupiter 8.38e-10 (ratio = mass ratio: True); 1,500-y heuristic mission: final a 2.2340 AU with the planets vs 2.2342 without, e 0.0072 vs 0.0093; closest Venus 0.268 AU, Jupiter 2.747 AU; safe distances (Mars rules): Mercury 0.0197, Venus 0.0483, Jupiter 0.3526 AU
- PASS - 21 launcher geometry: asteroid on the ring axis, 2 R_E arms: 8 roots on a 1.25 R_E ring, grab point 1.25 R_E up the axis: every root 1.7678 R_E from it (spread 0e+00) <= arm 2.0 R_E; asteroid (r 0.240 R_E at 2000 kg/m^3) centre 1.945 R_E from every root; 1,593 km above the surface; joint-throw stroke 1,983 km (same when the asteroid is used up) -> 1.55e+06 m/s^2 for 2,480 km/s; escape energy from the surface instead of the release point (1.288 R_E): +4.6e-06 (conservative); asteroid merged with Earth: centre-of-mass offset 47 km, tidal error on the Moon 9.4e-06 of Earth's pull
- PASS - 22 controlled target hold before success: in-window arrival does not terminate; success only after 2/2 controlled hold years (states [(False, True, 0.0, None), (False, True, 1.0, None), (True, True, 2.0, 'success')]); observation phase clock 0.00
- PASS - 10 integrator convergence: Earth position error after 10 y at dt 12/6/3 h: 498639/37700/2360 m (ratios 13.2, 16.0; 4th order -> 16)
- PASS - 10b energy / angular-momentum drift: 100 y ballistic: |dE/E| = 5.1e-12, |dL|/|L| = 3.9e-14
- PASS - 12 fast model vs high-fidelity N-body: heuristic, 1,500 y, shield off: a fast 2.24000 vs high-fidelity 2.23952 AU (rel 2.1e-04), |de| 5.7e-05; with Mars gravity + shield: 2.2340 vs 2.2268 AU (rel 3.3e-03; 16 vs 56 shield overrides)

## Participant-guide benchmarks (supplied guide, p. 9)

| # | benchmark | expected value / tolerance | result | detail |
|---:|---|---|---|---|
| 1 | Lorentz force on a straight wire | 10 N along +z; relative vector error ≤ 1e-9 | PASS | F = [0, 0, 10] N; vector relative error 0.00e+00 |
| 2 | Closed loop in a uniform magnetic field | net force 0; ≤ 1e-9 of I·L·B | PASS | net force = 1.002e-13 N; relative to I·L·B = 2.33e-16 |
| 3 | Biot–Savart field of a long wire | 2.000e-4 T at 1 m, 1 kA; relative error ≤ 1e-6 | PASS | B(1 m, 1 kA) = 0.0002 T; relative error 0.00e+00 |
| 4 | Eccentric Kepler orbit, 10 periods | return within 1e-6 a; energy within 1e-9; as stated | PASS | a = 1 AU, e = 0.3, 10 periods: return error 6.47e-14 a; specific-energy drift 0.00e+00 |
| 5 | Five-year solar-system energy baseline | energy constant; relative drift ≤ 1e-9 | PASS | 5 simulated years, no thrust, 6 h Yoshida-4 step: |ΔE/E| = 1.29e-11 |
| 6 | Earth–Moon barycentre period | 365.256 days; ± 0.1 day | PASS | Earth-Moon barycentre sidereal period = 365.256343 days; error 0.0003 day |
| 7 | Hohmann transfer, 1 to 1.524 AU | 2.94 + 2.65 km/s; ~259 days; ±0.02 km/s per burn; ±2 days | PASS | Δv = 2.9461 + 2.6500 km/s; transfer time = 258.92 days |
| 8 | Gauss orbit growth under 1e-8 m/s² tangential push | ~3,170 km in 1 year; ± 1% | PASS | a grows by 3,170.1 km in 1 simulated year; one-day RK4 steps; relative error vs 3,170 km = 0.002% |
| 9 | Uniform-load cantilever self-weight screen | M = qL²/2; δ = qL⁴/(8EI); relative formula error ≤ 1% | PASS | root moment qL²/2 = 5e+03 N·m; tip deflection qL⁴/8EI = 0.00625 m; numerical relative errors M=0.00e+00, δ=6.25e-08; example bending SF=50.00 (illustrative inputs only) |
| 10 | Blackbody equilibrium at 1 AU, albedo 0.306 | ~254 K; ± 2 K | PASS | 1 AU, albedo 0.306: blackbody effective temperature = 254.03 K; difference from 254 K = 0.03 K |

Benchmark 9 is a formula-level cantilever check only; it does not certify the simulation's launcher or collector arms.

## Training

State idle, 0 episodes, 0 timesteps, 0 s wall time (fast model).
Best model: episode 50, selection = lexicographic: success rate, then lowest terminal orbit error, then lowest energy use (deterministic, seeds 1001-1002).
Hyperparameters: {"algorithm": "PPO (Stable-Baselines3)", "net_arch": [64, 64], "n_steps": 1000, "batch_size": 200, "n_epochs": 10, "learning_rate": 0.0003, "gamma": 0.995, "gae_lambda": 0.95, "log_std_init": -0.5, "seed": 1}
Deterministic eval at selection: {"success_rate": 0.5, "error": 0.047045788568952224, "energy_frac": 0.5793407742658734, "years": 7650.0, "reward": 128.65269895435245, "a_au": 2.6576779874443943, "e": 0.011075243532827269, "score": [0.5, -0.047, -0.5793407742658734], "episode": 50, "timesteps": 3823}

## Comparison (physical metrics; reward shown separately)

Archived pre-hold first-capture results only; hold fields are not recorded and old success/validated flags do not establish current active maintenance.

| policy | historical fast success | archived hi-fi result | hi-fi a [AU] | e | mission years | hold years | hold resets | asteroid used | energy used [J] | old first-capture success flag (not current) | reward (hi-fi) |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|---:|
| No ejection | 0% | deadline | 1.0000 | 0.0122 | 10,000 | not recorded (pre-hold) | not recorded | 0.0% | 0.000e+00 | False | -53.3 |
| Hand-designed heuristic | 100% | success | 2.6903 | 0.0072 | 3,600 | not recorded (pre-hold) | not recorded | 95.2% | 1.756e+35 | True | 214.7 |
| Best PPO model | 67% | success | 2.6854 | 0.0145 | 7,600 | not recorded (pre-hold) | not recorded | 99.5% | 1.732e+35 | True | 194.8 |

## Mars safety (high-fidelity runs)

Safe distance 0.0246 AU (Earth came closer to Mars than the planetary-safety distance (or collided). Mars's tides or its pull on the Moon would exceed the limits set to keep people safe (failure).)

| policy | closest Mars pass [AU] | at year | safe | Mars tide (x Moon's) | Mars pull on Moon orbit | shield overrides | Mars a: start -> end [AU] | Mars e |
|---|---|---|---|---|---|---|---|---|
| No ejection | 0.3670 | 8,525 | True | 3.00e-06 | 7.37e-08 | 0 | 1.5237 -> 1.5237 | 0.0934 -> 0.0982 |
| Hand-designed heuristic | 0.0502 | 2,070 | True | 1.17e-03 | 2.88e-05 | 272 | 1.5237 -> 1.5577 | 0.0934 -> 0.0925 |
| Best PPO model | 0.0470 | 3,149 | True | 1.43e-03 | 3.52e-05 | 296 | 1.5237 -> 1.5114 | 0.0934 -> 0.0971 |

Mars's final orbit is chaotic (sensitive to small differences); see README, 'Mars'.

## Solar collectors and microwave power (high-fidelity runs)

Belt at 0.5 AU intercepting 30% of the Sun's output (1.148e+26 W): 2.11e+22 m^2 of collectors (+/- 17.5 deg around Earth's orbital plane), 5e+06 collectors of ~64,950 km each, ~2.1e+21 kg of material (2.9% of the Moon) at 0.1 kg/m^2; light pressure = 0.8% of the Sun's gravity on them. Chain: solar cells 25% -> microwaves 80% (5.8 GHz) -> captured by the 8 arm rectennas (Goubau, 30 km transmitters, 1000 km rectennas) -> electricity 85%.

| policy | energy from collectors [J] | from reserve [J] | microwaves absorbed [J] | mean / peak beam power [W] | capture efficiency | heat at the arms (mean) | microwave push (not applied) |
|---|---|---|---|---|---|---|---|
| No ejection | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.00e+00 / 0.00e+00 | 0.999-0.999 | 0.00e+00 W (= 0.0e+00 x the sunlight Earth intercepts) | 0 m/s |
| Hand-designed heuristic | 1.756e+35 | 0.000e+00 | 2.066e+35 | 1.82e+24 / 1.83e+24 | 0.881-0.999 | 1.05e+24 W (= 6.0e+06 x the sunlight Earth intercepts) | 114 m/s |
| Best PPO model | 1.732e+35 | 0.000e+00 | 2.037e+35 | 8.49e+23 / 1.84e+24 | 0.872-0.999 | 4.88e+23 W (= 2.8e+06 x the sunlight Earth intercepts) | 112 m/s |

The microwave push is an estimate (not applied). The heat at the arms is radiated away from Earth by assumption (a modeled supporting-radiator assumption, not a selected enabler); the share arm_heat_to_earth_frac that reaches Earth is part of the climate model.

Panels: rated 25% at 25 C, operating 0.165 (panel temperature 450 K -> x0.696; age x0.950). Build-up: 30% at year 0, complete after 400 y. Replacement 4.22e+19 kg/yr (95% recycled); fresh material over the mission 2.32e+22 kg = 7.0% of Mercury. Earth's sunlight lane kept clear. Belt's pull on Earth 1e-09 of the Sun's.

## Energy ledger (high-fidelity runs, whole mission)

| policy | sunlight on collectors | reflected | collector heat | manufacturing | transmitter heat | beam spill | rectenna heat | packet kinetic energy | launcher heat | sunlight on mirrors | mirror light onto Earth | mirror light past Earth | mirror heat | reserve used | residual |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No ejection | 3.573e+37 | 3.573e+36 | 3.216e+37 | 4.174e+31 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 4.857e+29 | 0.000e+00 | 4.371e+29 | 4.857e+28 | 0.000e+00 | 3e-16 |
| Hand-designed heuristic | 1.254e+37 | 1.254e+36 | 1.102e+37 | 1.474e+31 | 5.299e+34 | 5.384e+33 | 3.099e+34 | 8.779e+34 | 8.779e+34 | 8.200e+28 | 1.038e+28 | 6.342e+28 | 8.200e+27 | 0.000e+00 | 6e-16 |
| Best PPO model | 2.703e+37 | 2.703e+36 | 2.407e+37 | 3.162e+31 | 5.232e+34 | 5.561e+33 | 3.056e+34 | 8.659e+34 | 8.659e+34 | 1.738e+29 | 2.033e+28 | 1.361e+29 | 1.738e+28 | 0.000e+00 | 4e-16 |

## Collector belt: do the collectors stay on their orbits? (high-fidelity runs)

| policy | max deviation WITH station keeping | control delta-v | WITHOUT: drift along the orbit | WITHOUT: distance-from-Sun swing | beam recoil / Sun's pull |
|---|---|---|---|---|---|
| No ejection | 12 km (rms 4) | 1 m/s/yr | 1,850,236 km (28.5 slots of 64,950 km) | 54,624 km | 0.0e+00 |
| Hand-designed heuristic | 730 km (rms 604) | 97 m/s/yr | 154,021,391 km (2,371.4 slots of 64,950 km) | 8,144,031 km | 1.4e-04 |
| Best PPO model | 437 km (rms 286) | 45 m/s/yr | 140,607,557 km (2,164.9 slots of 64,950 km) | 7,870,529 km | 8.3e-05 |

## Climate (high-fidelity runs; part of the RL task)

Target 288 K +- 5 K; livable band +- 15 K. Space mirrors ON (1.6e+15 m^2; at 2.7 AU they can send 1.10 x today's sunlight).

| policy | final surface T | climate ok | max deviation | years outside livable band | mirror light onto Earth | without mirrors it would settle at | ice line | growing area | waste heat reaching Earth |
|---|---|---|---|---|---|---|---|---|---|
| No ejection | 288.0 K | True | 2.1 K | 0 | 0.00e+00 J | 290 K | 71 deg | 75 % | 0.00e+00 J |
| Hand-designed heuristic | 288.4 K | True | 2.6 K | 0 | 1.04e+28 J | 157 K | 71 deg | 75 % | 1.24e+26 J |
| Best PPO model | 284.9 K | True | 4.9 K | 0 | 2.03e+28 J | 155 K | 65 deg | 70 % | 1.23e+26 J |

## Three individually selected enablers (assumptions, NOT demonstrated technology)

The selections are access to a finite asteroid, a thin-film photovoltaic collector field, and a space-mirror ring. They are three separate assumptions, not bundles. Supporting hardware, feedstock, operating assumptions and unresolved engineering gaps are listed separately below; calling them support does not make them feasible.

| id | single enabler | reason selected | provides | parameters | unresolved gap | modelled |
|---|---|---|---|---|---|---|
| E1 | Access to a finite 3e22 kg asteroid | Without reaction mass the modeled recoil mechanism cannot transfer momentum to Earth. | A stated asteroid mass reservoir is available as reaction mass; the simulated launch packets are finite and Earth recoils when they are ejected. This is one resource-access assumption, not a launcher-system bundle. | asteroid_mass_kg | No asteroid is actually captured or docked; access to and placement of a 3e22 kg body is far beyond demonstrated capability. | Finite mass remaining, packet ejection, recoil, packet fates and mass/energy/momentum accounting. Hardware, capture and launch shock are not simulated; Earth-damage question P6 remains open. |
| E2 | Thin-film photovoltaic collector field | The modeled mission needs a physical energy source; sunlight is traced through panel conversion and the downstream ledger. | Five million thin-film collectors at 0.5 AU intercept the configured 30 % of the Sun's output and convert sunlight into electricity. This is one power-generation enabler; microwave transmitters, rectennas and factories are supporting components, not bundled enablers. | collector_fraction, collector_orbit_au, collector_count, collector_areal_density, pv_efficiency, pv_temp_coeff, collector_absorptance, collector_emissivity, pv_degradation_per_year, collector_lifetime_years | A Dyson-swarm-scale photovoltaic field (~1e13 x all solar panels ever built); collector area and mass are far beyond industry. The power-transfer chain separately assumes about 1e24 W over 0.5-3 AU, pointing near 1e-12 rad, and rectenna beam intensity around 2e8 times sunlight. | Panel temperature and efficiency, degradation and replacement, build-up, manufacturing energy and mass, Goubau diffraction capture, Sun blocking, every loss in the energy ledger, clear lanes, the orbits of 12+12 followed collectors with / without station keeping (beam recoil, planets, light pressure). |
| E3 | Space-mirror ring | Without added reflected sunlight, the simplified climate model falls into a cold state at the target orbit. | A single mirror-ring technology reflects sunlight; the configured 1.6e15 m^2 film area can supply up to 1.10 x today's sunlight at 2.7 AU in the climate model. The agent sets the light level. | mirrors, mirror_area_m2, mirror_reflectivity, mirror_areal_density | Plain reflection is known physics, but the configured 1.6e15 m^2 and formation flight/pointing are far beyond industry; this is not a physical deployment design. | Capacity (1/r^2), light sent, light turned away, mirror heat (energy ledger), mass and the simplified climate effect. The mirrors' real orbits, light pressure, pointing errors and illumination pattern are not simulated. |

### Supporting components (not counted as enablers)

* E1 support — Launch ring + 8 launch arms (mass driver): Accelerates each packet to the commanded speed in the commanded direction; all 8 arms (each 2 R_E long, roots on a 1.25 R_E ring) throw one packet together. (model inputs: max_packet_mass_kg, max/min_ejection_speed_ms, ejections_per_year, launch_efficiency).
* E1 support — Arm power conditioning + energy reserve: Turns the arm electricity into launch energy; a reserve covers launches when the beams are short. (model inputs: energy_budget_j).
* E1 support — Directional arm radiators: Reject the launcher and rectenna waste heat to space, away from Earth. (model inputs: arm_heat_to_earth_frac).
* E2 support — Microwave phased-array transmitter (one per collector): Turns the electricity into a focused 5.8 GHz beam aimed at the arms; suppresses side lobes so spill misses Earth. (model inputs: microwave_efficiency, microwave_freq_ghz, transmitter_diameter_km, beam_spill_to_earth_frac).
* E2 support — Rectenna on each of the 8 arm tips: Receives the microwaves and turns them back into electricity for the launcher. (model inputs: rectenna_diameter_km, rectenna_efficiency).
* E2 support — Sail-tilt station keeping (on each collector): Uses part of the light-pressure push to hold the collector in its slot (no propellant). (model inputs: collector_sk_authority).
* E2 support — Clear sunlight lane: Collectors leave a moving gap so Earth and Mars see the whole Sun. (model inputs: earth_lane_clear).
* E2 support — Collector factories (Mercury material): Build the belt up and replace aged panels. (model inputs: collector_initial_built, collector_build_years, collector_recycle_frac, collector_embodied_energy_jkg).
* E3 support — Terminator orbit at 20 Earth radii + pointing (45 degree tilt): Keeps the mirrors in sunlight and aims their light at Earth or past it (the agent's action a4). (model inputs: mirror_orbit_re, mirrors).

## Major problems

| id | problem | status | what was done | what remains |
|---|---|---|---|---|
| P1 | Climate test integration | addressed | Habitability used to be only reported. Now a two-box climate model (with ice-albedo snowball risk) runs inside the RL environment: the agent aims the space mirrors (action a4), the reward has a climate term, the observation has 4 climate numbers and success requires |T_surface - target| <= tolerance. | Global-mean model only (no seasons, regions, water vapour, carbon cycle, biology). |
| P2 | Energy generation mapped exactly from the panels | addressed | Panel temperature (energy balance, ~450 K at 0.5 AU) -> operating efficiency; age degradation with replacement; linear build-up; manufacturing energy and fresh mass (vs. Mercury's mass); Earth's shading / clear lane; waste heat at collectors, transmitters, rectennas and launcher; every joule in a ledger that closes to round-off (check 18). | Panel temperature is a single global value; no micrometeoroids or eclipses. |
| P3 | Energy transfer and conservation | addressed | Ledger: sunlight on collectors + reserve = reflected + collector heat + manufacturing + transmitter heat + beam spill + rectenna heat + packet kinetic energy + launcher heat; mirrors: sunlight on mirrors = light onto Earth + light turned past Earth + mirror heat. Residual shown in the viewer and checked. | The packets' kinetic energy is then followed by the mechanical checks (4-6). |
| P4 | Enablers declared explicitly | addressed | Exactly three individual enablers are declared: finite-asteroid access (E1), thin-film photovoltaic collector field (E2), and space-mirror ring (E3). Supporting launcher, power-transfer, radiator, factory and pointing equipment is inventoried separately, not bundled into those selections. | The selected labels do not establish that supporting equipment is buildable; its own performance gaps remain open. |
| P5 | Arm waste heat (~1e24 W, 6e6 x Earth's sunlight) | open | The climate calculation assumes directional arm radiators with only a 1e-9 share reaching Earth. These are supporting equipment, not part of the selected E1 enabler. With an undirected radiator Earth would boil. | No physical radiator design, deployment or verified heat-rejection capability. |
| P6 | Launch damage to Earth | open | Each 1e18 kg packet leaves at ~2,500 km/s carrying ~3e30 J; shock, atmospheric loss and heating are not modelled. | Unresolved engineering hazard; non-damaging launch is not granted by an enabler or demonstrated by the model. |
| P7 | Planetary context and long-term stability | open | Mars, Mercury, Venus and Jupiter are modelled in both orbital engines, and their gravity is tested. The target orbit's long-term stability over geological times is not assessed; Saturn and planets beyond Jupiter are deliberately omitted. | Long-term stability and omitted outer-planet perturbations remain unverified. |
| P8 | Day length, seasons, tides | open | Spin, obliquity and tides are not modelled; the mirrors' illumination pattern on Earth is not modelled. | - |
| P9 | Climate enabler must be physically possible | addressed | The hypothetical beam-powered artificial sun was replaced by space mirrors (E3): plain reflection of sunlight, no energy source needed, flown at small scale (Znamya-2). The weather view shows what the mirrors keep alive (ice line, growing area, clouds and winds) and what happens without them (snowball Earth). | Building 1.6e15 m^2 of mirror and keeping it pointed is far beyond today's industry. |
| P10 | Segment, hinge and launcher structural safety factors | open | The participant guide requires every structural safety factor >= 1.5. Formula benchmarks are implemented, and p39 model 1 displays an assumed-capacity proxy, but no real material, cross-section, segment/hinge loads, buckling, self-weight, rotation or vibration analysis is connected to the main launcher. | No structural safety pass is claimed; material and geometry inputs are unspecified. The separate rulebook appendix thresholds were absent from the supplied PDFs. |

## Best model: final orbit vs target (high-fidelity run)

| criterion | value | required | result |
|---|---|---|---|
| Semi-major axis a | 2.6854 AU | 2.7 +/- 0.05 | PASS |
| Eccentricity e | 0.014497  | <= 0.05 | PASS |
| Inclination | 0.87198 deg | <= 5.0 | PASS |
| Arrival time | 7600 yr | <= 10000 | PASS |
| Moon still bound | True  | yes | PASS |
| Closest approach to Mars (planetary safety) | 0.046964 AU | >= 0.0246 AU | PASS |
| Stays in the target window for 200 yr without thrust (largest deviation of a from target) | 0.014571 AU | <= 0.05 AU, e <= 0.05, Moon bound | PASS |
| Surface temperature at the end (climate model, space mirrors aimed by the agent) | 284.86 K | 288 +/- 5 | PASS |
| Years outside the livable band (target +/- 15 K) during the mission | 0 yr | 0 (reported) | PASS |

## Best model: decisions (high-fidelity run)

Classes: helped 76

| years | throttle | packets | packet kg | speed km/s | prograde cos | dv m/s | da AU | e | effect |
|---|---|---|---|---|---|---|---|---|---|
| 0-100 | 0.47 | 800 | 3.74e+20 | 2254 | 1.00 | 138.7 | +0.0093 | 0.0166 | helped |
| 100-200 | 0.48 | 800 | 3.82e+20 | 2364 | 1.00 | 148.8 | +0.0102 | 0.0164 | helped |
| 200-300 | 0.50 | 800 | 3.98e+20 | 2425 | 0.99 | 158.9 | +0.0109 | 0.0163 | helped |
| 300-400 | 0.52 | 800 | 4.19e+20 | 2554 | 0.98 | 176.1 | +0.0122 | 0.0161 | helped |
| 400-500 | 0.47 | 800 | 3.77e+20 | 2295 | 1.00 | 142.3 | +0.0102 | 0.0158 | helped |
| 500-600 | 0.48 | 800 | 3.81e+20 | 2332 | 0.99 | 146.3 | +0.0106 | 0.0157 | helped |
| 600-700 | 0.47 | 800 | 3.76e+20 | 2325 | 1.00 | 143.8 | +0.0106 | 0.0156 | helped |
| 700-800 | 0.50 | 800 | 4.02e+20 | 2426 | 0.98 | 160.6 | +0.0119 | 0.0154 | helped |
| 800-900 | 0.51 | 800 | 4.1e+20 | 2458 | 0.97 | 166.1 | +0.0123 | 0.0151 | helped |
| 900-1000 | 0.52 | 800 | 4.18e+20 | 2528 | 0.98 | 173.9 | +0.0132 | 0.0150 | helped |
| 1000-1100 | 0.49 | 800 | 3.9e+20 | 2355 | 0.99 | 151.4 | +0.0119 | 0.0147 | helped |
| 1100-1200 | 0.46 | 800 | 3.7e+20 | 2291 | 0.99 | 139.8 | +0.0112 | 0.0146 | helped |
| 1200-1300 | 0.51 | 800 | 4.12e+20 | 2505 | 0.98 | 169.9 | +0.0136 | 0.0143 | helped |
| 1300-1400 | 0.54 | 800 | 4.33e+20 | 2604 | 0.94 | 185.8 | +0.0146 | 0.0139 | helped |
| 1400-1500 | 0.48 | 800 | 3.85e+20 | 2344 | 1.00 | 148.7 | +0.0126 | 0.0139 | helped |
| 1500-1600 | 0.46 | 800 | 3.69e+20 | 2269 | 0.99 | 137.9 | +0.0118 | 0.0136 | helped |
| 1600-1700 | 0.46 | 800 | 3.67e+20 | 2267 | 0.99 | 137.0 | +0.0119 | 0.0135 | helped |
| 1700-1800 | 0.50 | 800 | 4e+20 | 2425 | 0.98 | 159.9 | +0.0139 | 0.0133 | helped |
| 1800-1900 | 0.52 | 800 | 4.17e+20 | 2562 | 0.98 | 176.0 | +0.0155 | 0.0131 | helped |
| 1900-2000 | 0.51 | 800 | 4.08e+20 | 2476 | 0.99 | 166.4 | +0.0152 | 0.0129 | helped |
| 2000-2100 | 0.46 | 800 | 3.67e+20 | 2262 | 0.99 | 136.8 | +0.0126 | 0.0127 | helped |
| 2100-2200 | 0.48 | 800 | 3.82e+20 | 2312 | 1.00 | 145.5 | +0.0138 | 0.0125 | helped |
| 2200-2300 | 0.50 | 800 | 3.96e+20 | 2467 | 0.99 | 161.0 | +0.0157 | 0.0121 | helped |
| 2300-2400 | 0.52 | 800 | 4.13e+20 | 2520 | 0.98 | 171.7 | +0.0166 | 0.0119 | helped |
| 2400-2500 | 0.47 | 800 | 3.76e+20 | 2312 | 0.99 | 143.1 | +0.0145 | 0.0116 | helped |
| 2500-2600 | 0.48 | 776 | 3.7e+20 | 2354 | 1.00 | 143.5 | +0.0148 | 0.0107 | helped |
| 2600-2700 | 0.49 | 800 | 3.89e+20 | 2357 | 0.99 | 151.2 | +0.0156 | 0.0106 | helped |
| 2700-2800 | 0.50 | 800 | 4.17e+20 | 2440 | 0.99 | 167.8 | +0.0187 | 0.0098 | helped |
| 2800-2900 | 0.52 | 800 | 4.15e+20 | 2577 | 0.98 | 176.3 | +0.0188 | 0.0098 | helped |
| 2900-3000 | 0.53 | 728 | 3.83e+20 | 2570 | 0.97 | 162.2 | +0.0164 | 0.0095 | helped |
| 3000-3100 | 0.50 | 776 | 4.35e+20 | 2482 | 0.99 | 178.0 | +0.0098 | 0.0098 | helped |
| 3100-3200 | 0.47 | 800 | 3.84e+20 | 2296 | 0.99 | 145.2 | +0.0163 | 0.0098 | helped |
| 3200-3300 | 0.50 | 800 | 3.97e+20 | 2444 | 1.00 | 159.9 | +0.0191 | 0.0094 | helped |
| 3300-3400 | 0.51 | 800 | 4.11e+20 | 2520 | 0.99 | 171.0 | +0.0202 | 0.0095 | helped |
| 3400-3500 | 0.46 | 800 | 3.65e+20 | 2260 | 0.98 | 136.0 | +0.0161 | 0.0096 | helped |
| 3500-3600 | 0.48 | 800 | 3.84e+20 | 2368 | 1.00 | 149.9 | +0.0181 | 0.0097 | helped |
| 3600-3700 | 0.48 | 800 | 3.83e+20 | 2320 | 1.00 | 146.6 | +0.0179 | 0.0102 | helped |
| 3700-3800 | 0.47 | 800 | 3.74e+20 | 2254 | 0.99 | 139.0 | +0.0167 | 0.0102 | helped |
| 3800-3900 | 0.49 | 800 | 3.92e+20 | 2373 | 0.99 | 153.5 | +0.0201 | 0.0107 | helped |
| 3900-4000 | 0.49 | 800 | 3.94e+20 | 2383 | 0.99 | 155.0 | +0.0204 | 0.0109 | helped |
| 4000-4100 | 0.49 | 800 | 3.96e+20 | 2393 | 0.99 | 156.2 | +0.0209 | 0.0108 | helped |
| 4100-4200 | 0.50 | 800 | 4e+20 | 2416 | 0.98 | 159.3 | +0.0218 | 0.0109 | helped |
| 4200-4300 | 0.49 | 800 | 4.01e+20 | 2342 | 1.00 | 154.9 | +0.0220 | 0.0108 | helped |
| 4300-4400 | 0.45 | 800 | 3.62e+20 | 2214 | 0.98 | 132.3 | +0.0198 | 0.0107 | helped |
| 4400-4500 | 0.45 | 800 | 3.6e+20 | 2232 | 0.98 | 132.6 | +0.0182 | 0.0106 | helped |
| 4500-4600 | 0.49 | 800 | 3.89e+20 | 2402 | 1.00 | 154.4 | +0.0226 | 0.0100 | helped |
| 4600-4700 | 0.46 | 800 | 3.69e+20 | 2241 | 0.99 | 136.4 | +0.0199 | 0.0096 | helped |
| 4700-4800 | 0.55 | 800 | 4.36e+20 | 2617 | 0.95 | 188.6 | +0.0276 | 0.0092 | helped |
| 4800-4900 | 0.51 | 800 | 4.08e+20 | 2546 | 0.99 | 171.7 | +0.0267 | 0.0091 | helped |
| 4900-5000 | 0.45 | 800 | 3.63e+20 | 2256 | 0.98 | 135.1 | +0.0214 | 0.0091 | helped |
| 5000-5100 | 0.45 | 800 | 3.63e+20 | 2218 | 0.98 | 133.0 | +0.0215 | 0.0085 | helped |
| 5100-5200 | 0.46 | 800 | 3.64e+20 | 2239 | 0.98 | 134.7 | +0.0220 | 0.0084 | helped |
| 5200-5300 | 0.54 | 800 | 4.33e+20 | 2615 | 0.96 | 187.0 | +0.0304 | 0.0077 | helped |
| 5300-5400 | 0.48 | 800 | 3.87e+20 | 2356 | 1.00 | 150.5 | +0.0261 | 0.0074 | helped |
| 5400-5500 | 0.54 | 800 | 4.28e+20 | 2566 | 0.95 | 181.5 | +0.0305 | 0.0068 | helped |
| 5500-5600 | 0.52 | 800 | 4.13e+20 | 2531 | 0.99 | 172.7 | +0.0311 | 0.0065 | helped |
| 5600-5700 | 0.49 | 800 | 3.91e+20 | 2413 | 1.00 | 155.8 | +0.0291 | 0.0066 | helped |
| 5700-5800 | 0.51 | 800 | 4.08e+20 | 2476 | 0.99 | 166.9 | +0.0312 | 0.0060 | helped |
| 5800-5900 | 0.51 | 800 | 4.09e+20 | 2456 | 0.98 | 166.1 | +0.0317 | 0.0058 | helped |
| 5900-6000 | 0.50 | 800 | 3.96e+20 | 2460 | 1.00 | 161.0 | +0.0325 | 0.0043 | helped |
| 6000-6100 | 0.49 | 800 | 3.9e+20 | 2360 | 1.00 | 151.9 | +0.0310 | 0.0043 | helped |
| 6100-6200 | 0.48 | 800 | 3.87e+20 | 2333 | 1.00 | 149.1 | +0.0307 | 0.0044 | helped |
| 6200-6300 | 0.45 | 800 | 3.63e+20 | 2214 | 0.98 | 132.9 | +0.0275 | 0.0033 | helped |
| 6300-6400 | 0.53 | 800 | 4.23e+20 | 2570 | 0.98 | 179.7 | +0.0382 | 0.0030 | helped |
| 6400-6500 | 0.51 | 800 | 4.08e+20 | 2524 | 0.99 | 170.3 | +0.0378 | 0.0026 | helped |
| 6500-6600 | 0.51 | 800 | 4.07e+20 | 2545 | 1.00 | 171.1 | +0.0394 | 0.0027 | helped |
| 6600-6700 | 0.53 | 800 | 4.25e+20 | 2581 | 0.97 | 181.1 | +0.0412 | 0.0027 | helped |
| 6700-6800 | 0.45 | 800 | 3.56e+20 | 2226 | 0.97 | 131.2 | +0.0307 | 0.0027 | helped |
| 6800-6900 | 0.46 | 800 | 3.66e+20 | 2240 | 0.98 | 135.7 | +0.0340 | 0.0016 | helped |
| 6900-7000 | 0.49 | 800 | 3.92e+20 | 2430 | 1.00 | 157.5 | +0.0381 | 0.0020 | helped |
| 7000-7100 | 0.49 | 800 | 3.89e+20 | 2360 | 1.00 | 151.9 | +0.0392 | 0.0009 | helped |
| 7100-7200 | 0.46 | 800 | 3.69e+20 | 2275 | 0.99 | 138.7 | +0.0360 | 0.0093 | helped |
| 7200-7300 | 0.50 | 800 | 4.03e+20 | 2500 | 1.00 | 166.6 | +0.0446 | 0.0152 | helped |
| 7300-7400 | 0.47 | 800 | 3.73e+20 | 2331 | 0.99 | 143.9 | +0.0401 | 0.0140 | helped |
| 7400-7500 | 0.54 | 800 | 4.33e+20 | 2603 | 0.96 | 186.5 | +0.0503 | 0.0138 | helped |
| 7500-7600 | 0.48 | 800 | 3.83e+20 | 2369 | 1.00 | 150.1 | +0.0435 | 0.0145 | helped |

## Training episode outcomes (stochastic exploration)

- deadline: 559 (The mission-time budget ran out before a complete target-and-climate hold finished; the target may have been reached earlier but not maintained for the configured hold.)
- resources_exhausted: 441 (All asteroid mass (or, with the solar collectors off, all propulsion energy) was used before a stable target hold began.)

> This is the best policy found in this training run, judged on a few deterministic test episodes. It is not proven to be globally optimal; other strategies (e.g. the heuristic) can be better on some measures.
> Reward is only the scoring rule used to train the agent. Mission success is judged separately from physics: final a, e and inclination, a ballistic stability check, and the Moon staying bound.

## Why the best model behaves as it does

- RESULT: the best PPO model reached the target in the high-fidelity N-body check: a = 2.6854 AU, e = 0.0145 after 7,600 simulated years, and the orbit stayed within tolerance for 200 ballistic years with the Moon bound.
- Direction: the impulse-weighted recoil direction on Earth has along-track (prograde) cosine 0.98, |radial| 0.13, |out-of-plane| 0.08; 0.0% of the impulse was retrograde. Along-track thrust raises orbital energy fastest (Gauss: da/dt = 2 a^2 v f_T / mu, with f_T the along-track acceleration); radial/normal components mostly waste reaction mass.
- Launch speed: mass-weighted mean 2.415e+06 m/s vs 2.355e+06 m/s, the minimum-energy speed that uses the whole asteroid (heuristic uses 2.480e+06 m/s). Momentum per joule falls as 2/u, so a lower speed saves energy but costs more mass.
- Most effective decisions (largest da per 100-y interval, fast model): t=7100 y: da=+0.0484 AU (prograde cos 0.96, u=2.68e+06 m/s, throttle 0.54); t=6600 y: da=+0.0405 AU (prograde cos 0.98, u=2.58e+06 m/s, throttle 0.53); t=7000 y: da=+0.0396 AU (prograde cos 1.00, u=2.43e+06 m/s, throttle 0.49). Least effective: t=100 y: da=+0.0093 AU (prograde cos 1.00, u=2.25e+06 m/s, throttle 0.47). At similar throttle, gains per interval grow with a, because at constant thrust acceleration da/dt ~ a^1.5.
- Timing: ejected in 75 of 75 decision intervals (first 100 y, last 7500 y). It keeps thrusting until the orbit enters the target window, where the episode ends.
- Resources (high-fidelity run): PPO used 99.5% of the asteroid and 57.7% of the energy budget; heuristic 95.2% / 58.5%; no-ejection baseline stays at a = 1.0000 AU.
- Versus the hand-designed heuristic: PPO arrives slower (7,600 vs 3,600 y) and uses less energy.
- This is the best model found in the tested training run, not a proven global optimum.

## Conservation (high-fidelity runs)

- No ejection: energy residual -3.0e-12 (rel. to |E0|), momentum 5.5e-11, angular momentum 8.9e-14, mass 0.0e+00; fragment merges 0
- Hand-designed heuristic: energy residual 3.6e-08 (rel. to |E0|), momentum 1.9e-11, angular momentum 1.5e-13, mass 1.4e-16; fragment merges 0
- Best PPO model: energy residual 2.6e-08 (rel. to |E0|), momentum 3.6e-11, angular momentum 1.0e-13, mass 0.0e+00; fragment merges 0

## Limitations

See README.md - simplified prototype, not a validated engineering or climate model.
