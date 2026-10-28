# OCTO-EARTH - results report

Generated 2026-10-24 20:34:40  |  preset **hypothetical**

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
- PASS - 2 gravity of Sun / Earth / Moon / asteroid / fragments: Sun->Earth 6.133e-03, Moon->Earth 3.715e-05, Earth(+asteroid)->Moon 3.035e-03, Mars->Earth 5.594e-10 at 1.85 AU (Earth->Mars 5.233e-09, ratio = mass ratio) m/s^2; asteroid mass scales Earth's pull by 1.005023; fragment(1e20 kg @1e6 km)->Earth 6.674e-09 m/s^2
- PASS - 3 equal and opposite forces: |sum m a| / sum|m a| = 3.1e-17
- PASS - 4+6 momentum & angular momentum in ejection: high-fidelity ejection: |dP|/(M_E v_E) = 6.8e-17 (round-off), |dL|/|L| = 1.6e-16; fast model |dP|/(dm u) = 1.2e-05 (incl. 1 ms of solar gravity)
- PASS - 5 energy accounting of propulsion: measured system energy change vs 1/2 mu u^2 - G dm M/R: rel diff 2.6e-08; drawn = KE/eta; budget never exceeded (tiny budget -> packet reduced to 1.11e+17 kg)
- PASS - 7 finite asteroid mass & fragment mass accounting: total mass + escaped mass - initial = 1.4e-16 (rel); merges=18, escaped 1.60e+19 kg; reservoir cannot go negative (5e18 kg reservoir -> ejected 5.00e+18 kg)
- PASS - 8 reversed ejection direction: prograde da = +0.0225 AU, retrograde da = -0.0217 AU (asymmetry 0.03)
- PASS - 9 fragment fall-back / escape / Earth impact: sub-escape packet falls back (no net recoil, energy lost): True; fast packet leaves the system and is ledgered as escaped: True; fragment aimed at Earth merges with momentum conserved: True
- PASS - 11 reproducibility (fixed seed): identical results for seed 7 (a=1.640495 AU)
- PASS - 13 viewer continuity (interpolation of recorded states): ballistic join between rows 1.1e-11 AU without Mars's pull (no hidden jumps); Mars's pull moves Earth by up to 2.2e-05 AU in 5 y (smooth, far below the drawing accuracy); viewer Hermite curve vs exact arc max 3.3e-05 AU; recoil |v_post - v_pre| matches recorded value to 5.7e-12; packet path bends 6.4e-05 (relative) from a straight line after 1 day under solar gravity
- PASS - 14 Moon in the fast (training) model: 1 y without thrust: Earth-Moon distance fast 363,297-405,504 km vs N-body 361,807-399,330 km (max diff 10,422 km); Moon's orbital phase drifts 22 deg/yr (Sun's tide on the Moon not in the fast model); barycentre diff 99 km; Earth wobble from the Moon's pull 4,874 km; recoil changes the Earth-Moon relative velocity by Earth's recoil only (rel. error 6.4e-12); Moon bound: yes
- PASS - 15 Mars gravity (both models, two-way): 20 y without thrust: Mars position fast vs N-body 1,586 km, Earth-Moon centre 2,216 km; Mars placed 0.02 AU ahead of Earth, after 1 y, changes Earth's velocity by 28.8 m/s (gravity on vs off); Earth<->Mars pull equal and opposite (momentum residual 6.6e-10); Mars is kicked 9.47x harder than Earth (= mass ratio), so Mars's orbit changes too
- PASS - 16 planetary-safety limits and Mars shield: safe distance 3.67 million km (0.0246 AU, set by: tide on Earth); tide ratio at the tide limit = 1.000000000000 x limit; forecast vs simulated 10-y closest approach 0.3797 vs 0.3733 AU (1.7e-02); shielded heuristic mission (seed 5): closest Mars pass 0.0495 AU, 216 shield overrides, outcome success
- PASS - 17 solar collectors and microwave power beaming: power chain 3.828e+26 W x 0.3 x (1 - lanes 5.1e-05) x rated 0.25 x temperature 0.696 (panels 450 K, energy balance 8e-17) x age 0.950 x 0.8 x capture 0.999 x 0.85 = 1.290e+25 W at 1 AU (exact to 0e+00); Goubau tau=1 -> 0.6321 (0e+00); belt covers |latitude| <= 17.5 deg; with a reserve of only 1e28 J the fast / N-body engines launched 1.44e+32 / 1.44e+32 J powered by the beams (bookkeeping residual 1e-16, never more than offered); collectors off -> never more than the reserve: True; 5e+06 collectors of 64,950 km each; Earth's clear sunlight lane 1.8e-05 of the belt; beams supply 2.0x the launcher's peak demand
- PASS - 18 climate + space mirrors + energy ledger: equilibrium today 288.00 K, at 2.7 AU without extra light 152 K (frozen); mirrors 1.6e+15 m^2 (8e+12 kg) can send 1.10 x today's sunlight at 2.7 AU; heuristic mission with the space mirrors: success, final 288.4 K (max deviation 2.4 K, 0 y outside +-15 K); without it: deadline, 153 K; ledger: in 1.254e+37 J = reflected 1.25e+36 + collector heat 1.10e+37 + manufacturing 1.5e+31 + transmitter heat 5.30e+34 + spill 5.38e+33 + rectenna heat 3.10e+34 + packet KE 8.78e+34 + launcher heat 8.78e+34; mirrors: sunlight 8.20e+28 = onto Earth 1.04e+28 + past Earth 6.34e+28 + mirror heat 8.20e+27 (residual 6e-16); heat reaching Earth 1.24e+26 J
- PASS - 19 collector belt station keeping: 12 collectors x 300 y: station keeping ON -> max distance from the assigned slot 640 km (rms 589 km; spacing between collectors 64,950 km), control 96 m/s per year each; OFF -> the orbit's shape changes little (semi-major axis 34,828 km, e 1.7e-02, distance from the Sun swings by up to 1,298,911 km) but the collectors drift along the orbit up to 146,943,587 km = 2,262 slots (collisions); beam recoil 1.2e-04 of the Sun's pull, planets 2.5e-06, neighbour 3e-10, control limit 3.8e-03; belt's net pull on Earth 1e-09 (1 AU) / 1e-09 (target) of the Sun's

