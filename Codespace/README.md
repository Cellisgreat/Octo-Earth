# OCTO-EARTH prototype

A reinforcement-learning agent (PPO) ejects small packets of asteroid mass from Earth. The recoil
slowly moves Earth from 1 AU toward a stable, near-circular orbit at **2.7 AU** within a mission time
limit (default 10,000 simulated years). On the way Earth must cross the orbit of **Mars**, whose gravity
is modelled in both directions; since update p35 **Mercury, Venus and Jupiter** are simulated as well (two-way
gravity in both models; Saturn and beyond have no gravity or ephemerides in the physics model, though the refreshed viewer shows schematic display-only artwork). Planetary-safety limits and an automatic safety shield keep Mars far
enough away that its tides would not endanger people on Earth. The launcher is powered by **5 million solar
collectors** between the Sun and Earth that intercept 30 % of the Sun's output and beam the power to the
eight arms as **microwaves** (only the arm rectennas receive it); the **Power beams** view shows the beams
arriving and being absorbed. A **climate model** is part of the RL task: Earth would freeze far from the
Sun, so a ring of thin **space mirrors** around Earth reflects extra sunlight onto it and the agent decides how much.
The **Climate** view compares Earth with/without that mirror ring using a draggable split and a worked energy-balance
calculation; clicking any of the eight planets opens a separate black-body temperature estimate and NASA reference.
Every joule from
sunlight to its final form is tracked in an **energy ledger**; the collectors' orbits are simulated to show
that they stay in their slots; and every assumed technology is listed as an **enabler**. This is a **basic, runnable prototype**: it is meant to be
simple and testable, and can be extended later.

## Start (Windows)

Double-click **`RUN_OCTOEARTH.bat`**. It will:

1. find Python 3.10–3.13 (64-bit) and create `.venv` next to the file (no admin rights);
2. install the missing packages from `requirements.txt`. **The first install needs internet
   (~300 MB, mostly PyTorch CPU).** If an NVIDIA GPU is found, it switches once to the CUDA build of
   PyTorch (about 2.5 GB) so the PPO network trains on the GPU (see *Using a GPU*);
3. compile the physics kernels, run the quick physics checks, and print the analytic
   feasibility gate;
4. open the viewer in your browser (`http://127.0.0.1:8800/`, or the next free port), then train PPO
   for 1,000 episodes. When training finishes it automatically compares PPO with the baselines.

On a 2-core test machine, 1,000 episodes took **about 15 minutes** (877 s, CPU) of wall-clock time, plus about
6 minutes for the comparison (it now also simulates the collector belt and the climate). Close the window or press Ctrl+C to stop. If you stop during training,
the model is still saved.

Other systems: `pip install -r requirements.txt`, then `python octoearth_rl.py`.

| command | what it does |
|---|---|
| `python octoearth_rl.py` | checks → viewer → training → comparison |
| `python octoearth_rl.py --smoke` | short pipeline test (30 episodes, 4,000-year missions) |
| `python octoearth_rl.py --check` | 22 physics checks plus 10 participant-guide benchmarks, then exit (exit code 1 if any fail) |
| `python octoearth_rl.py --headless` | no browser: train + compare + `report.md` |
| `python octoearth_rl.py --no-train` | viewer only (shows results saved in `outputs/`) |
| `--episodes N`, `--preset realistic`, `--set mission_years=5000 target_au=2.5`, `--port`, `--out DIR` | overrides (invalid or unknown values are rejected with a message, exit code 2) |
| `python -m pytest -q tests` | test suite (needs `pip install pytest`) |
| `python calc_report.py` | calculation report of the whole system (HTML + PDF) |

## Files

| file | content |
|---|---|
| `octoearth_rl.py` | **all** Python: config, feasibility gate, physics (fast and high-fidelity), Gymnasium env, reward, baselines, PPO training, evaluation, explanation, report, physics checks, HTTP API |
| `frontend/` | Three.js viewer (`index.html`, `app.js` with left-rail Formula inspector, `pov.js` Earth-POV close-up, `collector.js` solar-collector satellite close-up, `ovextras.js` overview details and Ledger, `weather.js` Earth mirror-ring split comparison, worked climate calculation and wind/ocean-flow artwork, `planetClimate.js` worked black-body estimates for eight planets, `envmodel.js` space-environment formulas, `planets.js` model-derived Mercury / Venus / Jupiter, `planetTextures.js` cached procedural body surfaces, `planetaryBackdrop.js` display-only Saturn / Uranus / Neptune and selected major moons, `launcher.js` arm/asteroid helpers, `octoArms.js` shared articulated mechanical-arm rig, `earthAssets.js` layered Earth / Sun / star visuals, `rockAssets.js` deterministic cratered rock meshes, `asteroidBelt.js` display-only individual asteroid-belt graphics, `cineKit.js` camera / labels / HUD, `failed.html` + `failed.js` and four failed-model scenes (including `thrusterScene.js`), `physics_guide.html` the participant-guide crosswalk, `ENVIRONMENT_INVENTORY.md` project environment elements and simulated-vs-illustrative boundaries, Earth textures, `style.css`, local three.js vendor files). It does **no** orbit physics. |
| `frontend/TECHNICAL_BRIEF.pdf` | Printable eight-page technical brief and participant-guide crosswalk with project calculations, three single enablers, separate support systems, validation, risks and limits. |
| `outputs/` | written by a run: `best_model.zip`, `last_model.zip`, `best_model_info.json`, `training_log.csv`, `evals.json`, `comparison.json`, `report.md`, `physics_checks.json`, `guide_benchmarks.json`, `feasibility.json`, `config.json` |
| `example_results/` | historical pre-hold 1,000-episode archive (see `ARCHIVE_NOTE.md`, not current PPO evidence) plus the current 10-benchmark measurements and hold-specific physics check |
| `calc_report.py`, `CALCULATIONS_REPORT.pdf` / `.html` | calculation report: three individual enablers, separately inventoried support systems, mission energy/mass ledgers, safety gaps and validation evidence |
| `failed_models.py` | the failed-attempt component calculations as plain Python: `python failed_models.py` prints every verdict with its numbers (same formulas as `frontend/failedPhysics.js`; a test compares both) |
| `PITCH_PACKAGE/` | video-ready eight-slide deck, seven-minute pitch script, three-minute demo storyboard, eight-page technical brief, calculation report, three-failure analysis, validation status and Q&A notes; no rendered video and no current PPO success claim |
| `tests/test_octoearth.py` | pytest suite, 51 tests: active hold and reset, legacy-artifact rejection, main simulation and conservation; guide benchmark checks; structural screening formulas; p40 four-model page; Python/JavaScript parity and input-domain tests; project guide crosswalk and live results; orbital/climate/planetary tests including all eight temperature estimates; viewer, POV, asset, enabler separation, environment-inventory, control and p46 Formula-inspector checks |

## Parameters

Change them in the viewer (Params → Apply, then ▶ Mission → Start training), with
`--set key=value`, or in `Config` / `PRESETS` in `octoearth_rl.py`. Every parameter is documented in
one place (`PARAM_DOCS` in `octoearth_rl.py`), and the viewer shows that text in the ⓘ tooltips and
in the **? Guide** panel: name, value, unit, physical meaning, why it matters, the
effect of increasing or decreasing it, the allowed range, constraints and its category.

| category | parameters |
|---|---|
| Engineering assumption | asteroid mass, max packet mass, max/min ejection speed (exhaust velocity), energy budget, launch efficiency, ejection frequency |
| Project simulation setting | target orbit radius, mission duration, configured active target-hold duration, and separate passive high-fidelity coast horizon; tolerance values follow the configured prototype criteria |
| Simulation setting | decision interval (the RL time step), high-fidelity time step, max tracked fragments, packet hand-over distance, fragment escape distance, random start phase, seed |
| RL hyperparameter | training episodes, PPO steps per update, mini-batch, epochs, learning rate, discount factor, evaluation interval |
| Solar collectors | collectors on/off, fraction of the Sun's output intercepted, belt distance from the Sun, number of collectors, areal density, solar-cell / microwave / rectenna efficiency, microwave frequency, transmitter and rectenna diameter |
| Planetary safety (Mars) | Mars gravity on/off, max Mars tide on Earth (× the Moon's tide), max Mars pull on the Moon's orbit, hard minimum Earth–Mars distance, safety shield on/off, shield caution factor, shield forecast horizon |
| Reward weight (scoring only) | progress, eccentricity, inclination, energy, mass, time, success, final miss, failure, Mars proximity |
| Physical constant (fixed) | G, masses of Sun / Earth / Moon, AU, year, Earth radius, Moon distance, solar constant, speed of light |
| Viewer setting | simulation speed (1 day to 500 years of simulated time per real second) |

**Validation (Python is authoritative):** values outside the allowed range are rejected, never
clipped or reinterpreted. Cross-checks: min speed < max speed ≤ 3e7 m/s (10 % of c); packet mass ≤
asteroid mass; PPO batch ≤ PPO steps; target 1.1–5 AU; 2–1,000 decisions per episode. "Reset to
defaults" restores the defaults of the current preset. Units never change.

Presets:

- **`hypothetical`** (default): 3e22 kg asteroid (0.4 lunar masses), 1e18 kg packets, ≤ 5,000 km/s
  (1.7 % of c), 3e35 J energy budget. These values are deliberately chosen so the task is *just*
  feasible. They are not realistic engineering.
- **`realistic`**: a Ceres-mass asteroid, a 30 km/s launcher, and all sunlight intercepted by Earth
  for 10,000 years as energy, no solar collectors. The gate reports **INFEASIBLE**: the mass-limited Δv is only 3.7e-4 of
  what is needed. The program says so instead of pretending.

## Physics model (simplified and documented)

- **Feasibility gate (analytic, runs before training).** It computes:
  - the Δv for a slow spiral (11.66 km/s for 1→2.7 AU) and for a Hohmann transfer;
  - the change in orbital energy and angular momentum;
  - the rocket-equation reaction mass, with launch from Earth's surface including escape speed;
  - the minimum launch energy and average power;
  - the thrust-rate limit and the combined mass + time + energy check.
- **Fast model (used for training) – the Moon IS simulated.**
  - Hierarchical two-body model. The Earth–Moon barycentre (Earth + Moon + docked asteroid) follows
    an exact Kepler orbit around the Sun, **and the Moon follows an exact Kepler orbit around
    Earth(+asteroid) under their mutual gravity** (G·(M_Earth + m_asteroid + M_Moon)). Earth wobbles
    about 4,700 km around the barycentre because of the Moon's pull.
  - Each ejection is an impulsive, exactly momentum-conserving recoil **applied to Earth** (where the
    launcher is). The Moon is not pushed directly; it follows through gravity, so the Earth–Moon
    relative velocity changes by exactly Earth's recoil (check 14). The packet's final speed accounts
    for climbing out of Earth's, the asteroid's and the Moon's gravity.
  - The Moon's distance and boundedness are part of the agent's observation, and losing the Moon
    ends an episode as a failure.
  - **Approximation:** the Sun's tidal pull on the Moon is neglected here (it is in the N-body
    model). The Moon's distance agrees with the N-body Moon within ~10,000 km (2.7 %) over a year,
    but its orbital phase drifts by about 22° per year (check 14). Packets hitting the Moon and
    fragment trajectories after escape exist only in the high-fidelity model.
  - Launch energy is ½·m·u²/efficiency and is drawn from the finite budget. The finite asteroid
    mass decreases.
  - Packets slower than escape speed fall back and give no net recoil.
  - Packets are tracked only in a ledger. A Moon-boundedness check runs each decision.
  - Speed: about 1.4 ms per 100-year decision without Mars; the Mars kicks and the shield's yearly forecasts make a whole training step ~8 ms (1,000 episodes in about 11 minutes).
- **High-fidelity model (used for validation and the viewer).**
  - Full N-body Sun, Earth (+ asteroid), Moon, **Mars** and explicit fragments. Fragments feel the Sun,
    Earth, Moon and Mars and pull back on them. **Fragment–fragment gravity is neglected** (the
    fragments are tiny compared with Earth and the Moon and spread out quickly).
  - Integrator: 4th-order Yoshida, dt = 6 h.
  - Packets are handed over at 2e6 km from Earth with their exact escape-corrected velocity.
  - Up to 48 representative fragments exist at once. When the slots are full, the closest
    fragments merge inelastically (momentum conserved, energy loss recorded in the ledger).
  - Fragments that hit Earth, the Moon or the Sun merge with that body. Unbound fragments
    beyond 60 AU are recorded as *escaped* with their mass, momentum and energy. Nothing silently
    disappears.
  - Training no longer terminates at first target capture: the agent keeps choosing ejections and mirror light while the orbit and climate must remain in tolerance for the configured `validate_years` (default 200 simulated years). Any exit resets the continuous hold clock; the hold remains inside the 10,000-year mission budget.
  - After that controlled hold, high-fidelity evaluation still runs a separate 200-year no-thrust coast. This passive check is not PPO training feedback and the 200-year horizon is a project setting, not a rulebook threshold.
  - The task is versioned as `controlled-target-hold-v1`. Old or untagged checkpoints/results are ignored and archived before a new run; a same-shaped pre-hold PPO file is not accepted as a current policy.
- **Mars** is in both models, with two-way gravity; its orbit changes. Details, safety limits and the
  shield: see *Mars and planetary safety* below.
- **The agent never sets Earth's velocity.** Its action per 100-year interval is: throttle (packet
  mass), two thrust angles in Earth's radial/along-track/normal frame, and launch speed. The physics
  turns these into packets, and all energy comes from the finite budget.
- **Recorded states for the viewer.** Each ejection event produces one record at the ejection
  instant: time, position, velocity just before and just after the event, packet mass, launch
  speed, relative speed, packet heliocentric velocity, fate (leaves the Solar System / bound to the
  Sun / fell back / hit the Moon), remaining asteroid mass and energy, recoil Δv, energy drawn and
  launch direction. Both models also record the Moon 8 times per event, and Mars's position and velocity, the
  Earth–Mars distance and the shield state at every record.
- **Asteroid.** The asteroid is docked to Earth (the launcher throws its material away piece by
  piece). Its gravity is included in both models: its mass adds to Earth's pull on the Sun, the Moon
  and every launched packet, and that pull weakens as it is used up (check 2). Because it is attached,
  its pull on Earth itself is an internal force with no net effect. Its own orbit and structure are
  not modelled.
- **Habitability:** insolation relative to today (S/S₀ = 1/a² ≈ 0.14 at 2.7 AU) and a black-body
  equilibrium temperature. This is a rough indicator, not a climate model.

## Mars and planetary safety

Earth's path from 1 AU to 2.7 AU **must cross Mars's orbit** (1.38–1.67 AU). Mars is therefore a full
body in both physics models:

- **Gravity both ways.** Mars pulls Earth, the Moon and the fragments, and is pulled back by them, so
  **Mars's orbit changes too** (Earth is 9.5× heavier, so Mars is kicked 9.5× harder). Fast (training)
  model: the Earth–Moon centre and Mars each follow exact Kepler orbits around the Sun, joined by
  mutual-gravity kicks with an adaptive step during close passes; Mars's tide on the Earth–Moon orbit is
  included. High-fidelity model: Mars is a 4th N-body body. After 20 years the two models agree on
  Mars's position to ~1,600 km (check 15). Mars starts on its real J2000 orbit at a random position.
- **"People must not die" is made measurable** by three limits; the *safe distance* is the largest:
  1. **tide on Earth** – Mars's tidal stretching of Earth ≤ `mars_max_tide_ratio` × the Moon's tide
     (default 1 %): d = 384,400 km × (GM_mars / GM_moon / ratio)^(1/3) = **3.67 million km
     (0.0246 AU)**;
  2. **Moon's orbit** – Mars's tidal pull on the Earth–Moon orbit ≤ `mars_max_moon_perturbation` × Earth's
     pull on the Moon (default 0.1 %; the Sun's equivalent is ~1.1 %): 2.30 million km;
  3. **hard minimum** `mars_min_distance_km` (default 2 million km; collision would be at 9,760 km).
  Coming closer ends the mission as a failure (`mars_unsafe_approach`). These limits are user
  parameters standing in for the danger (tides, Moon, debris), not established safety standards.
- **The hazard is real.** Without protection, the heuristic came within the safe distance in **10 of 12**
  tested missions (closest 0.0026 AU, i.e. 390,000 km), and Earth's passes moved Mars's orbit by up to
  0.08 AU. Last-minute dodging is impossible (a full-thrust push shifts Earth only ~900 km in a month);
  avoidance needs years of phasing.
- **Safety shield** (`mars_shield`, the standard "shield" idea from safe reinforcement learning). Once per
  simulated year, while Earth's orbit overlaps Mars's, it forecasts the closest Earth–Mars distance for
  the next 10 years (Sun gravity exactly plus the mutual Earth–Mars pull, i.e. gravitational focusing
  in slow passes) for four options: the agent's command, coasting, full thrust, full thrust reversed
  (brake). If the agent's command stays outside the **caution distance** (2 × safe = 0.049 AU) it is
  kept; otherwise the cheapest safe option is used. The shield never creates energy or momentum – it
  only changes how much asteroid mass is thrown, within the same limits as the agent. Every override is
  counted and shown. Tested: **12 of 12** heuristic missions stayed Mars-safe (closest 0.039–0.051 AU),
  all reaching 2.7 AU.
- **The agent learns it too:** the observation (26 numbers) includes Mars's position relative to
  Earth, the Earth–Mars distance compared with the safe distance, and the closest distance forecast if
  Earth coasts; the reward has a separate Mars-proximity penalty
  (`w_mars_safety`), shown as its own component.
- **Honest limits.** Mars's final orbit is **chaotic**: tiny differences change the shield's choices and
  hence how much Mars is moved (same seed, both missions successful and Mars-safe: Mars's orbit grew by
  +0.015 AU in the N-body model but by +0.35 AU in the fast model, after many more repeated close
  passes). Why the fast run moved Mars so much was not analysed further – we do **not** claim a
  specific mechanism such as a resonance. The high-fidelity run is the validated one. Jupiter, Venus etc. are not
  modelled, so the long-term stability of the final orbit against Jupiter is not assessed.

## Solar collectors and microwave power beaming

Kept deliberately simple. Default values (all adjustable in Params → *Solar collectors*):

- **The belt.** 5 million collectors on circular orbits **0.5 AU from the Sun** (between the Sun and
  Earth), in a band ±17.5° around Earth's orbital plane. A band of that width around a sphere catches
  exactly **30 %** of the sunlight: 1.15e26 W. Total collecting area 2.1e22 m², so each collector is
  ~**65,000 km** across (5× Earth's diameter); at 0.1 kg/m² the belt weighs 2.1e21 kg (2.9 % of the
  Moon). Sunlight pushes on the sails with 0.77 % of the Sun's gravity (a slightly slower orbit; 12
  collectors are simulated in the viewer, see *Collector belt* below). The belt leaves a clear lane for Earth's
  own sunlight (Earth's disc covers only 1.8e-5 of the band; the lanes' power cost is now subtracted). With
  `earth_lane_clear = false` Earth sits in the belt's shadow and gets no direct sunlight.
- **The power chain** (computed from Earth's simulated distance at the start of every decision interval, 100 simulated years):
  sunlight 3.83e26 W × 30 % × built share → solar cells (**rated 25 % at 25 °C; operating 16.5 %**, see
  below) → microwave transmitters 80 % (5.8 GHz, λ = 5.2 cm) →
  **capture by the 8 arm rectennas** (Goubau beam formula η = 1 − exp(−τ²), τ = D_t·D_r/(λ·d), with
  30 km transmitters and 1,000 km rectennas, averaged over a 720 × 9 sample of the belt, collectors
  hidden behind the Sun excluded) → rectenna 85 % → electricity at the arms.
  With the belt complete and Earth at 1 AU: capture 99.9 %, **1.29e25 W**; at 2.7 AU (beams up to 3.2 AU
  long): capture 86 %, **1.11e25 W** (before p28, with the rated efficiency used directly: 1.95e25 / 1.69e25 W).
  The launcher's peak demand at full rate and speed is 6.3e24 W, so the complete belt can always pay for it
  (1.8× margin): **energy is no longer the limiting resource** – reaction mass,
  launch speed, packet rate, time and Mars safety are.
- **Energy bookkeeping (no free energy).** Each launch draws `½·dm·u²/η_launch` (unchanged).
  It is paid **first from beam energy**: the collectors can deliver P_el × interval length during a decision
  interval, and that energy is available to the interval's launches; only a shortfall comes from the starting
  reserve (the old "energy budget", 3e35 J by default). Because even the peak demand per launch event stays
  below P_el, this is equivalent to powering every launch directly from the beams.
  Beam energy that is not needed is simply not beamed (it is not stored). Ledger identity checked to
  1e-15: *energy drawn = reserve spent + beam electricity used*, and beam energy used ≤ beam energy offered.
  With collectors off the reserve is the only source (exactly the previous model).
- **What is not simulated (flagged in the viewer):** the beams' push on Earth (momentum P/c; over a whole mission ≈ 100 m/s versus the 11,700 m/s
  needed – reported, not applied); the arms' directional radiators (supporting hardware, not a selected enabler). Waste heat at the arms (rectenna +
  launcher losses) is ~1e24 W while launching, **~6 million times all the sunlight Earth receives**, and
  each dish takes ~3e11 W/m² (2e8× sunlight). No known material could survive this; radiating it away at
  1,000 K would need ~2e18 m² of radiators per arm. These numbers are reported as estimates, honestly.
- **Viewer:**
  - **Power beams view** (button **Beams** in the bottom bar, key **B**, or ◉ View): the camera
    rides on a side arm. The 8 beams come in from real belt directions (with a clear line of sight past
    Earth) and end in the **rectenna dishes at the arm tips** (true size, Ø 1,000 km = 0.157 R_E); beam
    width is true scale. Brightness follows the beam power **recorded by the physics for the current
    event**: bright while packets are launched (held for a moment after each launch so it does not
    flicker between recorded events), and a clearly visible **stand-by pilot beam** when nothing is being
    launched (also before ▶ and during training) – labelled "no power flowing". When zoomed out the beam is
    kept ≥ 3 px wide (a note says it is then drawn wider than true scale). The **collector satellite that
    sends each beam** is drawn (~15× enlarged) at the beam's far end. Moving wavefronts,
    glowing dishes and energy pulses running down the arms to the ring show the absorption. Microwaves
    are invisible – colour, wavefronts (real wavelength 5 cm) and pulses are illustrations. Leaving
    the view restores your own POV layers.
  - **Solar collector close-up** (button **Collector**, key **C**, or ◉ View): one collector of the
    belt drawn as a detailed satellite – two solar-panel wings (blue solar-cell texture) facing the Sun,
    a gold-foil bus with white radiators, station-keeping thrusters, nav lights and a comm dish, and a
    large **phased-array microwave transmitter** on a boom, turned toward Earth, firing a violet beam with
    wavefronts. Hundreds of neighbouring collectors recede along the belt; the Sun (true 1.07° angular
    size from 0.5 AU) and Earth are in their true directions. **From the simulation:** Earth's position
    (so the directions to the Sun and to Earth; the collector is 50° ahead of Earth in the belt) and the
    beam brightness (bright = launch, dim = stand-by). **Illustration:** the satellite shape – in the
    model each collector is a flat ~65,000 km thin-film sheet; neighbours are drawn far apart (real ones
    nearly touch). The power panel adds a *This collector* box: sunlight caught 2.3e19 W → 5.7e18 W
    electric → 4.6e18 W microwaves, mass ~4.2e14 kg, and its share while beaming. Orbit-drag to look
    around; *reset camera* and *labels* in View.
  - Collectors in the **Earth POV sky** are now small satellites (panels toward the Sun) instead of dots.
  - **Power chain panel** (beam and collector views, right side, foldable, can be hidden in View → Screen): Sun →
    belt → solar cells → microwaves → captured → electricity → absorbed now → launcher → packet motion,
    each bar log-scaled, plus W/m² on each dish (× sunlight), heat in the arms (× all sunlight on Earth)
    and the share coming from beams vs reserve.
  - POV layers *Microwave power beams* and *Solar collector belt (sky)*: true directions from Earth,
    distances scaled like the Sun's. Overview: gold belt dots at 0.5 AU and one violet beam line per arm.
  - HUD row *beam power in*, an event "first microwave power absorbed", and an energy-source table in
    ▤ Results.

## Climate, exact energy mapping, collector orbits, enablers (update p28; the artificial sun was replaced by space mirrors in p30, see below)

The current major-problem flags and how they are handled (also in the viewer’s **Ledger** panel and `report.md`):

| problem | status | what the model now does |
|---|---|---|
| P1 Climate test integration | addressed | two-box climate model inside the RL environment; agent action a4 aims the space mirrors; climate reward, observation and success gate use its outputs |
| P2 Energy generation mapped exactly from the panels | addressed | panel temperature → operating efficiency, age degradation, belt build-up, manufacturing energy/mass, Earth's shading / clear lane, waste heat bookkeeping |
| P3 Energy transfer and conservation | addressed | energy ledger per interval and mission; residual ~1e-16 (check 18) |
| P4 Declare enablers explicitly | addressed | exactly three enablers E1–E3 in `octoearth_rl.py`, console, viewer and reports |
| P5 Arm waste heat | open | heat is sent away by an assumed directional radiator; no physical radiator design |
| P6 Launch damage to Earth | open | launch shock, atmosphere loss and surface heating are not simulated |
| P7 Planetary context / long-term stability | open | Mars, Mercury, Venus and Jupiter are simulated; geological-time stability and planets beyond Jupiter remain unverified |
| P8 Day length, seasons and tides | open | spin, obliquity, tides and local illumination are not modelled |
| P9 Climate enabler | addressed | mirrors reflect sunlight (no artificial energy source); their scale and construction remain hypothetical |
| P10 Structural safety factors | open | cantilever equations are benchmarked, but no real launcher segment/hinge stress or SF ≥1.5 pass is computed |

### Climate model (part of the RL task)

- **Model:** global-mean two-box energy balance. Surface layer (atmosphere + ocean mixed layer) and deep
  ocean, with heat exchange between them; outgoing heat ∝ σT⁴ with a fixed greenhouse factor calibrated to
  **288 K today**; **ice-albedo feedback** (brighter, more reflective Earth when cold) so a frozen "snowball"
  state exists. All coefficients are parameters (Params → *Climate*). It is integrated along Earth's
  simulated distance at every recorded state.
- **Without help Earth freezes:** at 2.7 AU Earth gets 14 % of today's sunlight → about **152 K**. Check 18 runs
  the heuristic mission without the mirrors: the orbit target is reached but the mission is **not** a
  success (153 K).
- **Space mirrors (enabler E3, since p30 – replaces the artificial sun):** see the section *Space mirrors* below.
  The agent's 5th action a4 sets the **insolation set-point** relative to today's sunlight; the mirrors add the
  missing light (they cannot remove sunlight), up to their capacity at Earth's distance.
- **Waste heat reaching Earth** = small fractions (default 1e-9, E1 arm radiators / E2 beam spill control) of the beam spill and of the
  arms' heat, ≈ 1e15 W ≈ 0.6 % of today's sunlight – it is included in the climate. Without directional
  radiators Earth would boil.
- **RL integration:** observation 31 numbers (now including surface and deep-ocean temperature error,
  sunlight share and – since p30 – the mirrors' capacity at Earth's distance instead of the waste heat); action 5 numbers (old 4-number actions are still accepted, a4 = 0); reward
  term `climate` (weight `w_climate`, shown separately from the physics); success = orbit window **and**
  |T − 288 K| ≤ 5 K maintained for the configured controlled-hold window; the terminal error includes the climate error. Baselines: *none* keeps the set-point at
  its minimum; the *heuristic* raises the set-point in proportion to how cold the surface and deep ocean are.
- **Reported:** surface / deep-ocean temperature, sunlight + mirror light, the temperature without mirrors, ice line and growing zone, the set-point, years outside
  the livable band (target ± 15 K), maximum deviation.