## Training

State finished, 1000 episodes, 89773 timesteps, 877 s wall time (fast model).
Best model: episode 50, selection = lexicographic: success rate, then lowest terminal orbit error, then lowest energy use (deterministic, seeds 1001-1002).
Hyperparameters: {"algorithm": "PPO (Stable-Baselines3)", "net_arch": [64, 64], "n_steps": 1000, "batch_size": 200, "n_epochs": 10, "learning_rate": 0.0003, "gamma": 0.995, "gae_lambda": 0.95, "log_std_init": -0.5, "seed": 1}
Deterministic eval at selection: {"success_rate": 1.0, "error": 0.03663329899447473, "energy_frac": 0.5927506661068422, "years": 6950.0, "reward": 198.2569024880395, "a_au": 2.666568189490172, "e": 0.008483764053170206, "score": [1.0, -0.0366, -0.5927506661068422], "episode": 50, "timesteps": 3782}

## Comparison (physical metrics; reward shown separately)

| policy | fast success (3 seeds) | hi-fi result | hi-fi a [AU] | e | years | asteroid used | energy used [J] | validated | reward (hi-fi) |
|---|---|---|---|---|---|---|---|---|---|
| No ejection | 0% | deadline | 1.0000 | 0.0159 | 10,000 | 0.0% | 0.000e+00 | False | -54.1 |
| Hand-designed heuristic | 100% | success | 2.7000 | 0.0081 | 3,600 | 95.2% | 1.756e+35 | True | 214.9 |
| Best PPO model | 100% | success | 2.6870 | 0.0085 | 7,100 | 96.5% | 1.797e+35 | True | 193.0 |

## Mars safety (high-fidelity runs)