- **Not modelled:** seasons, day/night, regions, water vapour / clouds / carbon cycle, biology, how the
  mirrors' light would be spread over Earth (the view's weather is an illustration).

### Exact energy mapping of the collectors

- **Rated vs operating efficiency – CHANGED MEANING of `pv_efficiency`:** it is now the rating at 25 °C (the
  parameter text says so). The operating efficiency follows from the panels' energy balance at 0.5 AU: panels
  run at **450 K**, temperature factor **0.70**; fleet-average age factor **0.95** → **16.5 %** operating.
- **Build-up:** about 30 % of the belt exists at year 0, complete after ~400 years. Manufacturing energy per kg
  is paid from the collectors' own electricity; panels are replaced at the end of their life, mostly recycled.
- **Shading of Earth:** the clear lanes for Earth and Mars cost 5e-5 of the belt (subtracted). Switching the
  lane off puts Earth in the belt's shadow.
- **Energy ledger** (per interval and cumulative, `energy_ledger` in the results): sunlight on collectors +
  reserve used = reflected + panel heat + manufacturing + transmitter heat + beam spill + rectenna heat +
  packet kinetic energy + launcher heat; and separately sunlight on the mirrors = mirror light onto Earth + light turned
  past Earth + mirror heat. Residual ~1e-16 (check 18). The
  packets' kinetic energy is then followed by the mechanical checks 4–6.
- **Belt's own gravity:** net pull on Earth ~1e-9 of the Sun's (the band surrounds the Sun symmetrically);
  neighbouring collectors pull each other with 3e-10 of the Sun's pull. Not fed back into Earth's motion.

### Collector belt: do the collectors stay on their orbits?

During playback (and the high-fidelity comparison runs) Python follows **12 collectors** (3 inclinations × 4
node directions) twice – with and without station keeping – along Earth's and Mars's recorded motion. Forces:
the Sun (gravity reduced by the light push), Earth+Moon and Mars, the **beam recoil** (P/c per collector, away
from Earth), and a sail-tilt controller (supporting station-keeping equipment, not a selected enabler; limited to a share of the light push, no propellant).
Method: Encke deviation equations around the exact reference orbit, RK4, 0.5-day steps.

| (heuristic, 300 y, check 19) | with station keeping | without |
|---|---|---|
| largest distance from the assigned slot | **640 km** (spacing between collectors 65,000 km) | **1.5e8 km** along the orbit (2,262 slots) |
| change of orbit size / distance from the Sun | – | Δa 34,828 km, radial swing up to 1.3 million km |
| control effort | 96 m/s per year per collector | 0 |

Each effect is tiny (recoil 1.2e-4 of the Sun's pull, planets 2.5e-6), but without corrections they add up:
the collectors keep roughly their orbit's shape but slide along it into their neighbours. In the overview the
**solid silver satellites** are the simulated collectors with station keeping (on their thin orbit circles – a few
hundred km of deviation are invisible at this scale) and the **faint grey ghosts** are the same collectors without
station keeping, at their simulated positions, linked to their slots by dashed lines.

### Viewer additions

- **Overview details:** Earth is drawn with the same procedural texture as the POV (axial tilt, day/night
  lighting from the Sun, air glow; spin frozen at fast playback); the belt is ~900 instanced **collector
  satellites** (panels toward the Sun; their on-screen motion is frozen when it would be faster than the eye
  can follow – a note says so); the 12 simulated collectors and ghosts. (p30: the launcher ring + 8 arms and the
  space-mirror ring are drawn here too – see below.)
- **Earth POV:** layer *Space mirrors (climate)* (p30) – the mirror ring at its true 20 R_E orbit.
- **▦ Ledger** rail panel: climate now (surface/deep temperature, sunlight, space mirrors, temperature without mirrors, ice line, set-point, waste
  heat, years outside the livable band) and a climate chart; the energy ledger (this interval, share, mission so
  far, residual); the collector-belt statistics; the enablers and the major problems.
- **pill** in the header (surface temperature and mirror light ), climate rows in the telemetry.

## Space mirrors instead of the artificial sun, weather & life view, arms in the overview, readable code (update p30)

### Why the artificial sun had to go, and what replaces it

At 2.7 AU Earth gets only **14 % of today's sunlight** and the climate model freezes it to about **152 K
(−121 °C)** – a snowball with ice to the equator. The old fix, a beam-powered "artificial sun", was not a
real technology. It is replaced by something that is physically possible and has been demonstrated at small
scale: **space mirrors (a "soletta")** that collect sunlight that would miss Earth and reflect it onto Earth.
Mirrors need **no energy source** – they only redirect sunlight.

| | value (defaults) |
|---|---|
| what | ~1 million thin reflective films (2 µm, 5 g/m², like solar sails), each ~40 km wide |
| total area | **1.6e15 m²** (`mirror_area_m2`) ≈ 12.5 × Earth's cross-section; mass **8e12 kg** (`mirror_areal_density`) – about one large asteroid's worth of aluminium |
| orbit | a ring around Earth at **20 Earth radii** (`mirror_orbit_re`), in the plane through Earth perpendicular to the sunlight (a "terminator orbit") – it **never enters Earth's shadow**; period ~5.2 days |
| geometry | each mirror is tilted 45° between the Sun and Earth → effective area × cos 45° = 0.71; reflectivity 0.90 (`mirror_reflectivity`); each mirror lights a spot ~440 km wide on Earth |
| capacity | falls as 1/r² like sunlight: **1.10 × today's sunlight at 2.7 AU** (enough with the 0.14 × from the Sun itself), ~8 × at 1 AU |
| control | the agent's action a4 (same meaning as before: insolation set-point = (1 + 0.5·a4) × today's sunlight). The mirrors add what sunlight lacks, up to their capacity; mirrors not needed are tilted so their light passes Earth |
| energy | separate, closed ledger: sunlight on the mirrors = light onto Earth + light turned past Earth + mirror heat (1 − reflectivity). No electricity, no beam energy |
| precedent | Znamya-2 (Russia, 1993: a 20 m reflector lit a 5 km spot on Earth); IKAROS (Japan, 2010: a 200 m² solar sail controlled by light pressure). Enabler **E3** in the code lists the gap to reality |

Physics notes (also in the code's `ENABLERS`/`ASSUMPTIONS`):
- Mirrors cannot simply "hover": at 20 R_E Earth's gravity (0.0245 m/s²) is ~100 × larger than light
  pressure on a 5 g/m² film (2.5e-4 m/s²), so they must **orbit**. The ring plane must turn once per year to
  stay perpendicular to the sunlight; light-pressure torque on tilted sails may help, but active attitude control is a separate supporting system (not part of E3), the
  Moon's pull perturbs it.
- At 1 AU the full ring could deliver ~8 × today's sunlight – **pointing errors could cook Earth**. That is
  why only the needed share is aimed at Earth and why the agent's set-point is part of the RL task.
- Manufacturing energy (~8e20 J) is tiny next to the launch energy but is not booked.

### Life indicators (computed) and the Climate Earth view

`life_indicators(T)` in `octoearth_rl.py` turns the global-mean temperature into simple life numbers using
today's zonal profile (equator +30 K, poles −15 K vs. the mean; its area average is exactly the mean):
**ice line** (latitude where it drops below −10 °C; today ≈ 70°), **ice-free surface**, and **growing zone**
(share of the surface at 5–40 °C; today ≈ 75 %), plus a one-word state (snowball / cold / temperate /
hothouse). Every decision record also stores the temperature Earth would settle at **without the mirrors**
(`T_no_mirror_K`, same sunlight) and its state.

Clicking Earth or the bottom-right **Climate** button (key **W**) opens a draggable split comparison: without the Earth space-mirror ring on the left, and the mirror-ring scenario on the right. The card reports sunlight at the current distance, mirror flux/capacity, temperature-dependent albedo, the model’s effective greenhouse emissivity, the equilibrium formula, and both temperatures. In playback it uses recorded two-box with-mirror temperature and no-mirror equilibrium; when no mission climate is available it compares a labelled 2.7 AU frozen equilibrium with a default-design mirror scenario aimed to restore today’s total sunlight. The mirror hardware is enlarged for legibility; the configured orbit remains 20 Earth radii. Playback continues; click **← Overview** to return.

The globe uses the bundled NASA-derived land/ocean/cloud imagery, a blue-white ice sheen, storm swirls, about 1,300 animated wind tracers and 900 ocean-flow tracers. Wind and ocean motion are illustrative, not local weather or a simulated ocean circulation. The frozen state is the model equilibrium, not a simulated freeze-timescale. The renderer updates flow buffers and ice-shell opacity only; it does not rebuild climate maps per frame or stop playback. Click each of the eight planets for a separate simple radiative estimate and NASA mean-temperature reference; this is not a planetary climate simulation, and gas giants have no solid surface.

### Arms visible in the overview

The overview Earth now carries the **launcher ring and 8 arms** (the mechanism is enlarged with the Earth marker). Two opposite arms stay braced on the docked asteroid while the other six animate packet throws along the **recorded launch direction**; this is renderer choreography only, not arm-level physics. The orbit guides use a restrained, desaturated finish; the mirror ring remains clearly marked around Earth. New layer toggles *ring + 8 arms* and *space mirrors*, and a button **zoom to Earth (see the arms)** in ◉ View.

### Readable code

`octoearth_rl.py` now starts with a **HOW TO READ THIS FILE** map (sections 1–12 told as the story of one
mission, and where to start reading), **every function has a plain-language docstring** (previously ~140 had
none), and the long documentation tables (parameter / output texts, glossary, enablers, problems) moved to
**APPENDIX A** at the end so they no longer interrupt the code. Still a single file; behaviour unchanged
(same tests).

## GPU training, smooth training view, plain UI, light mirror rays (update p31)

### Using a GPU
* (p34: `--device auto` now MEASURES CPU and GPU and uses the faster one, normally the CPU - see the p34 section.)
  Before p34, `octoearth_rl.py --device auto` trained the PPO network on an **NVIDIA GPU (CUDA)** when
  PyTorch could see one, otherwise on the CPU. `--device cpu` forces the CPU, `--device cuda` asks for the GPU
  (falls back to the CPU if there is none). The log and the Mission drawer show the device
  ("PPO network on GPU (NVIDIA ...)" / "network on CPU").
* `RUN_OCTOEARTH.bat` looks for an NVIDIA card (since p32: `nvidia-smi` on the PATH, in System32 or in
  `Program Files\NVIDIA Corporation\NVSMI`, or the Windows list of display adapters). If one is present but the
  installed PyTorch is the CPU build, it installs the CUDA build once (cu126, then cu130 if needed, about 2.5 GB)
  and falls back to the CPU build if that fails. `set OCTO_NO_GPU=1` skips this; `set OCTO_GPU_RETRY=1` tries
  again after a failed attempt (see *Update p32*).
* **Honest expectation:** only the small 64x64 policy/value network runs on the GPU. The physics (numba) is a
  sequential orbit integration and always runs on the CPU, and it takes most of the training time, so a GPU
  makes training only a little faster (it can only shorten the network-update part; not measured here, no GPU). The
  comparison and playback load `best_model.zip` on the CPU (one observation at a time is faster there).
  Tested here on a CPU-only machine; the CUDA path uses the standard Stable-Baselines3 `device="cuda"` switch.

### Live training view: the actual current episode
The old finished-episode replay is removed. When live display is enabled, the worker streams the **active PPO episode**:
* every reset reports the actual episode seed, randomized orbital-phase offset, initial heliocentric longitude and exact year-zero Earth-Moon barycentre state; a gold ring stays at that spawn position;
* each environment step adds compact, sampled Earth position/velocity points and the exact current Earth state. The display follows the latest state and grows the actual path; no canned seed or completed-episode replay is substituted;
* the fast model continues to simulate the Moon. The live pane draws its exact current position/velocity and current osculating orbit, but deliberately does not serialize a dense historic Moon track or interpolate across long decision intervals. Full mission playback keeps its detailed Moon stream;
* Play/Pause freezes or resumes only the browser display. Reset jumps to the newest streamed state. Training continues in its worker process and is never paused by display controls;
* the HUD reports current orbit/resource metrics and a reward score clearly labeled as **not a physical metric**. An episode result is not evidence of learned success until evaluated; no RL success is claimed here;
* a display error in one frame can no longer stop the animation loop (the next frame is always requested first).

The live subview remains the fast training model. Mercury, Venus and Jupiter are shown on Kepler-only display tracks seeded from the episode start (or a reference fallback); these markers do not affect PPO. Mars and dense historic Moon tracks remain omitted for performance. Select mission playback for the fully recorded planetary layers, detailed Moon history and high-fidelity N-body view. The project physics is unchanged by the browser renderer.

### Plain UI and colours
* All emojis were removed from the interface (also the lightning sign); buttons and panels use plain words.
* The solar collectors in the overview have no colour coding any more: the belt satellites are silver/grey,
  the 12 simulated collectors are solid silver with a thin grey orbit circle, and the same collectors
  *without* station keeping are faint see-through grey ghosts joined by a thin dashed grey line.

### Mirror light rays
In the overview and Earth POV, each simulated mirror plate shows two **thin, very light** lines: sunlight
arriving on the mirror and its reflection **down to Earth**. The Climate split is Earth-only; its right-hand half draws a schematic mirror ring while the left-hand half removes it. It does not ray-trace mirror optics. In the overview, unused mirrors turn their light past Earth; their rays are very faint.

## Responsive viewer, working controls, GPU diagnosis (update p32)

Reported: "the GPU is not being used, the speed slider does not work, neither do start/stop or the other time
buttons, and there is tremendous lag". Causes that were found and what was changed:

### 1. Training and the comparison run in their own process
Before, PPO training, the comparison, the mission playback and the web server all ran in **one** Python
process. Python lets only one thread run Python code at a time (the "GIL"), so while training was running the
server answered the browser late (lag) and a playback's physics was starved ("waiting for physics").
Now `octoearth_rl.py` starts training (and the comparison after it) as a separate **worker process**
(`multiprocessing`, "spawn"). It sends its log lines, status, episode summaries and incremental live-episode
states to the main process through a queue. Stop / Ctrl+C still work (a shared stop flag); if a worker
process cannot be started it falls back to a thread. Training results are identical (same seed, same code).

### 2. The collector-belt simulation no longer holds up the playback
Profiling showed that a mission playback produced only ~100 simulated years per second even with nothing else
running, while the mission physics alone does ~7,500 y/s: the station-keeping simulation of the 12+12
followed collectors (RK4 in half-day steps, ~73,000 steps per 100-year decision, ~1.4 s of computer time)
ran inside the playback loop and blocked the GIL. Now:
* the belt kernel (numba) releases the GIL (`nogil=True`), and the two independent sets (with / without
  station keeping) are integrated at the same time on two CPU cores;
* the belt runs in its **own thread behind the physics**. The playback streams Earth, Moon, packets and
  decisions at full speed; each belt result is attached to its decision record when it is ready (API field
  `belts`, query `bsince`). At high playback speed the belt therefore lags behind the display: until a result
  arrives the collectors are drawn at their assigned slots and the Ledger says "still being computed".
  The belt numbers themselves are unchanged (same step size, same results; the half-day step was kept because
  the drift without station keeping is sensitive to it).

### 3. Speed slider and time buttons
* The mission speed slider controls mission playback only. Live training follows the newest state; its speed is not
  user-controlled and display settings never slow PPO.
* In the live view Play resumes following, Pause freezes the display, Reset jumps to the newest streamed state, and
  Space toggles play/pause. PPO continues running in the worker process in all of these cases.
* Frame time step: the display time advanced by at most 0.1 s per frame, so on a slow graphics chip (< 10
  frames per second) the chosen speed could not be reached. The cap is now 0.25 s (chosen speed kept down to
  4 frames per second; Earth is still drawn only from recorded physics states).

### 4. Graphics: frame rate, automatic resolution, software-rendering warning
* The browser is asked for the fast graphics chip (`powerPreference: "high-performance"`; on laptops with two
  chips this selects the NVIDIA one where the browser allows it).
* The connection pill shows the measured **frames per second** (hover: the graphics chip the browser really
  uses and the JavaScript time per frame; measured 0.5-3 ms here). After 4 s below 20 fps the drawing
  resolution is lowered automatically (2x -> 1x -> 0.75x).
* If the browser draws **without** the graphics card (software renderer such as SwiftShader, llvmpipe or
  "Microsoft Basic Render Driver") a message explains how to switch hardware acceleration on: browser settings
  -> System -> "Use graphics acceleration when available", then restart the browser.

### 5. Is the GPU used? How to check
* At start the program prints `[GPU]` lines: the PyTorch version, whether it is a CUDA build, the GPU it uses,
  and - if an NVIDIA card is present but PyTorch is the CPU build - the exact command that fixes it. The
  Mission drawer shows the device, and during training the GPU memory in use (or "GPU NOT USED" with the fix).
* `RUN_OCTOEARTH.bat`: better NVIDIA detection; one automatic CUDA PyTorch install (cu126, then cu130); if
  that attempt failed once it now says so and how to retry (`set OCTO_GPU_RETRY=1`, or delete
  `.venv\gpu_install_tried.txt`); it prints the PyTorch / CUDA / GPU status it ends up with.
* **Windows Task Manager**: the default "3D" graph of the GPU does not show PyTorch work. Choose the **"Cuda"**
  (or "Compute") graph in the GPU page. The browser's drawing shows up under "3D".
* Honest expectation (unchanged): only the small 64x64 PPO network can use the GPU. The physics is a
  sequential orbit integration on the CPU and takes most of the time, so GPU load during training stays low
  and training is only a little faster. Not measured on a GPU here (the test machine has none).

### Historical p32/p34 measurements and current live-stream microbenchmark
The old worker/process and mission-playback timing figures below were measured before the current live-stream path; they
are **not** a current PPO-throughput benchmark, do not represent wall-clock training speed for this build, and do not
establish RL success. The current viewer now follows the active episode; the speed slider is for mission playback.
* Historical p34 training and playback results are retained in the archived notes; they are not repeated as claims for
  the current implementation.
* Local microbenchmark (CPU, `smoke_config`, 30 warmed fast-model decisions): with Moon-history recording disabled,
  physics averaged 21.20 ms/decision; enabled, 22.68 ms/decision, with 6,400 Moon samples per 100-year decision.
  Converting/serializing that dense Moon chunk took about 57.6 ms per decision, so the training live stream now sends
  the exact current Moon state while retaining the full Moon history in mission playback. The compact Earth/current-state
  live helper plus JSON serialization averaged 2.38 ms/decision with an 84 KiB maximum sample payload in this run.
  These are local microbenchmarks, not end-to-end training speed, and will vary by machine/configuration.
* The pre-p36 p32 suite snapshot had 33 tests and 19 checks. The historical p36 validation counts above are retained as
  dated records, not the p40 sandbox result. The current p40 verification is documented in the failed-model section below;
  no validation count is an evaluation of PPO success or an end-to-end live-training speed claim.

## Failed attempts: four independent model screens (update p40)

Four quantitative concept screens test different ways to move Earth from 1 AU to 2.7 AU within 10,000 years. **Model 1 intentionally combines** the earlier laser-push and Dyson-beam attempts: a Dyson swarm powers one laser aimed at one reflector/collector held by 8 arms. Models 2 (solar-wind hydrogen + ideal fusion), 3 (superconducting Lorentz arms) and 4 (Earth-derived propellant + thrusters) are separate from one another and from the main asteroid launcher. The main simulation, its orbit physics, training behavior and three individual enablers are unchanged.

**How to open:** while `RUN_OCTOEARTH.bat` runs, click **Failed attempts (4 models)** in the main viewer, or open `http://127.0.0.1:8800/failed.html`. The page is static (no backend needed) and works from any local web server in `frontend/`. Tabs **1-4**, **Prev / Next** or keys 1-4 and the arrow keys switch models one at a time; the bottom bar has **Start / Pause / Reset** (space bar, R). The left box now includes the model idea, explicit calculation/assumption bullets and failure summary; the right panel provides live controls and equations in its tooltips. Drag to orbit and wheel to zoom.

**Views:** model 1 has overview, Sun/orbits, Earth/Moon, swarm, laser, collector and Earth camera presets; model 2 has POVs for the scoop, tank, fusion drive, magnetosphere, Sun/orbits and Earth/Moon; model 3 has POVs along a boom, top view, the Sun's field, Sun/orbits and Earth/Moon; model 4 shows the conceptual Earth thruster array, plume, force direction and orbit context, with a logarithmic Earth-propellant control. The Sun, Earth's 1-AU orbit, the 2.7-AU target orbit and Moon are visible in each model; context distances are compressed and labelled schematic. `python failed_models.py` prints all four calculations without graphics.

**Common goal.** The ideal slow-spiral screen uses Δv = v(1 AU) − v(2.7 AU) = **11,658.31 m/s** and F_req = M_earth Δv / 10,000 y = **2.206×10^17 N**. These are comparison screens, not full mission integrations.

| # | model | assumptions and calculation | result / why it fails |
|---|---|---|---|
| 1 | **Laser + Dyson-powered arm-held collector** (radiation pressure) | A perfect mirror redirects one beam to Earth. Force is F = P/c; the arm load is the beam momentum change (P/c)(d−r), and absorbed reflected light adds (P/c)r. The 1.29×10^25 W report-scale beam supplies 4.30×10^16 N. | Only **19.5%** of F_req; global equilibrium estimate ~**29,235 K**. Meeting F_req needs **6.614×10^25 W** (17.3% of solar luminosity), giving ~**43,993 K**; the simple absorbed-energy estimate boils oceans in **55.3 s** and unbinds Earth in **43.6 days** (about 262 km of 1-D displacement). Arm capacity and the SF 1.5 threshold are stylized proxies; the visual cascade is not a structural prediction. |
| 2 | **Hydrogen harvesting** (magnetic ram-scoop + ideal fusion) | Ideal exhaust v_e = c√(2×0.0071) ≈ **0.12c**. Required externally collected fuel is M_E[exp(Δv/v_e)−1] = **1.949×10^21 kg**. At the 1-AU reference flux 3.34×10^−15 kg/m²/s, a 100 R_E scoop collects **1.346×10^15 kg** in 10,000 y; the slider's 10,000 R_E ceiling collects **1.346×10^19 kg**. | 100 R_E provides **6.91×10^−7** of the fuel and moves the ideal orbit only ~**81 km**. Even the slider maximum gives **0.691%** of the fuel and ~**1.00543 AU**. The Sun's entire wind in all directions for 10,000 y gives **24.3%** and ~**1.221 AU**. 100% capture/fusion is assumed; 1-AU flux is held constant during migration (optimistic, since wind density falls roughly as 1/r²). |
| 3 | **Superconducting magnetic arms** (Lorentz force F = I L × B) | Eight independent 2 R_E booms; assumed 1 m cable radius and 45 T self-field screen gives I_max = 2πaB_c/μ₀ = **2.25×10^8 A per arm**. Best-case Parker field is ~**4.95 nT** at 1 AU, falling with distance. | Inside Earth's magnetosphere the Sun's field does not reach the booms; Earth's own field creates internal forces, so real net push is **0 N**. Even pretending the external field reaches the booms, I_max yields **1.14×10^8 N** and ~**61 m** in 10,000 y. F_req at 1 AU needs **4.351×10^17 A per arm** (an ~303 R_E cable); even that reaches only **1.810 AU** as B weakens. Reaching 2.7 AU in time requires ~**8.603×10^17 A per arm**, ignoring quench and field access. |
| 4 | **Earth-derived propellant + thrusters** (rocket equation) | Fixed ideal exhaust speed **v_e = 10 km/s** (Isp ≈ 1,020 s). Default propellant is **1×10^23 kg** removed from Earth's initial mass (1.67% of Earth, **1.36 lunar masses**). Use Δv = v_e ln[M_E/(M_E−m_prop)] and map that to the same quasi-circular slow-spiral estimate. | The default yields **168.87 m/s** (1.45% of required Δv), ending at **1.01144 AU**, not 2.7 AU. At 10 km/s the ideal rocket equation requires **4.111×10^24 kg** (**68.83%** of Earth's initial mass; 41.1× the chosen amount). Even the 1×10^24 kg slider ceiling reaches only **1.13542 AU**. The ideal required exhaust kinetic-energy estimate is **2.055×10^32 J** (~**6.513×10^20 W** average); losses, engine/power-plant mass, heat rejection, Earth shrinkage/gravity changes and trajectory control are excluded. This is one explicit failed parameter set, not a claim that every imaginable exhaust speed or propulsion concept is impossible. |

**Model boundaries:** all four calculations are independent of the main simulation. Hydrogen assumes every proton crossing the scoop is collected, all fuel is fused, and all fusion energy becomes directed exhaust. The magnetic best case assumes ideal orientation and a plasma return circuit. The thruster screen treats Earth as a variable-mass ideal rocket but does not change the rendered Earth's size/gravity or integrate its orbit. The laser energy milestones use simple heat-capacity/latent-heat and binding-energy estimates and ignore re-radiation; temperatures are global-equilibrium estimates. Schematic hardware, compressed Sun/orbit/Moon context, proton dots, magnetic lines, flames and failure cascades are visual aids, not engineering certification. Python and JavaScript failed-model calculations are parity-tested in `tests/test_octoearth.py`.

**p40 verification (28 October 2026):** `python -m pytest -q tests -k 'not test_device_benchmark_and_live_view_switch'` passed **48 tests, with one deselected**. The full-suite attempt reached 48 passes and one environment failure because the device-benchmark test imports PyTorch, which is absent here. `python octoearth_rl.py --check` is blocked at dependency preflight by missing `stable_baselines3` and `torch`. Browser visual click-through is unavailable because Chromium cannot launch without `libnspr4.so`. These limits do not change the main simulation; no current RL-success, engineering-feasibility or structural-certification claim is made.

**Main viewer:** the p37 Hydrogen / Dyson entries remain removed from its View selector. The main asteroid launcher, its recorded orbit/physics, training behavior and exactly three selected enablers are not changed by these failed-model screens.

## Two cinematic views: Hydrogen collection and Dyson beam failure (update p37)

> **Superseded by p38:** these views are no longer in the main viewer. The Dyson beam is merged with the laser into model 1 of the *failed attempts* page; the arm-net hydrogen view was replaced by the ram-scoop model 2. The description below is kept for reference.

Two extra modes in the **View** selector (also the chips *Hydrogen* / *Dyson* in the bottom bar, keys **H** / **D**).
They are **conceptual animations**: they run on their own, inside the same viewer, the same renderer and the same
render loop (no second animation loop, no extra framework, no backend needed), and they do **not** change the
mission simulation, the RL or the physics engine. Each is built the first time it is opened (its textures are
loaded then). Everything else (overview, Earth POV, Power beams, Collector, Climate Earth, training, playback) is
unchanged.

**Shared arm rig (visual geometry later refreshed).** `frontend/octoArms.js` (`createArmRig`) is shared by the overview,
Earth POV and Dyson cinematic. Current meshes use four rigid box-beam links per arm, paired rails, exposed hinge drums
and caps, and a two-link, three-jaw gripper; the articulated look is display-only. The fixed-length arm path remains
2 R_E and the rig still exposes its physics-facing point arrays, poses, `breakArm()` and fragment/reset paths used by
the Dyson scene. No hardware strength, hinge dynamics, or collision model was added. Older geometry descriptions in
this historical update log refer to the previous tapered-segment/sphere-joint appearance.

**Realistic Earth.** `earthAssets.js` draws Earth with a shader: NASA Blue Marble day map, Black Marble city lights on
the night side only, a twilight band, sun glint on water, clouds (NASA cloud composite) lit with the same terminator
and casting faint shadows, and an atmosphere rim. Textures are bundled in `frontend/assets/earth/` (sources and
processing in `CREDITS.txt`; the relief normal map is derived from the image, not elevation data). If a file is
missing the procedural Earth of the POV is used and a console warning is printed. Both views also have a star
field; the Dyson view has a granulated, limb-darkened Sun with glow.