Safe distance 0.0246 AU (Earth came closer to Mars than the planetary-safety distance (or collided). Mars's tides or its pull on the Moon would exceed the limits set to keep people safe (failure).)

| policy | closest Mars pass [AU] | at year | safe | Mars tide (x Moon's) | Mars pull on Moon orbit | shield overrides | Mars a: start -> end [AU] | Mars e |
|---|---|---|---|---|---|---|---|---|
| No ejection | 0.3721 | 9,245 | True | 2.88e-06 | 7.08e-08 | 0 | 1.5237 -> 1.5237 | 0.0934 -> 0.0944 |
| Hand-designed heuristic | 0.0494 | 2,177 | True | 1.23e-03 | 3.02e-05 | 176 | 1.5237 -> 1.5298 | 0.0934 -> 0.0943 |
| Best PPO model | 0.0413 | 4,293 | True | 2.11e-03 | 5.19e-05 | 560 | 1.5237 -> 1.5528 | 0.0934 -> 0.0974 |

Mars's final orbit is chaotic (sensitive to small differences); see README, 'Mars'.

## Solar collectors and microwave power (high-fidelity runs)

Belt at 0.5 AU intercepting 30% of the Sun's output (1.148e+26 W): 2.11e+22 m^2 of collectors (+/- 17.5 deg around Earth's orbital plane), 5e+06 collectors of ~64,950 km each, ~2.1e+21 kg of material (2.9% of the Moon) at 0.1 kg/m^2; light pressure = 0.8% of the Sun's gravity on them. Chain: solar cells 25% -> microwaves 80% (5.8 GHz) -> captured by the 8 arm rectennas (Goubau, 30 km transmitters, 1000 km rectennas) -> electricity 85%.

| policy | energy from collectors [J] | from reserve [J] | microwaves absorbed [J] | mean / peak beam power [W] | capture efficiency | heat at the arms (mean) | microwave push (not applied) |
|---|---|---|---|---|---|---|---|
| No ejection | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.00e+00 / 0.00e+00 | 0.999-0.999 | 0.00e+00 W (= 0.0e+00 x the sunlight Earth intercepts) | 0 m/s |
| Hand-designed heuristic | 1.756e+35 | 0.000e+00 | 2.066e+35 | 1.82e+24 / 1.83e+24 | 0.879-0.999 | 1.05e+24 W (= 6.0e+06 x the sunlight Earth intercepts) | 114 m/s |
| Best PPO model | 1.797e+35 | 0.000e+00 | 2.114e+35 | 9.44e+23 / 2.22e+24 | 0.877-0.999 | 5.43e+23 W (= 3.1e+06 x the sunlight Earth intercepts) | 117 m/s |

The microwave push is an estimate (not applied). The heat at the arms is radiated away from Earth by assumption (enabler E5); the share arm_heat_to_earth_frac that reaches Earth is part of the climate model.

Panels: rated 25% at 25 C, operating 0.165 (panel temperature 450 K -> x0.696; age x0.950). Build-up: 30% at year 0, complete after 400 y. Replacement 4.22e+19 kg/yr (95% recycled); fresh material over the mission 2.32e+22 kg = 7.0% of Mercury. Earth's sunlight lane kept clear. Belt's pull on Earth 1e-09 of the Sun's.

## Energy ledger (high-fidelity runs, whole mission)

| policy | sunlight on collectors | reflected | collector heat | manufacturing | transmitter heat | beam spill | rectenna heat | packet kinetic energy | launcher heat | sunlight on mirrors | mirror light onto Earth | mirror light past Earth | mirror heat | reserve used | residual |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No ejection | 3.573e+37 | 3.573e+36 | 3.216e+37 | 4.174e+31 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 0.000e+00 | 4.857e+29 | 0.000e+00 | 4.371e+29 | 4.857e+28 | 0.000e+00 | 2e-16 |
| Hand-designed heuristic | 1.254e+37 | 1.254e+36 | 1.102e+37 | 1.474e+31 | 5.302e+34 | 5.482e+33 | 3.099e+34 | 8.780e+34 | 8.780e+34 | 8.174e+28 | 1.041e+28 | 6.315e+28 | 8.174e+27 | 0.000e+00 | 4e-16 |
| Best PPO model | 2.522e+37 | 2.522e+36 | 2.243e+37 | 2.951e+31 | 5.429e+34 | 5.707e+33 | 3.172e+34 | 8.986e+34 | 8.986e+34 | 1.626e+29 | 1.890e+28 | 1.275e+29 | 1.626e+28 | 0.000e+00 | 6e-16 |

## Collector belt: do the collectors stay on their orbits? (high-fidelity runs)

| policy | max deviation WITH station keeping | control delta-v | WITHOUT: drift along the orbit | WITHOUT: distance-from-Sun swing | beam recoil / Sun's pull |
|---|---|---|---|---|---|
| No ejection | 12 km (rms 4) | 1 m/s/yr | 1,844,408 km (28.4 slots of 64,950 km) | 62,662 km | 0.0e+00 |
| Hand-designed heuristic | 723 km (rms 604) | 97 m/s/yr | 145,765,080 km (2,244.3 slots of 64,950 km) | 9,496,856 km | 1.4e-04 |
| Best PPO model | 466 km (rms 316) | 50 m/s/yr | 145,769,611 km (2,244.4 slots of 64,950 km) | 9,550,748 km | 8.9e-05 |

## Climate (high-fidelity runs; part of the RL task)

Target 288 K +- 5 K; livable band +- 15 K. Space mirrors ON (1.6e+15 m^2; at 2.7 AU they can send 1.10 x today's sunlight).

| policy | final surface T | climate ok | max deviation | years outside livable band | mirror light onto Earth | without mirrors it would settle at | ice line | growing area | waste heat reaching Earth |
|---|---|---|---|---|---|---|---|---|---|
| No ejection | 288.2 K | True | 2.1 K | 0 | 0.00e+00 J | 289 K | 71 deg | 75 % | 0.00e+00 J |
| Hand-designed heuristic | 288.3 K | True | 2.6 K | 0 | 1.04e+28 J | 157 K | 71 deg | 75 % | 1.24e+26 J |
| Best PPO model | 286.8 K | True | 4.7 K | 0 | 1.89e+28 J | 156 K | 68 deg | 73 % | 1.27e+26 J |

## Enablers (assumed technologies - NOT shown to be possible)

| id | enabler | provides | parameters | gap to reality | modelled |
|---|---|---|---|---|---|
| E1 | Planet-scale mass launcher (ring + 8 arms) | Throws 1e18 kg packets at up to 5,000 km/s, 8 per year, with 50 % efficiency; instant launches. | max_packet_mass_kg, max_ejection_speed_ms, ejections_per_year, launch_efficiency | No known structure or material; ~1e15 x the largest launchers. | Momentum, energy, packet fates. Not the hardware. |
| E2 | Asteroid reservoir docked to Earth | 3e22 kg (40 % of the Moon) of throwable mass attached to Earth. | asteroid_mass_kg | Moving such a body to Earth and attaching it is far beyond any technology. | Its mass and gravity. |
| E3 | Solar collector belt (5 million thin-film collectors) | Intercepts 30 % of the Sun's output at 0.5 AU (2.1e22 m^2, 2.1e21 kg); built by self-replicating factories from Mercury material. | collector_fraction, collector_orbit_au, collector_areal_density, collector_initial_built, collector_build_years, collector_lifetime_years, collector_recycle_frac, collector_embodied_energy_jkg | A Dyson-swarm-scale project; ~1e13 x all solar panels ever built. | Power chain, temperature, degradation, build-up, mass and energy flows, orbit keeping (viewer). |
| E4 | Planetary microwave power beaming | ~1e25 W beamed over 0.5-3 AU with 30 km phased arrays to 1,000 km rectennas; pointing to ~1e-12 rad. | microwave_freq_ghz, transmitter_diameter_km, rectenna_diameter_km, microwave_efficiency, rectenna_efficiency | Record power beaming is ~kW over km; beam intensity at the dishes 3e11 W/m^2 (2e8 x sunlight). | Diffraction (Goubau), blocking by the Sun, losses. |
| E5 | Arm radiators that do not heat Earth | The arms reject ~1e24 W of waste heat (rectenna + launcher losses) with only arm_heat_to_earth_frac reaching Earth. | arm_heat_to_earth_frac | Needs ~2e18 m^2 of radiator at 1,000 K per arm; a geometric (undirected) leak would be ~0.08 and boil the oceans. | The leaked heat enters the climate model. |
| E6 | Beam spill control | Microwaves missing the dishes (up to ~12 % at 2.7 AU) are kept off Earth except beam_spill_to_earth_frac. | beam_spill_to_earth_frac | Requires near-perfect side-lobe suppression at planetary power. | The leaked spill enters the climate model. |
| E7 | Clear sunlight lanes in the belt | The collectors leave a moving gap so Earth and Mars see the whole Sun (else Earth is in darkness). | earth_lane_clear | Coordinated motion of millions of collectors. | Lane size (2e-5 of the belt) and its power cost; Earth's shading when off. |
| E8 | Collector station keeping by sail tilt | Each collector holds its orbit using up to collector_sk_authority of its light-pressure push (no propellant). | collector_sk_authority | Solar sails demonstrated at m^2-km^2 scale only. | Viewer belt simulation: deviations, delta-v, drift without it. |
| E9 | Space mirror ring around Earth (soletta) | 1.6e15 m^2 of aluminium-film mirrors (8e12 kg) in a terminator orbit 20 Earth radii out reflect extra sunlight onto Earth: up to 1.10 x today's sunlight at 2.7 AU. The agent sets how much (mirrors not needed are turned so their light passes Earth). | mirrors, mirror_area_m2, mirror_reflectivity, mirror_orbit_re, mirror_areal_density | Physically possible (only reflection, no new physics, no energy needed). Demonstrated small: Znamya-2 (1993) 20 m mirror lit a 5 km spot on Earth; solar sails IKAROS (2010, ~200 m^2). Needed: ~1e13 x that area; film made from asteroid aluminium; formation flying and pointing of a million 40 km mirrors. | Capacity (1/r^2), light sent, light turned away, mirror heat (energy ledger), mass; the climate effect. Not the mirrors' orbits, light pressure, pointing errors or the light pattern on Earth. |
| E10 | Earth and life survive the launches | No damage from launching 1e18 kg packets from the surface (shock, atmosphere loss, heating). | - | Each launch carries ~1e31 J (~1e7 x the Chicxulub impact). | NOT modelled (declared problem P6). |

## Major problems

| id | problem | status | what was done | what remains |
|---|---|---|---|---|
| P1 | Climate test integration | addressed | Habitability used to be only reported. Now a two-box climate model (with ice-albedo snowball risk) runs inside the RL environment: the agent aims the space mirrors (action a4), the reward has a climate term, the observation has 4 climate numbers and success requires |T_surface - target| <= tolerance. | Global-mean model only (no seasons, regions, water vapour, carbon cycle, biology). |
| P2 | Energy generation mapped exactly from the panels | addressed | Panel temperature (energy balance, ~450 K at 0.5 AU) -> operating efficiency; age degradation with replacement; linear build-up; manufacturing energy and fresh mass (vs. Mercury's mass); Earth's shading / clear lane; waste heat at collectors, transmitters, rectennas and launcher; every joule in a ledger that closes to round-off (check 18). | Panel temperature is a single global value; no micrometeoroids or eclipses. |
| P3 | Energy transfer and conservation | addressed | Ledger: sunlight on collectors + reserve = reflected + collector heat + manufacturing + transmitter heat + beam spill + rectenna heat + packet kinetic energy + launcher heat; mirrors: sunlight on mirrors = light onto Earth + light turned past Earth + mirror heat. Residual shown in the viewer and checked. | The packets' kinetic energy is then followed by the mechanical checks (4-6). |
| P4 | Enablers declared explicitly | addressed | 10 enablers E1-E10 listed with what they provide, the parameters, the gap to reality and what is modelled. | - |
| P5 | Arm waste heat (~1e24 W, 6e6 x Earth's sunlight) | open | Only harmless because of enabler E5 (1e-9 leaks to Earth). With an undirected radiator Earth would boil. | No physical radiator design. |
| P6 | Launch damage to Earth | open | Each 1e18 kg packet leaves at ~2,500 km/s carrying ~3e30 J; shock, atmospheric loss and heating are not modelled. | Enabler E10. |
| P7 | Other planets | open | Venus, Mercury (near the 0.5 AU belt) and Jupiter are not simulated; the final orbit's long-term stability with Jupiter is not assessed. | Add them to the N-body model. |
| P8 | Day length, seasons, tides | open | Spin, obliquity and tides are not modelled; the mirrors' illumination pattern on Earth is not modelled. | - |
| P9 | Climate enabler must be physically possible | addressed | The hypothetical beam-powered artificial sun was replaced by space mirrors (E9): plain reflection of sunlight, no energy source needed, flown at small scale (Znamya-2). The weather view shows what the mirrors keep alive (ice line, growing area, clouds and winds) and what happens without them (snowball Earth). | Building 1.6e15 m^2 of mirror and keeping it pointed is far beyond today's industry. |

## Best model: final orbit vs target (high-fidelity run)

| criterion | value | required | result |
|---|---|---|---|
| Semi-major axis a | 2.687 AU | 2.7 +/- 0.05 | PASS |
| Eccentricity e | 0.0085057  | <= 0.05 | PASS |
| Inclination | 0.27122 deg | <= 5.0 | PASS |
| Arrival time | 7100 yr | <= 10000 | PASS |
| Moon still bound | True  | yes | PASS |
| Closest approach to Mars (planetary safety) | 0.041273 AU | >= 0.0246 AU | PASS |
| Stays in the target window for 200 yr without thrust (largest deviation of a from target) | 0.01302 AU | <= 0.05 AU, e <= 0.05, Moon bound | PASS |
| Surface temperature at the end (climate model, space mirrors aimed by the agent) | 286.76 K | 288 +/- 5 | PASS |
| Years outside the livable band (target +/- 15 K) during the mission | 0 yr | 0 (reported) | PASS |

## Best model: decisions (high-fidelity run)

Classes: helped 71

| years | throttle | packets | packet kg | speed km/s | prograde cos | dv m/s | da AU | e | effect |
|---|---|---|---|---|---|---|---|---|---|
| 0-100 | 0.50 | 800 | 4.04e+20 | 2378 | 0.99 | 158.1 | +0.0106 | 0.0166 | helped |
| 100-200 | 0.50 | 800 | 3.99e+20 | 2473 | 0.98 | 162.5 | +0.0109 | 0.0164 | helped |
| 200-300 | 0.53 | 800 | 4.28e+20 | 2647 | 0.99 | 186.4 | +0.0129 | 0.0163 | helped |
| 300-400 | 0.54 | 800 | 4.28e+20 | 2601 | 1.00 | 183.3 | +0.0130 | 0.0161 | helped |
| 400-500 | 0.51 | 800 | 4.1e+20 | 2382 | 1.00 | 160.9 | +0.0117 | 0.0159 | helped |
| 500-600 | 0.50 | 800 | 4.01e+20 | 2413 | 0.99 | 159.3 | +0.0116 | 0.0158 | helped |
| 600-700 | 0.50 | 800 | 4.02e+20 | 2495 | 0.98 | 165.1 | +0.0121 | 0.0157 | helped |
| 700-800 | 0.52 | 800 | 4.13e+20 | 2520 | 0.98 | 171.2 | +0.0129 | 0.0156 | helped |
| 800-900 | 0.53 | 800 | 4.23e+20 | 2604 | 0.99 | 181.5 | +0.0140 | 0.0153 | helped |
| 900-1000 | 0.51 | 800 | 4.07e+20 | 2496 | 0.99 | 167.1 | +0.0130 | 0.0152 | helped |
| 1000-1100 | 0.50 | 800 | 4.03e+20 | 2326 | 1.00 | 154.5 | +0.0124 | 0.0151 | helped |
| 1100-1200 | 0.50 | 800 | 4.02e+20 | 2436 | 0.99 | 161.3 | +0.0130 | 0.0149 | helped |
| 1200-1300 | 0.50 | 800 | 4.02e+20 | 2515 | 0.98 | 166.7 | +0.0136 | 0.0148 | helped |
| 1300-1400 | 0.51 | 800 | 4.07e+20 | 2497 | 0.98 | 167.4 | +0.0139 | 0.0147 | helped |
| 1400-1500 | 0.51 | 800 | 4.06e+20 | 2547 | 0.98 | 170.3 | +0.0143 | 0.0146 | helped |
| 1500-1600 | 0.53 | 800 | 4.21e+20 | 2543 | 1.00 | 176.5 | +0.0154 | 0.0144 | helped |
| 1600-1700 | 0.50 | 800 | 4.03e+20 | 2408 | 0.99 | 160.0 | +0.0142 | 0.0143 | helped |
| 1700-1800 | 0.50 | 800 | 4.02e+20 | 2317 | 1.00 | 153.4 | +0.0139 | 0.0141 | helped |
| 1800-1900 | 0.52 | 800 | 4.16e+20 | 2428 | 1.00 | 166.5 | +0.0154 | 0.0140 | helped |
| 1900-2000 | 0.50 | 800 | 4.01e+20 | 2293 | 1.00 | 151.6 | +0.0142 | 0.0139 | helped |
| 2000-2100 | 0.50 | 800 | 3.98e+20 | 2290 | 1.00 | 150.2 | +0.0143 | 0.0138 | helped |
| 2100-2200 | 0.51 | 800 | 4.05e+20 | 2309 | 1.00 | 154.0 | +0.0153 | 0.0135 | helped |
| 2200-2300 | 0.52 | 800 | 4.14e+20 | 2476 | 0.99 | 169.2 | +0.0167 | 0.0133 | helped |
| 2300-2400 | 0.50 | 800 | 4.03e+20 | 2314 | 1.00 | 153.7 | +0.0156 | 0.0132 | helped |
| 2400-2500 | 0.49 | 800 | 3.93e+20 | 2328 | 0.99 | 150.9 | +0.0153 | 0.0132 | helped |
| 2500-2600 | 0.49 | 768 | 3.77e+20 | 2371 | 0.99 | 147.2 | +0.0151 | 0.0131 | helped |
| 2600-2700 | 0.50 | 800 | 3.97e+20 | 2299 | 1.00 | 150.4 | +0.0159 | 0.0131 | helped |
| 2700-2800 | 0.51 | 800 | 4.08e+20 | 2340 | 1.00 | 157.3 | +0.0168 | 0.0130 | helped |
| 2800-2900 | 0.53 | 792 | 4.29e+20 | 2730 | 0.98 | 193.3 | +0.0210 | 0.0131 | helped |
| 2900-3000 | 0.50 | 784 | 3.9e+20 | 2273 | 1.00 | 146.3 | +0.0166 | 0.0132 | helped |
| 3000-3100 | 0.51 | 800 | 4.12e+20 | 2637 | 0.97 | 179.0 | +0.0202 | 0.0130 | helped |
| 3100-3200 | 0.51 | 800 | 4.07e+20 | 2540 | 0.98 | 170.6 | +0.0200 | 0.0127 | helped |
| 3200-3300 | 0.51 | 800 | 4.05e+20 | 2454 | 0.99 | 164.1 | +0.0187 | 0.0126 | helped |
| 3300-3400 | 0.50 | 744 | 3.82e+20 | 2561 | 0.97 | 161.3 | +0.0168 | 0.0127 | helped |
| 3400-3500 | 0.51 | 800 | 4.35e+20 | 2390 | 1.00 | 171.5 | +0.0212 | 0.0132 | helped |
| 3500-3600 | 0.53 | 784 | 4.15e+20 | 2551 | 1.00 | 174.6 | +0.0219 | 0.0132 | helped |
| 3600-3700 | 0.52 | 800 | 4.16e+20 | 2703 | 0.97 | 185.5 | +0.0237 | 0.0131 | helped |
| 3700-3800 | 0.51 | 784 | 4.12e+20 | 2409 | 0.99 | 163.8 | +0.0219 | 0.0130 | helped |
| 3800-3900 | 0.49 | 744 | 3.68e+20 | 2507 | 0.98 | 152.1 | +0.0196 | 0.0130 | helped |
| 3900-4000 | 0.52 | 800 | 4.17e+20 | 2494 | 0.99 | 171.6 | +0.0246 | 0.0131 | helped |
| 4000-4100 | 0.49 | 800 | 3.93e+20 | 2306 | 0.99 | 149.6 | +0.0216 | 0.0136 | helped |
| 4100-4200 | 0.52 | 712 | 3.9e+20 | 2634 | 0.97 | 169.7 | +0.0172 | 0.0133 | helped |
| 4200-4300 | 0.51 | 800 | 4.46e+20 | 2494 | 0.99 | 183.6 | +0.0175 | 0.0128 | helped |
| 4300-4400 | 0.54 | 800 | 4.31e+20 | 2654 | 1.00 | 188.9 | +0.0282 | 0.0127 | helped |
| 4400-4500 | 0.53 | 768 | 4.08e+20 | 2698 | 0.98 | 181.8 | +0.0274 | 0.0122 | helped |
| 4500-4600 | 0.51 | 800 | 4.1e+20 | 2533 | 0.98 | 171.5 | +0.0259 | 0.0118 | helped |
| 4600-4700 | 0.51 | 800 | 4.08e+20 | 2505 | 0.99 | 168.8 | +0.0270 | 0.0116 | helped |
| 4700-4800 | 0.51 | 800 | 4.08e+20 | 2597 | 0.98 | 175.1 | +0.0280 | 0.0115 | helped |
| 4800-4900 | 0.49 | 800 | 3.94e+20 | 2501 | 0.98 | 162.9 | +0.0267 | 0.0114 | helped |
| 4900-5000 | 0.49 | 800 | 3.91e+20 | 2396 | 0.99 | 154.8 | +0.0262 | 0.0113 | helped |
| 5000-5100 | 0.53 | 800 | 4.25e+20 | 2628 | 0.99 | 184.3 | +0.0320 | 0.0112 | helped |
| 5100-5200 | 0.53 | 800 | 4.25e+20 | 2601 | 1.00 | 182.4 | +0.0326 | 0.0109 | helped |
| 5200-5300 | 0.48 | 800 | 3.87e+20 | 2370 | 0.99 | 151.3 | +0.0276 | 0.0108 | helped |
| 5300-5400 | 0.53 | 800 | 4.21e+20 | 2491 | 1.00 | 173.1 | +0.0326 | 0.0106 | helped |
| 5400-5500 | 0.51 | 800 | 4.1e+20 | 2629 | 0.98 | 178.0 | +0.0335 | 0.0104 | helped |
| 5500-5600 | 0.49 | 800 | 3.89e+20 | 2401 | 0.99 | 154.5 | +0.0301 | 0.0102 | helped |
| 5600-5700 | 0.49 | 800 | 3.93e+20 | 2250 | 1.00 | 146.1 | +0.0294 | 0.0101 | helped |
| 5700-5800 | 0.52 | 800 | 4.14e+20 | 2650 | 0.98 | 181.4 | +0.0368 | 0.0100 | helped |
| 5800-5900 | 0.51 | 800 | 4.11e+20 | 2440 | 1.00 | 165.5 | +0.0349 | 0.0099 | helped |
| 5900-6000 | 0.52 | 800 | 4.15e+20 | 2539 | 0.99 | 174.2 | +0.0375 | 0.0097 | helped |
| 6000-6100 | 0.53 | 800 | 4.21e+20 | 2684 | 0.98 | 186.7 | +0.0410 | 0.0096 | helped |
| 6100-6200 | 0.52 | 800 | 4.19e+20 | 2723 | 0.98 | 188.4 | +0.0423 | 0.0095 | helped |
| 6200-6300 | 0.51 | 800 | 4.09e+20 | 2351 | 1.00 | 158.8 | +0.0374 | 0.0092 | helped |
| 6300-6400 | 0.50 | 800 | 4.02e+20 | 2497 | 0.98 | 165.9 | +0.0394 | 0.0092 | helped |
| 6400-6500 | 0.49 | 800 | 3.93e+20 | 2423 | 0.99 | 157.2 | +0.0384 | 0.0090 | helped |
| 6500-6600 | 0.48 | 800 | 3.85e+20 | 2367 | 0.99 | 150.7 | +0.0378 | 0.0091 | helped |
| 6600-6700 | 0.53 | 800 | 4.22e+20 | 2528 | 1.00 | 176.3 | +0.0458 | 0.0089 | helped |
| 6700-6800 | 0.53 | 800 | 4.22e+20 | 2759 | 0.98 | 192.6 | +0.0508 | 0.0088 | helped |
| 6800-6900 | 0.52 | 800 | 4.19e+20 | 2570 | 0.99 | 178.1 | +0.0488 | 0.0086 | helped |
| 6900-7000 | 0.50 | 800 | 4.01e+20 | 2279 | 1.00 | 151.0 | +0.0428 | 0.0086 | helped |
| 7000-7100 | 0.54 | 800 | 4.31e+20 | 2691 | 1.00 | 191.6 | +0.0556 | 0.0085 | helped |

## Training episode outcomes (stochastic exploration)

- resources_exhausted: 571 (All asteroid mass (or, with the solar collectors off, all propulsion energy) was used before reaching the target.)
- deadline: 429 (Mission time ran out before the target was reached.)

> This is the best policy found in this training run, judged on a few deterministic test episodes. It is not proven to be globally optimal; other strategies (e.g. the heuristic) can be better on some measures.
> Reward is only the scoring rule used to train the agent. Mission success is judged separately from physics: final a, e and inclination, a ballistic stability check, and the Moon staying bound.

## Why the best model behaves as it does

- RESULT: the best PPO model reached the target in the high-fidelity N-body check: a = 2.6870 AU, e = 0.0085 after 7,100 simulated years, and the orbit stayed within tolerance for 200 ballistic years with the Moon bound.
- Direction: the impulse-weighted recoil direction on Earth has along-track (prograde) cosine 0.99, |radial| 0.09, |out-of-plane| 0.08; 0.0% of the impulse was retrograde. Along-track thrust raises orbital energy fastest (Gauss: da/dt = 2 a^2 v f_T / mu, with f_T the along-track acceleration); radial/normal components mostly waste reaction mass.
- Launch speed: mass-weighted mean 2.479e+06 m/s vs 2.355e+06 m/s, the minimum-energy speed that uses the whole asteroid (heuristic uses 2.480e+06 m/s). Momentum per joule falls as 2/u, so a lower speed saves energy but costs more mass.
- Most effective decisions (largest da per 100-y interval, fast model): t=6900 y: da=+0.0478 AU (prograde cos 1.00, u=2.51e+06 m/s, throttle 0.52); t=7100 y: da=+0.0457 AU (prograde cos 1.00, u=2.36e+06 m/s, throttle 0.51); t=6300 y: da=+0.0455 AU (prograde cos 0.99, u=2.73e+06 m/s, throttle 0.54). Least effective: t=4000 y: da=+0.0077 AU (prograde cos 0.98, u=2.49e+06 m/s, throttle 0.50). At similar throttle, gains per interval grow with a, because at constant thrust acceleration da/dt ~ a^1.5.
- Timing: ejected in 71 of 71 decision intervals (first 100 y, last 7100 y). It keeps thrusting until the orbit enters the target window, where the episode ends.
- Resources (high-fidelity run): PPO used 96.5% of the asteroid and 59.9% of the energy budget; heuristic 95.2% / 58.5%; no-ejection baseline stays at a = 1.0000 AU.
- Versus the hand-designed heuristic: PPO arrives slower (7,100 vs 3,600 y) and uses more energy.
- This is the best model found in the tested training run, not a proven global optimum.

## Conservation (high-fidelity runs)

- No ejection: energy residual -5.4e-12 (rel. to |E0|), momentum 2.0e-13, angular momentum 6.2e-15, mass 0.0e+00; fragment merges 0
- Hand-designed heuristic: energy residual 1.5e-06 (rel. to |E0|), momentum 2.0e-13, angular momentum 4.0e-13, mass 1.4e-16; fragment merges 0
- Best PPO model: energy residual 1.5e-06 (rel. to |E0|), momentum 1.9e-13, angular momentum 2.5e-13, mass 1.4e-16; fragment merges 0

## Limitations

See README.md - simplified prototype, not a validated engineering or climate model.