### Hydrogen collection
The ring axis is turned towards the Sun. Stages: **A** standby (arms at rest, sparse markers drifting) -> **B** arms
extend (4 s) -> **C** the net forms strand by strand (4 s) -> **D** capturing -> **E** batch complete (net sealed).
The net (radial strands from every claw to the collection pod on the ring axis, 3 web rings, rim, cross-links
k->k+2 and k->k+3) is rebuilt every frame from the actual claw positions. 64 hydrogen markers (each an illustrative
parcel, not a molecule count) drift with the solar-wind direction; capture is a state machine: free -> guided
(inside the growing capture region, steered to the nearest strand) -> contact flash on the strand -> slides along
the strand -> captured (pod counter + 1). HUD: Free H2, guided / on the net, Captured, Net status, Progress.
Buttons: Start collection, Pause / Resume, Reset; camera presets wide / net / side / pod / auto.
Scale note (simplified estimate, **not simulated**): solar wind ~5 H/cm^3 at ~400 km/s through a 2.45 R_E
(15,609 km) disc = 2.6 kg/s = 8.1e7 kg/yr if every atom were caught; solar-wind hydrogen is mostly protons, and
inside the magnetosphere the solar wind is deflected, so the real catch would be far lower.

### Dyson beam failure
400 instanced collector satellites (the collector model of the other views) orbit the Sun; 48 energy paths with
pulses run into ONE concentrator, which emits ONE beam (core + glow + pulses, aimed along its direction vector) at
ONE giant concave silver reflector (diameter 12,997 km, thick dish, rim frame, back spokes, 8 mounts) held by the
8 arms. Geometry (Earth radii, found by a numeric search and checked by a test): ring axis u 51 deg from the
anti-Sun direction, reflector centre 1.55 R_E along u, mounts at 0.98 R_E, roots rotated 22.5 deg so the beam
passes between two arms; every root-to-mount distance <= 1.956 R_E (arms are 2.0), incident beam passes 1.14 R_E
from Earth's centre.

| Quantity | Formula | Value |
|---|---|---|
| mirror front normal | n = normalize(r0 - d), r0 = reflector -> Earth | tilt 23.6 deg |
| reflected ray | r = d - 2 (d . n) n (from the ACTUAL normal, incl. wobble / failure) | = r0 when aligned |
| force on the reflector (through the arms) | (P/c)(d - r) | up to 2 P/c if the light goes back |
| force where Earth absorbs the reflected beam | (P/c) r | |
| total when aligned | (P/c) d, away from the Sun | 4.30e16 N at P = 1.29e25 W (E2 beam) |
| Earth's acceleration | F / M_earth | 7.2e-9 m/s^2 = 0.23 m/s per year |

Timeline: 0-5 s COLLECTING, 5-9 s CONCENTRATING, 9-12 s BEAM ACTIVE + aligning (5 % power), 12-20 s power ramp.
The guide's SF ≥ 1.5 floor is crossed at roughly 36.7 % beam power (animation time depends on the ramp); the assumed
allowable load is reached at 55 %. The deterministic visual break cascade starts later, at a normalized load of 155 %
(about 85.3 % beam power in the proportional-load idealization): 1 arm, then 2, then 2 more break; the reflector tilts
(the reflected beam is recomputed from its actual normal), tears loose and tumbles, shedding silver chips; the 3
remaining arms release; the concentrator safes the beam. The cascade is not a material prediction, and this stylized
load ratio is not an engineering SF certification. Earth is not damaged and keeps coasting. Earth's displacement is
integrated from a = F/M with animation time **compressed (1 s = 0.25 yr)**; it is drawn at true scale relative to
Earth's size. Arm loads are shares of |F_arms| weighted by reach, against an **assumed, stylized capacity**. Distances
between Sun, swarm, concentrator and Earth are not to scale. Buttons: Start, Pause / Resume, Reset, Replay failure;
camera presets and an automatic cinematic camera (dragging turns it off).

**Verified here** (headless Chromium, software rendering): both views through all stages, Pause exact, Reset /
Replay deterministic (identical state twice), no duplicate meshes after many view switches, no console errors and
no missing files; the existing views and a mission playback still run.

## Asteroid on the ring axis, 2 R_E arms (update p36)

**What changed.** The docked asteroid no longer sits on one side of the launch ring. It sits on the ring's **axis**
(on Earth's ecliptic-north side), so it is exactly the same distance from all 8 arm roots, and every arm is
**2 Earth radii (12,742 km) long**. Geometry (one source of truth: `launcher_geometry()` in `octoearth_rl.py`, the
same numbers in `frontend/launcher.js`, compared by a test):

| quantity | value |
|---|---|
| arm length | 2 R_E = 12,742 km |
| ring radius (8 arm roots, every 45°) | 1.25 R_E (1,593 km above the surface) |
| grab point (asteroid's Earth-facing side) on the axis | 1.25 R_E from Earth's centre |
| distance root → grab point | √(1.25² + 1.25²) = **1.768 R_E for all 8 arms** (spread 0); 1,480 km of reach to spare |
| asteroid radius (3e22 kg, 2,000 kg/m³ assumed) | 1,530 km; centre 1.49 R_E from Earth's centre, 1.945 R_E (< 2 R_E) from every root |
| stroke of the joint throw (all 8 arms keep hold) | 1,983 km → 1.55e6 m/s² for 2,480 km/s (1.6 s) |
| load on the docking clamps | 1.33e23 N (asteroid's weight at 1.49 R_E) |

* The docking clamps lower the asteroid as it shrinks, so the grab point (and the arms' reach) never changes.
* **Viewer:** in the Earth POV and the overview zoom the asteroid now sits above the ring's centre; every arm is
  drawn with the same 2 R_E length (it bends away from Earth when its claw is closer); the 8 claws close around
  one rock at the grab point and carry it along the recorded throw direction for the stroke all 8 arms can follow,
  then release it. Overview packet paths start at the grab point.
* **Physics unchanged, on purpose:** the escape energy is still computed from Earth's surface. The real release
  point (1.29 R_E) would need 4.6e-6 less energy, so the model is conservative. The asteroid's mass stays merged
  with Earth's; its position shifts the common centre of mass by 47 km and changes Earth's pull on the Moon by
  9.4e-6 – both neglected and shown by check 21. At p36 these geometry changes did not require retraining; that statement predates the current target-hold update, which does require a fresh PPO run (not yet performed). Archived pre-hold results are in `example_results/`.
* **Planets' gravity in the calculations:** the calculation report now lists the pull of Mercury, Venus and Jupiter
  on Earth (e.g. Jupiter 1.05e-6 m/s² at the tested closest approach, 0.0011 × the Sun's pull at 2.7 AU), next to
  their safe distances; both physics models use it (update p35).
* **Tests:** the quick startup suite includes the launcher-geometry and controlled-hold checks. With dependencies installed, `--check` is designed to run 22 physics checks plus ten guide benchmarks; this p40 sandbox is blocked at preflight. Current pytest status is in the Validation section.

## Mercury, Venus and Jupiter (update p35)

**What was added.** Mercury, Venus and Jupiter now move and pull in both physics models, alongside Mars. Saturn
and more distant planets remain outside this physics model; the visual refresh adds schematic outer-planet artwork
only, with no ephemerides, gravity or new body physics (Saturn's pull on Earth is at most about 1/10 of Jupiter's).

| | Mercury | Venus | Jupiter |
|---|---|---|---|
| GM [m³/s²] | 2.203e13 | 3.249e14 | 1.267e17 (incl. moons) |
| start orbit (J2000) | 0.387 AU, e 0.206 | 0.723 AU, e 0.007 | 5.203 AU, e 0.048 |
| safe distance (Mars rules, scale with GM^1/3) | 0.0197 AU | 0.0483 AU | 0.353 AU |

* **Fast (training) model:** each planet drifts on its exact Kepler orbit; at every gravity sub-step (at most
  12 simulated days apart, finer when a planet is close) the Earth-Moon centre, Mars and each planet get the
  velocity kick of each other's pull (direct + Sun-wobble term), so the gravity is **two-way**. Cost: about
  +20 % per episode.
* **High-fidelity N-body model:** the three planets are ordinary bodies (index 4–6) of the Yoshida integrator;
  they pull and are pulled by the Sun, Earth, Moon, Mars and every fragment; fragments that hit them are booked
  in the ledger (`planet_impact_mass`).
* **Safety:** the Mars rules (tide on Earth ≤ 1 % of the Moon's, pull on the Moon's orbit ≤ 0.1 %, 2 million km
  minimum) are applied to every planet. Closer than the safe distance ends the mission (`planet_unsafe_approach`).
  In the tested missions Earth never comes near: Venus ≥ 0.27 AU, Mercury ≥ 0.55 AU, Jupiter ≥ 2.3 AU.
* **Effect on the mission (fast model, heuristic, seed 2001):** final a 2.6987 AU, e 0.0043 with the planets vs
  2.7000 AU, e 0.0081 without – a visible but small change; mainly Jupiter. Earth's pull changes the planets'
  orbits by ≤ 1.3e-4 AU (Jupiter).
* **Switch:** parameter `other_planets` (default true). False = massless planets, for comparison.
* **Observation:** the agent's 31 observations are unchanged; it sees the planets' effect through Earth's orbit.
* **Viewer:** mission playback draws recorded Mercury, Venus and Jupiter states and their osculating paths; between
  records each follows its two-body Kepler arc (Mercury moves half an orbit between records, so straight-line
  interpolation would be wrong). In the live-training and no-record views, the same markers stay visible on clearly
  labelled Kepler-only display tracks; those graphics do not add forces to PPO or alter the recorded states. The
  whole-system view also draws schematic Saturn/Uranus/Neptune and curated major moons. Layer switches for planets
  and orbit lines remain in ▶ Mission › Overview layers; **"whole system (to Neptune)"** zooms out to the full layout.
  The HUD lists recorded-planet distances during playback; reference-only tracks are identified as display data.
* **Tests (historical snapshot):** 22 physics checks and 10 participant-guide benchmarks were previously recorded; the current p40 `--check` is blocked by missing Stable-Baselines3/PyTorch, and current pytest status is in the Validation section.

## Training speed and device choice; current live view (historical p34, corrected p36)

Reported: "very slow, only 3 episodes in one hour; on the CPU it used to be ~20 s; how is the GPU making it slower?"
and "let me choose whether I see in real time how it learns, and keep the best PPO model, the best hand-coded one
and the others".

**Current live-display behavior (p36; replaces the old p32/p34 replay).** The browser now follows the active
stochastic episode as it is being simulated: the worker sends its actual seed and randomized year-zero spawn, then
compact Earth samples and current physical telemetry. There is no finished-episode replay or fixed-seed substitute.
The live Moon state is exact at the latest step; a dense historic Moon track is retained for mission playback rather
than serialized per PPO decision. Play/Pause controls only the display, and the speed slider is mission-playback only.
The reward remains a score, not physics, and this view alone does not establish RL success.

**The GPU can be slower for this network.** PPO asks the 64x64 network for one action per simulation step (a
   batch of ONE observation). On a GPU each call has a fixed cost (copy to the card, start kernels, wait, copy
   back), much larger than the work, and on Windows the card is shared with the browser's 3D view.
   Stable-Baselines3 itself warns that PPO with an MLP policy is meant for the CPU. Measured on the test machine
   (CPU): the network part of one PPO iteration (1,000 decisions + update) takes **0.06 s**; the physics takes
   about 90 % of the training time. **Device "Auto" (default) now measures CPU and GPU** when training starts and
   uses the faster one; it logs both times (`[DEVICE] ... CPU x s, GPU y s`). "GPU" forces the GPU.
   Not measured on a GPU here (the test machine has none).

**Speed report.** Every 10 episodes (every episode when one takes more than 5 s) the log prints
`[SPEED] ... s per episode (physics ... s, network + PPO update + reporting ... s)`; the Mission panel shows the
same. Measured here: 0.9-1.5 s per episode on the CPU (about 1 episode per second, 1,000 episodes in ~15-25
min) with and without the browser open.

**What is on screen (Mission panel, section 2).** Buttons *Live training* / *Best PPO model* /
*Best hand-coded* / *No ejection*, and a checkbox *show the training live on screen*. Training keeps running in
the background whatever is shown. Choosing a mission turns the live view off (training continues); *Live
training* turns it back on. Off = no episodes are sent to the screen at all. `--no-live` starts with it off.
The *Training device* list (Auto / CPU / GPU) applies at the next *Start training*.

## Exactly three individual enablers and the calculation report

The project selects **exactly three individual enablers**—three separate assumptions, not bundled systems. The code asserts `len(ENABLERS) == 3` and records why each was selected, the configured scope, what the model actually represents, and what remains beyond engineering evidence.

| ID | Single selected enabler | Why it is mission-critical | What the model assumes / does not prove |
|---|---|---|---|
| **E1** | Access to a finite 3×10²² kg asteroid | Reaction mass is needed for Earth to recoil under the modeled ejections. | A finite reservoir is tracked; capture, docking and placement of such a body are not demonstrated or simulated. |
| **E2** | Thin-film photovoltaic collector field | Supplies the mission’s modeled electrical source from sunlight. | Five million collectors at 0.5 AU intercept the configured 30% of solar output. Conversion and ledger losses are simulated; industrial scale, deployment and power transfer are not validated. |
| **E3** | Space-mirror ring | Supplies reflected sunlight needed by the simplified climate model at the target orbit. | Reflection is modeled; the configured area, deployment, formation flight, pointing and illumination pattern are not a feasible engineering design. |

**Supporting systems (not additional enablers, and not thereby certified):**

- For E1’s asteroid feedstock: the separate launch ring and eight 2-Earth-radius arms; arm power conditioning / reserve; directional radiators; and the assumed safe mechanical interaction with Earth. These remain unverified. Launch shock and Earth damage are explicitly unresolved (P6).
- For E2’s photovoltaic field: microwave phased-array transmitters, arm-tip rectennas, collector sail-tilt station keeping, sunlight lanes, and factories / Mercury feedstock. These are support equipment and construction assumptions, not part of the selected PV enabler. Their extraordinary power, pointing, intensity and industrial-scale gaps remain open.
- For E3’s mirror field: the terminator orbit, formation-flight and pointing system. The model does not simulate real mirror orbits, pointing error or the local illumination pattern.

“Supporting system” is a classification boundary, not a claim that the hardware is ordinary, available, safe or buildable. The Mars safety shield and RL agent are control software, not enablers. No energy is created by the mirrors, and the agent never edits Earth’s velocity directly.

**Calculation report.** `python calc_report.py` writes `CALCULATIONS_REPORT.html` and, if Playwright/Chromium is
installed, `CALCULATIONS_REPORT.pdf` (both are included). The latest report contains 142 numbered calculations (44 PDF pages), each with the
formula, the values put in, the result and the function in `octoearth_rl.py` that does the same calculation:
mission requirement (speed change, energy, rocket equation, time limit, feasibility checks); E1 (reservoir, packet
energy and recoil at the strategy speed and at the maximum speed, launcher power, reserve, waste heat and radiator
area, Mars safety distances); E2 (belt geometry and mass, panel temperature and efficiency, power chain, wavelength,
Goubau beam capture, spot size, pointing, rectenna intensity, light pressure, station keeping, lanes, build-up and
material); E3 (mirror mass, capacity at 1 AU and at the target, light needed, light pressure, orbit, spot size,
climate equilibria and life indicators); the closed energy ledger and conservation residuals of the tested mission;
the available test evidence; a summary of the three selected enablers and separate supporting systems; **counterfactuals** for removing or limiting a selected enabler or support component (e.g. no mirrors leads to a cold state, a 30 km/s launcher delivers only a small fraction of the required speed change, no station keeping causes large drift); **technical data sheets** (function, inputs, configured performance, linked calculations, counterfactual and unresolved gap); the **measuring instruments** the control system would need
(orbit determination, Mars tracking, climate monitoring, collector ranging; ordinary technology, not enablers, and
not simulated: the model gives the agent perfect knowledge) and every parameter. The numbers come from the simulation's own
functions, so the report cannot disagree with the code. Values marked *indicative* (for example the radiator area
or the mirrors' light pressure) only help to judge a supporting system; the simulation does not use them.
`python calc_report.py --results outputs` uses your own run; `--set key=value` any configuration change.

## Validation

The numerical examples in the table below are retained from the 27 October 2026 baseline; the `EVIDENCE/` JSON files describe that earlier snapshot, not p40/p41. **p40/p41 verification (28 October 2026):** `python -m pytest -q tests -k 'not test_device_benchmark_and_live_view_switch'` passes **48 tests, with one deselected**. A full-suite attempt reached 48 passes and one environment failure because that benchmark imports missing PyTorch. All **24 project JavaScript files and 2 vendor modules** pass `node --check`; the updated Python calculation/tests and pitch generator pass `py_compile`; the four focused failed-model parity, domain and scene tests pass. The p41 orbit-color and Sun-art changes are display-only. `python octoearth_rl.py --check` stops at dependency preflight because `stable_baselines3` and `torch` are absent. Browser click-through could not run because Chromium cannot launch without `libnspr4.so`. These are software/numerical checks, not RL performance, mission success, hardware verification or structural certification. No current-version PPO retraining or target-hold evaluation has been performed.

| check | result |
|---|---|
| Kepler closure / N-body vs Kepler (1 y) | 1.4e-14 / 261 m |
| Gravity of Sun, Earth, Moon, asteroid, fragment | analytic values reproduced |
| Equal and opposite forces | Σ m·a = 7.5e-17 (relative) |
| Ejection momentum / angular momentum | 2e-16 / 1.8e-16 (round-off) |
| Ejection energy vs ½μu² − G·dm·M/R | 2.6e-8 relative; budget never exceeded |
| Mass accounting incl. escaped fragments | 1.4e-16; reservoir cannot go negative |
| Reversed thrust direction | Δa +0.0225 vs −0.0217 AU |
| Fall-back / escape / Earth impact events | all handled and recorded in the ledger |
| Integrator convergence (12/6/3 h) | error ratios 13.2 and 16.0 (4th order → 16) |
| 100-year drift | \|dE/E\| 9e-12, \|dL/L\| 1e-15 |
| Fast vs high-fidelity (heuristic, 1,500 y) | a agrees to 1.5e-8 (shield off); with Mars gravity + shield 6e-3 (the shield's yes/no decisions differ slightly between models) |
| Reproducibility | identical for a fixed seed |
| 13 Viewer continuity | consecutive records joined by a pure Kepler arc to 1.1e-11 AU (no hidden jumps); the viewer's Hermite curve is within 3.3e-5 AU (≈ 5,000 km) of the exact arc; recoil column = \|v_after − v_before\| |
| 15 Mars gravity (both models, two-way) | 20 y without thrust: Mars fast vs N-body 1,586 km, Earth–Moon centre 2,216 km; Mars placed 0.02 AU ahead of Earth changes Earth's velocity by 28.8 m/s in 1 y; Earth↔Mars momentum residual 6.6e-10; Mars kicked 9.47× harder (= mass ratio) |
| 16 Planetary-safety limits and shield | safe distance 3.67 million km (tide limit reproduces the 1 % ratio exactly); shield forecast vs simulation 0.3797 vs 0.3733 AU over 10 y; shielded heuristic: closest pass 0.0495 AU, outcome success |
| 17 Solar collectors and beaming | power chain = product of the configured factors (exact); Goubau τ = 1 → 1 − 1/e (exact); band covers \|latitude\| ≤ 17.5° (30 % of the sky); with a reserve of only 1e28 J both engines launched 1.44e32 J in 2 y, all of it beam-powered (bookkeeping residual 1e-15, never more than offered); collectors off → never more than the reserve |
| 17 (updated) | chain includes the lanes, temperature factor 0.696 and age factor 0.95 → 1.290e25 W at 1 AU |
| 18 Climate + space mirrors + ledger | 288.00 K today; 152 K at 2.7 AU without extra light; mirrors 1.6e15 m² (8e12 kg) can send 1.10× today's sunlight at 2.7 AU; heuristic with the mirrors: success at 288.4 K (max deviation 2.4 K, 0 years outside ±15 K); without them: deadline (frozen); ledger residual ~1e-16 |
| 19 Collector belt | with station keeping max 640 km from the slot; without, drift up to 1.5e8 km along the orbit; recoil 1.2e-4, planets 2.5e-6 of the Sun's pull; belt's pull on Earth 1e-9 of the Sun's |
| 20 Mercury, Venus, Jupiter (p35) | 100 y without thrust, fast vs N-body: Mercury 1.7e-4, Venus 1.3e-4, Jupiter 1.7e-5 AU, Earth–Moon centre 1.1e-4 AU; their orbit sizes change by 1.4e-6 in 1,000 y; Earth↔Jupiter pull ratio = mass ratio; 1,500-y heuristic with vs without them; safe distances 0.0197 / 0.0483 / 0.353 AU |
| 21 Launcher geometry (p36) | all 8 roots 1.7678 R_E from the grab point (spread 0) ≤ 2 R_E arms; asteroid centre 1.945 R_E from every root; stroke 1,983 km; surface-launch simplification +4.6e-6 energy (conservative); centre-of-mass offset 47 km; tidal error on the Moon 9.4e-6 |
| 14 Moon in the fast (training) model | 1 y without thrust: Earth–Moon distance 363,297–405,504 km vs N-body 361,807–399,330 km (max diff 10,422 km); phase drift 22°/yr (Sun's tide neglected); barycentre diff 99 km; Earth wobble 4,874 km; a launch changes the Earth–Moon relative velocity by exactly Earth's recoil (6e-12) |

## Participant-guide crosswalk and ten required benchmarks (2026-10)

The supplied PDFs are cross-referenced in **`frontend/physics_guide.html`**, linked from the main Guide drawer and the failed-attempts page. That page distinguishes the challenge requirements from what this prototype really models, includes the exact ten benchmark values/tolerances from the participant guide (p. 9), the estimate scales, judging weights, submission checklist, enabler rules and absent-rulebook-threshold caveat. The problem-statement document repeats the Octo-Earth concept on pp. 42–43.

`python octoearth_rl.py --check` runs the project physics checks, the timestep / energy / model-agreement checks, and all **ten** participant-guide benchmarks. It exits nonzero on any failure. Starting the application runs the ten guide benchmarks before opening the viewer, writes their measured results to `outputs/guide_benchmarks.json`, and shows them in the main Guide drawer and the new crosswalk page. Benchmark 8 uses a separate isolated two-body RK4 reference (continuous thrust is not an action in the mission model); benchmark 9 is a formula check, not a structural pass for the launcher.

Measured guide-benchmark results from the tested build (2026-10-26):

| # | measured result | tolerance |
|---:|---|---|
| 1 | 10 N in +z; vector error 0 | 1e-9 |
| 2 | closed-loop residual 2.33e-16 of I·L·B | 1e-9 |
| 3 | 2.000e-4 T | 1e-6 relative |
| 4 | 10-period return 6.47e-14 a; energy drift 0 | 1e-6 a / 1e-9 energy |
| 5 | 5-y no-push N-body energy drift 1.29e-11 (6-h Yoshida-4 step) | 1e-9 |
| 6 | 365.256343 days; error 0.0003 day | 0.1 day |
| 7 | 2.9461 + 2.6500 km/s; 258.92 days | 0.02 km/s / 2 days |
| 8 | +3,170.1 km in one simulated year; error 0.002% (1-day RK4 reference) | 1% |
| 9 | root moment 5,000 N·m; tip deflection 0.00625 m; numerical formula error ≤6.25e-8 | 1% |
| 10 | 254.03 K | 2 K |

The guide-benchmark table above is a dated historical result, not a p40 rerun: the p40 `python octoearth_rl.py --check` attempt is blocked at dependency preflight because `stable_baselines3` and `torch` are absent. Current p40 pytest and frontend verification are documented in the Validation section. The guide requires every structural safety factor to be ≥1.5. The failed-screen model-1 assumed-load proxy marks its stylized support unsafe below 1.5, before a later illustrative break cascade; that is not a real material or cross-section result. No structural analysis is coupled to the main asteroid launcher: segment/hinge loads, allowable stress, buckling, self-weight, rotation, Coriolis, vibration and fatigue are **unverified**. This build does not claim the challenge’s structural-safety condition is met. The separate rulebook appendix thresholds mentioned by the guide were not in the supplied PDFs and are not guessed.

The guide's ≈**1.70e33 J** is the Earth–Moon orbital-energy increase from 1 to 2.7 AU; the project report's ≈**1.66e35 J** is a different minimum-energy estimate for its asteroid launcher. Do not conflate them. Similarly, the guide's ≈155 K at 2.7 AU is a simple equilibrium estimate; the project's climate model gives ≈152 K on its no-mirror snowball branch because of its ice–albedo feedback. Neither is a full climate or habitability certification.

## The viewer (what you see, and what is approximate)

Python computes all physics. The browser only draws recorded states; it never moves Earth on its own.

**Screen layout (uncluttered).** The 3-D view fills the screen. Everything else is one click away:

- **Left icon rail:** ▶ Mission (train, compare, choose a mission), ◉ View (overview / Earth POV,
  camera, layer check-boxes, which screen panels to show), Params, ▤ Results (training curves,
  comparison, best model), ? Guide, ≡ Log. One drawer opens at a time; ✕ or Esc closes it.
- **Bottom bar:** ▶ / ❚❚ / ⟲, simulated time, the speed slider, the running mission, and chips for
  ◉ POV and the Legend.
- **Telemetry (top left)** is compact (orbit size, eccentricity, asteroid left, distance to Mars, shield
  state). **more ▾** shows everything; **–** hides it.
- **Notes on approximations (top right)** show one line; click to read all of them.
- **Event log (bottom right)** shows the last two events; click to expand.
- **Keys:** Space play/pause, R reset, V switch view, L legend, Esc close panel, ? quick start. A
  quick-start card appears on the first visit. All of these choices are remembered in the browser.
- **Mars in the overview:** red marker (enlarged) from its own recorded states, its orbit at the start
  (faint) and now (dashed) – the difference shows how much Earth has moved Mars. Within 0.3 AU, a line
  joins Earth and Mars (green / yellow / red by safety) and the **true-scale** safe (red) and caution
  (yellow) circles are drawn around Mars. HUD: distance, closest so far, safe / caution distance,
  Mars's tide on Earth now, shield action and override count, Mars's orbit and its change. Events:
  close passes, entering / leaving the caution zone, shield overrides. The header pill shows the closest
  approach so far.

- **Controls:** ▶ Play / ❚❚ Pause / ⟲ Reset (re-runs the same mission from year 0 with the same seed,
  so it is identical), a logarithmic speed slider from **1 day to 500 years of simulated time per
  real second**, and "camera follows Earth" (◉ View) for a close-up. The HUD always shows simulated time and
  wall-clock time separately. The physics runs ahead of the display by at most 3 decision intervals
  or 2.5 s of display time (dim grey dots = computed but not yet shown).
- **Earth moves continuously.** Between two records (1/8 year apart) Earth is drawn on a cubic
  Hermite curve in polar coordinates through the recorded positions. The curve uses the velocity
  *after* the event at its start and *before* the next event at its end, so every recoil appears as a
  real kink, not smoothed away. Accuracy is checked by physics check 13. If two records are more
  than 2.5 event spacings apart (a data gap), Earth is **held** at the last record and a notice is
  shown. It never interpolates across a gap.
- **Labels:** Sun, Earth, Moon (with its current distance in km), Mars (distance from Earth) and asteroid (with the % left) are
  labelled on screen, so each body can be found at any zoom level.
- **Ejections:** the asteroid is drawn as a brown rock sitting on Earth's marker, on the side the
  packets leave from (size ∝ remaining mass^1/3, labelled "asteroid (docked) · X % left"). It shrinks
  with every packet. Each
  packet is drawn along its own path, computed in Python with two-body solar gravity from its real
  release state, for up to 1 year or 60 AU. Orange = leaves the Solar System, yellow = stays bound to
  the Sun, red ✕ = fell back to Earth. At high speeds paths stay visible ≥ 0.6 s of real time, and
  only 1 of every k packets is drawn (an on-screen note says so). All packets remain in the physics
  ledger.
- **Recoil:** a green arrow on Earth shows the direction of v_after − v_before of the latest
  packet. A label gives the recoil per packet (≈ 0.4 m/s) and the total Δv so far.
- **Paths:** solid line = past path (dark → light = earlier → later); dashed = the coasting
  (osculating) orbit Earth would follow if thrust stopped now; green circle = target.
- **Moon:** simulated and drawn in **both** models, from its own recorded stream (distance ×100),
  with a thin line to Earth. A thin violet ellipse shows its current simulated orbit around Earth
  (osculating orbit from the recorded Earth–Moon state, same ×100 scale). The HUD shows the
  Earth–Moon distance and whether the Moon is still bound. Before a mission starts, the view shows
  the simulated year-0 state (Earth, Moon, full asteroid). The live training view shows the active episode’s actual
  Earth spawn and current Earth/Moon state; it does not replay a finished episode. Its Moon state is exact at the
  displayed current step; full historic Moon detail remains in mission playback.
- **Event log** (simulated time): at ≤ 1 simulated year per second, one line per packet ("Year 125.44:
  ejected 1.00e18 kg at 2,480 km/s → leaves the Solar System; Earth Δv 0.408 m/s; asteroid left …").
  Above that, one summary line per decision. Special events are always listed: first packet, packets
  falling back, Moon hits, coasting start/stop, resources used up, Moon lost, mission end, and the
  stability check.
- **▤ Results drawer → Best model:** file name, path, size and date of `best_model.zip`; the selection rule
  and the deterministic tests during training; comparison with the no-ejection and heuristic
  baselines; final orbit vs each target criterion (pass/fail); a decision-by-decision table of the
  actual actions (timing, packet mass and count, speed, direction, Δv, Δa, e). Each decision is
  classified as helped / mixed / hurt / coast, with a reason built from the recorded numbers. It
  also lists training-episode outcomes, the Mars-safety table (closest pass, tide, shield overrides,
  Mars's orbit change), failed tests, and resource and constraint counts (packets
  that fell back or hit the Moon). It states explicitly that the policy is not proven optimal and
  that reward is only a training score.
- **Approximations flagged in the viewer:** not to scale (markers enlarged, Moon distance ×100);
  packet paths are shifted 0.047 AU so they start at the asteroid marker; packet paths use Sun-only
  gravity after release; in the fast model the Sun's tide on the Moon is neglected; Mars is drawn enlarged, but its safe and
  caution circles are true scale.

## Earth POV view (close-up from Earth)

Press **V**, the **◉ POV** chip, or choose **◉ View → Earth POV close-up (true scale)**. The camera is centred on Earth, the
axes are the simulation's ecliptic axes and the unit is one Earth radius (R_E = 6,371 km).
Everything is drawn at true scale: Earth, the Moon (0.27 R_E at ~60 R_E), the asteroid (its size
for the remaining mass with an assumed density of 2,000 kg/m³), the magnetopause, the Hill sphere
and the Sun's angular size.

- **From the physics engine:** Earth's position and velocity (so the Sun direction, distance and
  orbital speed), the Moon's simulated position and orbit, the remaining asteroid mass, and every
  ejection (direction, speed, fate).
- **Illustration only:** the launcher ring around Earth and the eight articulated arms (segmented
  beams, hinge drums, rails and three-jaw claws). Two opposite arms stay visibly braced on the docked
  asteroid while the other six animate a single packet throw for each recorded ejection. The packet
  streak, mass, direction and fate still come from the physics record; the arm choreography is not a
  mechanical or load-sharing model. Arms on the far side arc around Earth (never through it). At high
  playback speed several recorded launches can share one animated throw. The packet rock is drawn
  enlarged (a real 1e18 kg packet is ~100 km across). No structure, arm dynamics or launcher energy
  flow is simulated (the physics assumes instant launches). The animation adds ≈0.7 s of wall-clock
  delay. The docked asteroid remains at the physics-recorded position.
- **Selectable layers** (checkboxes, with ⓘ tooltips plus **None** / **Defaults**; the choice is
  remembered in the browser): ring + arms, Moon, Moon orbit, magnetic field lines, magnetopause +
  bow shock, radiation belts, solar-wind plasma, gravity well, Hill sphere with L1/L2, **Mars**
  (red marker in its true direction, label with the true distance; true-scale safe / caution spheres
  around Mars when you zoom out), gravity pulls (Sun, Moon, **Mars**), motion + thrust arrows, thrown
  packets, labels. The defaults are arms, Moon, field, wind, Mars, motion, packets and labels. Turning on the gravity well or the Hill sphere zooms out to
  ≈2.6 Hill radii.
- **Look buttons:** default, toward Sun, side (best for the magnetosphere), along motion, at Moon,
  from north. "Keep the Sun direction fixed on screen" turns the camera with Earth's orbit.
- **Environment models** (display only, evaluated at Earth's simulated Sun distance; identical
  formulas in `frontend/envmodel.js` and `space_environment()` in Python, compared by a test):

| quantity | model | at 1 AU | at 2.7 AU |
|---|---|---|---|
| solar wind | steady 400 km/s, 5 protons/cm³ × (1 AU/r)² | 5.0 /cm³ | 0.69 /cm³ |
| dynamic pressure | m_p n v² | 1.34 nPa | 0.18 nPa |
| interplanetary field | Parker spiral, radial 3.5 nT × (1 AU/r)² | 5.1 nT | 1.5 nT |
| magnetopause nose | Shue et al. 1998, IMF Bz = 0 | 10.9 R_E | 14.7 R_E |
| bow shock nose | 1.29 × magnetopause (Mach 8 assumed) | 14.1 R_E | 19.0 R_E |
| Hill radius | r (m / 3 M☉)^(1/3) | 236 R_E (1.5 million km) | 637 R_E (4.1 million km) |
| sunlight | 1361 W/m² × (1 AU/r)² | 1361 W/m² | 187 W/m² |

  Field lines come from a centred dipole tilted 9.6° from the spin axis (31,200 nT at the
  equator), cut where they would cross the magnetopause. The night-side tail lines are schematic.
  The radiation belts are schematic tori (inner ~1.2–2.5 R_E, outer ~3–7 R_E). Solar-wind particles
  are animated at a slowed visual speed, their number ∝ density, and behind the bow shock they turn
  orange (slowed, heated) and flow around the magnetopause. The gravity well is the Hill-
  approximation effective potential (Earth + Moon + Sun's tide), drawn as a log-height sheet with
  Earth at the bottom. Its rim saddles are L1/L2 and the Moon's dimple is joined to the Moon by a
  line. Space weather, storms and changes of Earth's own field are not modelled. **Moving Earth
  outward thins the solar wind ~7× and enlarges the magnetosphere by ~35 %.**
- The HUD shows a compact *Environment at Earth (estimated)* block (every row has a tooltip with
  its formula) and a short mission summary. Full telemetry is in the overview. Earth's daily
  rotation is not animated above 2 days/s.

## Historical tested results (1,000 episodes, before the controlled-hold update)

See `example_results/report.md`. This preserved run predates the 2026-10-27 controlled target-hold task: its PPO success numbers do **not** show that the agent learned post-arrival maintenance. The current code versions checkpoints and ignores old best models/evaluations until a fresh training run is completed. The new hold mechanics are physics-checked, but a full PPO retraining has **not** been run after this change, so learning quality in the maintenance phase is still unverified. These archived numbers describe the prior task only; they are not results for the current environment. As before, "best model" means **the best model found in that tested run**; it is not a proven global optimum.

Training: 1,000 episodes, 93,690 decisions, **about 1,700 s wall-clock** on 2 CPU cores (sandbox), fast model
(Moon, Mars, Mercury, Venus and Jupiter gravity, safety shield, solar-collector power supply, climate model
with space mirrors simulated). `best_model.zip` = **episode 50**, chosen by deterministic evaluation on seeds
1001–1002 (ranking: success, then orbit error, then energy); it succeeded on 1 of the 2 test seeds
(a = 2.658 AU, e = 0.011, 7,650 y).

**Honest note on the learning curve.** As in the previous runs, only the deterministic test at **episode 50**
succeeded: the barely-trained network outputs actions near zero, which mean "push roughly prograde at
~2,500 km/s with about half throttle, light set-point ≈ 1× today" – a workable strategy by luck of the action
scaling. From episode 100 on the tests failed (a 2.38 AU at episode 100, falling steadily), and from episode
~600 PPO collapsed to "barely push" (a ≈ 1.03 AU at episode 850, using 1–13 % of the energy): missing the
deadline costs less reward than spending mass and energy on a mission that still fails. This is a reward-design /
exploration problem; the planets neither caused nor fixed it. PPO is not monotonic, which is why the best
evaluated checkpoint is kept. Of the 1,000 exploring training episodes 441 ran out of reaction mass and 559 hit
the deadline.

Comparison: physical metrics, high-fidelity N-body run (Sun, Earth, Moon, Mars, Mercury, Venus, Jupiter,
fragments) on seed 2001, then 200 years without thrust.

| policy | fast model success (3 seeds) | high-fidelity result | final a [AU] | e | sim. years | asteroid used | energy drawn [J] | stable 200 y |
|---|---|---|---|---|---|---|---|---|
| No ejection | 0 % | deadline | 1.0000 | 0.0122 | 10,000 | 0 % | 0 | – |
| Hand-designed heuristic | 100 % | success | 2.6903 | 0.0072 | 3,600 | 95.2 % | 1.756e35 | yes (max \|Δa\| 0.010 AU) |
| **Best PPO model** | 67 % | **success** | 2.6854 | 0.0145 | 7,600 | 99.5 % | 1.732e35 | yes (max \|Δa\| 0.015 AU, Moon bound) |

Other planets (update p35, same runs; safe distances Mercury 0.0197, Venus 0.0483, Jupiter 0.353 AU):

| policy | closest Mercury | closest Venus | closest Jupiter | Jupiter's orbit change Δa |
|---|---|---|---|---|
| No ejection | 0.545 AU | 0.264 AU | 3.94 AU | +1.5e-4 AU |
| Hand-designed heuristic | 0.550 AU | 0.267 AU | 2.33 AU (year 3,567) | +1.5e-4 AU |
| Best PPO model | 0.550 AU | 0.266 AU | 2.27 AU (year 7,587) | +5.3e-5 AU |

All passes are far outside the safe distances. Compared with the previous run without these planets, the
heuristic's final orbit moved from a 2.7000 / e 0.0081 to a 2.6903 / e 0.0072 (high-fidelity) – mainly
Jupiter's pull; both are inside the tolerance (0.05 AU, e 0.05). Note: the planets also reduce the no-ejection
Earth's eccentricity to 0.0122 at year 10,000 (it oscillates; the J2000 value is 0.0167).

Climate and life (part of the task; without the mirrors Earth would settle near 155–157 K, a snowball):

| policy | final surface T | max deviation from 288 K | years outside 288 ± 15 K | mirror light onto Earth | without mirrors | ice line | growing zone | waste heat reaching Earth |
|---|---|---|---|---|---|---|---|---|
| No ejection | 288.0 K | 2.1 K | 0 | 0 | 290 K (still at 1 AU) | 71° | 75 % | 0 |
| Hand-designed heuristic | 288.4 K | 2.6 K | 0 | 1.04e28 J | 157 K | 71° | 75 % | 1.24e26 J |
| Best PPO model | 284.9 K | 4.9 K | 0 | 2.03e28 J | 155 K | 65° | 70 % | 1.23e26 J |

Energy: all launch energy came from the collectors (heuristic 1.756e35 J, PPO 1.732e35 J, nothing from the
reserve); energy-ledger residual 4–6e-16.

Mars safety (safe distance 0.0246 AU): closest pass heuristic 0.0502 AU (272 shield overrides), PPO
0.0470 AU (296 overrides). Mars a 1.5237 → 1.5577 (heuristic) / 1.5114 AU (PPO); Mars's final orbit is
chaotic and depends strongly on the route. The Moon stayed bound in both successful runs.
High-fidelity conservation (PPO run): momentum 3.6e-11, angular momentum 1.0e-13, mass 0, energy 2.6e-8
(relative; momentum is slightly larger than before p35 because Jupiter carries a large momentum – still
round-off level for this sum).

- **Target reached** by the best PPO model in the N-body check: |a − 2.7| = 0.015 AU (tolerance 0.05),
  e = 0.0145, habitable throughout (thanks to the mirrors), stable for 200 years.
- **The heuristic is still the better strategy**: about the same mass and energy, twice as fast
  (3,600 vs 7,600 years), tighter climate control. The PPO checkpoint is essentially a lucky early policy,
  not a learned improvement. Reward tuning (higher `w_time` / failure penalty, lower `w_energy`/`w_mass`),
  a lower learning rate or more episodes are the obvious next steps.
- Training reward is shown separately from the physical metrics in the viewer.

## Known limitations (honest list)

- **Failed-attempts models (p38)** are order-of-magnitude models (ideal cases favour each idea); their animations are illustrations driven by those numbers, not simulations of melting, plasma flow or field geometry, and they do not feed into the RL.
- **Cinematic views (p37) are illustrations**: the hydrogen capture (guidance, markers, net) is not a physical model; the Dyson view uses a real optics / radiation-pressure formula but a stylized arm capacity, analytic failure motions and time compression, and Sun / swarm / concentrator / Earth distances are not to scale. Neither view feeds back into the mission simulation or the RL. In a software-rendered browser they run at a few frames per second (animation time then runs slower, it never jumps).
- The hypothetical preset needs about 0.2–0.4 lunar masses launched at about 1 % of c and about
  5e23 W of average launch power. That is physically extreme; the realistic preset is infeasible.
- Training uses the fast model: the Moon is simulated as an exact Earth–Moon two-body orbit, but
  without the Sun's tidal pull on it (phase drift ~22°/yr), and there are no fragment trajectories
  after escape. The policy is then checked in the full N-body model, on 1 seed only.
- The high-fidelity model uses at most 48 representative fragments, merged when the slots are
  full. Fragment fly-outs close to Earth are under-resolved at dt = 6 h. This gives an energy
  residual of about 1e-6 of |E| over a full mission. Momentum, angular momentum and mass stay at
  round-off level.
- The model is non-relativistic (fine below about 10 % of c). The Sun has a constant mass. Of the
  other planets **Mercury, Venus, Mars and Jupiter** are modelled (update p35); Saturn, Uranus, Neptune,
  dwarf planets and asteroids are not. Long-term (million-year) stability of the final orbit against Jupiter
  is not assessed; 2.7 AU lies next to the 8:3 resonance with Jupiter (2.705 AU). In the fast model the
  planets' tide on the Moon's orbit around Earth is neglected (it is in the N-body model), and the Mars
  shield's forecast ignores Mercury, Venus and Jupiter. Tides appear only as forces on the Moon's orbit and in the Mars-safety
  limits; there is no tidal heating. The only thermal physics is the global climate model and the panel
  temperature.
- The Mars-safety limits (1 % of the Moon's tide, 0.1 % of Earth's pull on the Moon, 2 million km)
  are adjustable stand-ins, not established safety standards. The shield acts once per simulated
  year using a 10-year forecast; during exploration it cannot rescue every random action. Mars's
  final orbit is chaotic, and the fast and N-body models can disagree strongly on it.
- Fixed 100-year decision intervals. Within an interval the thrust direction is held constant in
  the rotating frame.
- The training episodes shown during learning are *stochastic* exploration and usually fail. The
  deterministic evaluations (yellow points) are what selects `best_model.zip`.
- The archived pre-hold run reached its old first-capture criterion in some tests, but that result does not evaluate the current active-maintenance task. The current environment version has **not** been retrained or evaluated for target hold; no current PPO success or comparative performance is claimed. Earlier checkpoints and metrics are retained only as historical context, and the current loader rejects the old PPO artifact.
- The overview is not to scale: the Moon distance is drawn ×100 and body sizes are enlarged. The
  Earth-POV view is true scale, but its ring and arms are an illustration and its environment layers
  are simple standard models that do not feed back into the simulation.
- Solar collectors: only 12 collectors' orbits are simulated (viewer + comparison runs; no feedback on
  Earth); pointing errors, eclipses by Mars/Moon and the beams' push on Earth (≈ 100 m/s per mission, not
  applied) are not simulated; the arms' directional radiators are supporting equipment and remain unverified.
- Climate: global-mean two-box model with a fixed greenhouse effect; no seasons, regions, clouds, carbon
  cycle or biology. The mirrors' light is assumed to be spread evenly enough (enabler E3); the life indicators
  use a fixed equator-to-pole profile; clouds, winds and storms in the view are an illustration. Building
  and pointing ~1.6e15 m² of mirror film is far beyond today's industry; its manufacturing energy
  (~8e20 J, negligible next to the 1.8e35 J launch energy) is not booked in the ledger. The arm heat and dish intensity are physically
  impossible for any known material; they are reported, not solved. Unused beam power is not stored.
- Packet paths in the view use two-body solar gravity after release. Earth's and the Moon's pull on
  a packet is included only in the analytic escape at launch (patched conic). Paths are drawn for
  ≤ 1 year / 60 AU; after that the packets still exist in the physics ledger.
- In the fast model a packet's gravity is included only up to its escape (its final speed and the
  recoil account for climbing out of Earth's, the asteroid's and the Moon's gravity); its pull after
  escape (negligible at ~2,500 km/s) is only in the N-body model. The Moon's pull on an escaping
  packet is credited to Earth rather than the Moon (relative effect ~1e-9).
- Very long sessions: the browser keeps all Earth records of a run (about 80,000 for 10,000 years),
  but only the most recent Moon and packet data.

## Visual environment refresh (display-only p41 refinement)

The renderer-only polish keeps the Earth/Climate work intact while making scene accents clearer. The p41 pass makes
Earth/target, planet, Moon, Mars, collector and asteroid-belt orbit guides more vibrant and color-coded without changing
their paths. It also removes the previous oversized repeating solar-flame loops and replaces them with one localized
active-region cue: subtle sunspots, two thin coronal strands and a brief, restrained surface brightening. This is visual
art, not a solar-activity model or observed event. Existing atmospheric rims, Saturn ring bands, softer star points,
collector/launcher finishes and polished climate mirror panels remain display-only. Existing 14,000 overview stars,
planet/body sizes and the 2,400 display-only asteroid count are retained. Sun and overview planet markers remain enlarged
about 1.5× without changing any recorded position, orbital radius, period or orbital propagation. Procedural crater/band
textures remain display art. All eight planets are shown; Earth's Moon remains simulated, while non-Earth moons are a named
but curated major-moon set, **not** an exhaustive satellite catalogue.

## Sun surface and flare refinement (display-only p42 follow-on)

The follow-on Sun art replaces the previous soft, nearly uniform sphere with a time-warped orange-to-gold photosphere: irregular convection-cell texture, dark molten lanes, hot filaments and limb darkening. Three localized magnetic-loop prominences expand and brighten quickly, then fade at irregular intervals; a soft apex glow makes each pop legible without restoring the oversized repeating flame-shell effect. It remains entirely illustrative—not solar observation data, magnetic-field data or an activity model—and changes no simulated irradiance, gravity, orbit, training, reward or success criteria. Chromium 156 rendered close-up checks confirmed the procedural surface and both idle/flare states; this was a visual-art smoke test, not a live-backend or simulation validation.

## Sun flow and multi-flare refinement (display-only p43 follow-on)

The follow-on speeds up the shader's advected, domain-warped convection pattern so the orange/gold molten lanes visibly drift and simmer rather than read as a fixed painted texture. It adds five independently timed active-region sites with two thin loop arcs each. Each arc rises, sways slightly, flickers and dims on its own short staggered pulse; event starts and strengths differ between sites. The result is intentionally localized and understated rather than a continuous ring of flames. Every surface/flare cue remains illustrative, with no solar-activity or magnetic-field model, and no change to irradiance inputs, gravity, orbital physics, training or reward behavior. Chromium 156 close-up checks rendered calm-flow and active-flare states; filtered project tests also pass. This is a static-visual smoke check, not a live-backend test.


## Cool UI and chart palette refinement (display-only p44 follow-on)

The interface returns to the original cool blue/cyan/violet palette, with slightly brighter panel and control contrast and bolder headings/buttons. UI-only power-chain accents and chart framing/series use the cool baseline again; the green target guide and success cue retain their original semantic color highlights. In the p44 pass, the warm-toned 3D scene—including its orbit guides, Sun and hardware colors—was left unchanged; the later p45 solar-system orbit-guide update is documented below. The p44 pass changed CSS and chart rendering only.


## Cool solar-system orbit guides (display-only p45 follow-on)

The cool palette now also applies to solar-system orbit guides: Earth (cyan), the 2.7 AU target (green), the Moon (violet), Mars and planetary tracks (blue/cyan/violet), the selected major-moon paths, and the asteroid-belt guide lines. The same Earth/target/Moon colors are used in the failed-screen solar context. This changes colors only: orbital positions, geometry, periods and motion are untouched. Sun/planet/asteroid body colors, hardware, and non-orbit scene art remain as before. Engineering collector-orbit tracks and the space-mirror orbit rings are deliberately unchanged. No model, simulation, physics, training, reward or data changes.

Clicking Earth or the bottom-right **Climate** button opens a large Earth-only before/after split with a draggable divider: left without the space-mirror ring, right with the ring scenario. Its calculation card shows distance-law sunlight, model sunlight, mirror contribution and capacity, albedo, greenhouse/emissivity assumptions, equilibrium formula and both temperatures. Idle mode is a labelled 2.7 AU comparison; playback uses the recorded with-mirror and no-mirror values. The ring is visualized at an enlarged 3.2 Earth radii (configured orbit: 20 Earth radii), and does not add optical physics. NASA-derived clouds, illustrative winds and ocean-flow tracers animate while playback continues. Each of the eight clickable planets also opens a worked radiative estimate alongside a separate NASA mean reference; outer display-only planets and gas-giant caveats are labelled.

## Formula inspector (display-only p46 follow-on)

A new **Formula** item on the left rail opens a curated set of **nine** short, one-minute explanations for the active viewer: (1) orbital size/shape, (2) Earth–Moon separation, (3) recorded cumulative packet recoil Δv, (4) asteroid-mass and energy-budget use, (5) the mission two-box climate balance versus the separate idle one-box reference, (6) the collector-to-launcher power chain, (7) Mars distance/tide screening, (8) episode reward, and (9) inverse-square sunlight plus the separate black-body planetary estimate. Clicking the simulated Moon, a clickable planet or project asteroid in the scene, a marked HUD value, climate/Mars status, power-chain row, relevant training chart, climate/planet worked-formula card, or ledger heading opens the matching calculation. The panel shows the equation, symbol meanings, a plain-language explanation, and substitutions from the current displayed state; values refresh while it is open. If a state is not available, it says so rather than inventing one.

This is a display-only teaching aid, not a formula encyclopedia and not a new simulation path. It changes no model, physics, training, reward, baseline, or data. Existing boundaries remain explicit: orbit elements are current osculating values; Δv is a scalar sum of recorded recoil magnitudes, not a vector resultant; mission climate is integrated two-box output while idle climate is a one-box reference; the black-body temperature is not the mission climate or a NASA mean; reward is a training score, not a physical quantity; and a live stochastic PPO episode is not evidence of success. Only nine selected calculations are included in p46.

## Main-model Formula follow-up (display-only p47)

The Formula pane now has **ten** main-model calculations/checks, with larger equations and current-value substitutions and shorter notes. It adds the configured orbit/climate/hold gates, Moon boundness versus Earth-impact diagnostic, and launcher-arm reach versus structural-strength caveat. The planetary black-body estimate remains in the separate clickable planet-temperature card; it is not presented as a main-model mission gate. Clicking Moon or Mars, or a linked HUD value/chart/ledger surface, opens the relevant calculation; the existing baseline, training and playback views remain intact.

The main-model defaults shown are target `a = 2.7 AU ± 0.05 AU`, eccentricity `e ≤ 0.05`, **orbital-plane** inclination `i ≤ 5°`, and climate surface temperature `288 K ± 5 K`. The controlled hold is consecutive and resets if orbit or climate leaves its band; `validate_years = 200` simulated years is the default hold requirement. Earth’s displayed `23.44°` spin-axis tilt is static artwork, not a dynamic success gate. Passive high-fidelity validation is separate: its 200-year coast checks maximum `|Δa|`, maximum `e`, and Moon boundness, not inclination or climate. The pane reads active configuration values where available rather than changing any threshold.

For the Moon, the mission’s bound check is negative Earth-relative specific orbital energy and separation inside half the Hill radius. The separately computed osculating perigee and comparison against Earth+Moon radii are explanatory only—not a mission gate or validated collision safeguard. For the launcher, `√(1.25² + 1.25²) ≈ 1.768 R_E < 2 R_E` establishes the checked geometric reach. The animation persists because there is no arm stress, strength or damage/failure model; `σ_bend = Mc/I` and a safety factor are shown as **unevaluated**, not a certification. No RL success is claimed or inferred, and no discontinuity is interpolated across missing fragments.

This p47 follow-up changes only viewer Formula/layout code, its tests and documentation. The simulation, physics, training, rewards, baselines, data, and launcher simulation are unchanged.

## Earth motion trail points (display-only p48)

The sampled points along Earth’s displayed motion path now use the same dark-to-light blue progression shown in the legend, instead of the former orange-red gradient. This is a color-only renderer change: Earth positions, trail timing, physics and training are unchanged.

Two opposite arms remain braced on the docked asteroid continuously while the other six animate packet throws.
Reflector plates retain polished silver materials and environment reflections; atmospheric rims, orbit-guide contrast,
body enlargement, materials, flares, stars and weather art are renderer-only. No added visual object contributes mass, force, gravity or
collision handling; Earth motion, asteroid mass, fragment velocities, climate metrics and existing caveats remain
physics-driven.

The authoritative per-element list—with scale, timing, and simulated-versus-illustrative boundaries—is
[`ENVIRONMENT_INVENTORY.md`](ENVIRONMENT_INVENTORY.md), also linked from the viewer's Guide. Guide check counts and
benchmark rows are rendered from live API results, not hard-coded passing claims. The original working version and
pre-existing pitch assets were preserved separately; this visual copy does not replace them.

**Validation:** the original numerical baseline is dated 27 October 2026. The p40/p41 software verification and dependency limits are recorded in the Validation section above. The p42/p43 Sun refinements additionally passed Chromium 156 close-up visual smoke checks, JavaScript module syntax checks, and the filtered project tests; the browser checks render local art only, not a live backend. The p44 cool UI/chart restoration passed the filtered suite (**49 passed, 1 deselected**), 26 JavaScript syntax checks, Python compilation, CSS structure/palette-scope assertions, and a local Chromium static-UI smoke render; no live backend was involved. The p45 orbit-color extension passed the same filtered suite and syntax checks, plus targeted assertions for orbit-only scope and preserved collector/mirror rings; these are static checks, not a live backend test. The p46 Formula-inspector update passes **50 tests, 1 deselected**, 24 JavaScript module syntax checks, Python compilation, CSS-brace integrity and a targeted nine-formula/interaction-structure test. No live-backend or browser interaction test was run for p46. The p47 main-model Formula follow-up passes **50 tests, 1 deselected**, 24 JavaScript module syntax checks, Python compilation, CSS brace integrity (**410/410**) and a targeted ten-calculation/requirements test. No live-backend or browser interaction test was run for p47. The p48 Earth trail color follow-up passes its focused test (**1 passed, 51 deselected**) and `frontend/app.js` syntax check; no browser interaction or live-backend test was run. The p41/p42/p43 orbit-color and solar-art changes are display-only; p44 touches UI/chart styling only; p45 recolors only requested orbit guides; p46/p47 change the viewer’s display-only formula explanations; p48 changes only the displayed Earth-trail color gradient. No orbit geometry or main simulation/training behavior changes. No PPO retraining or new RL-success claim is made.
