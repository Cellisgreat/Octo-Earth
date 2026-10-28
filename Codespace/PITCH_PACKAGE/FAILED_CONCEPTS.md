# Four failed-model screens (separate from the main launcher)

The failed-model page shows **four independent quantitative concept screens**, calculated in `failed_models.py` and `frontend/failedPhysics.js` and displayed one at a time in `frontend/failed.html`. Model 1 intentionally merges the laser-push and Dyson-collector attempts; models 2–4 are distinct. These are simplified screens, not complete mission simulations. None is part of the main asteroid launcher, its recorded orbit/physics or training behavior; the main concept still has exactly three individual enablers.

The common planning target is Earth from 1 AU to 2.7 AU in 10,000 simulated years, requiring Δv = **11,658.31 m/s** of slow-spiral velocity change and **2.206×10¹⁷ N** average tangential push.

## 1 — Laser push plus Dyson-powered, arm-held collector

A schematic Dyson swarm powers one laser; its beam hits the front of one reflective collector held by eight arms and reflects toward Earth. For a perfect reflector, the arm reaction is (P/c)(d−r); absorption of the reflected beam adds (P/c)r, so the ideal total force on Earth plus mechanism is (P/c)d.

- The report-scale beam of **1.29×10²⁵ W** gives **4.30×10¹⁶ N**, about **19.5%** of the target force, and a simple global-equilibrium estimate of **29,235 K**.
- Meeting the target needs **6.614×10²⁵ W** (about **17.3%** of the Sun’s luminosity). Full absorption gives an estimated **43,993 K**; the simple absorbed-energy screen boils the oceans in **55.3 s** and unbinds Earth in about **43.6 days** (with about 262 km of one-dimensional displacement in that interval).
- The illustrated “safe power” screen is about **3.410×10¹⁵ W**. The structural capacity and SF threshold are assumed proxies: capacity is reached at 55% beam power and the proxy falls below SF 1.5 near 36.7%. No real segment, hinge, buckling or dynamic-load certification is computed; the later break cascade is illustrative.

**Verdict: fails** on thermal scale, force shortfall and the assumed support screen.

## 2 — Hydrogen harvesting with an ideal fusion rocket

A magnetic ram-scoop gathers solar-wind hydrogen; an ideal fusion drive expels it. The calculation assumes 100% capture, 100% fusion and all fusion energy becoming directed exhaust. It holds the 1-AU solar-wind flux constant during outward migration, an optimistic assumption because density falls roughly as 1/r².

- With fusion efficiency η = 0.0071, the ideal exhaust estimate is v_e = c√(2η) ≈ **0.12c**. The externally collected fuel requirement is M_E[exp(Δv/v_e)−1] = **1.949×10²¹ kg**.
- At **3.34×10⁻¹⁵ kg/m²/s**, a **100-Earth-radius** scoop collects **1.346×10¹⁵ kg** in 10,000 years (**6.91×10⁻⁷** of the need; the ideal orbit moves about 81 km).
- Even the slider ceiling of **10,000 R_E** collects **1.346×10¹⁹ kg**, only **0.691%** of the requirement and an ideal final orbit near **1.00543 AU**.
- The impossible comparison of harvesting the Sun’s **entire solar wind** in all directions for 10,000 years supplies **24.3%** of the modeled fuel requirement and reaches only **1.221 AU**.

**Verdict: fails** on feedstock availability, even under idealized propulsion assumptions.

## 3 — Superconducting Lorentz-force arms

Eight separate 2-Earth-radius booms carry current. The screen uses a Parker-spiral interplanetary field, a simple self-field quench limit and the force balance on the Earth/boom system.

- The assumed 1 m cable radius and 45 T self-field limit give I_max = 2πaB_c/μ₀ = **2.25×10⁸ A per arm**. The modeled external field is about **4.95 nT at 1 AU**, falling to roughly **1.38 nT at 2.7 AU**.
- If that external field could reach the arms and all eight booms were kept perpendicular to it, I_max would give **1.141×10⁸ N** and roughly **61 m** of outward motion in 10,000 years.
- Matching the target force at 1 AU needs **4.351×10¹⁷ A per arm** (an approximately **303 R_E** cable at the assumed 45 T screen). Because the field weakens, even that reaches only **1.810 AU** in 10,000 years; reaching 2.7 AU requires about **8.603×10¹⁷ A per arm**, ignoring quench.
- In the depicted arrangement the booms run from 1.25 to 3.25 R_E, inside the roughly 10 R_E sunward magnetopause. The Sun’s field is not available there; forces from Earth’s own dipole are internal to the Earth/boom system, so the actual net centre-of-mass push is **0 N**. The hypothetical external-field screen also assumes a plasma return circuit.

**Verdict: fails** on field access, current and the reaction-force path.

## 4 — Earth-derived propellant and thrusters

This model explicitly removes reaction mass from Earth and expels it with thrusters. The reference exhaust speed is **10 km/s** (Isp ≈ **1,020 s**); the chosen reference budget is **1×10²³ kg**, about **1.67% of Earth** or **1.36 lunar masses**. The page lets the user sweep the selected mass from 1×10²⁰ to **1×10²⁴ kg**; exhaust speed remains fixed for this scenario.

- Rocket equation: Δv = v_e ln(M_E/M_f), with M_f = M_E−m_prop. The chosen budget yields **168.87 m/s**, only **1.45%** of the target Δv, and the quasi-circular slow-spiral estimate ends at **1.01144 AU**.
- At 10 km/s, rearranging the equation requires **4.111×10²⁴ kg** (**68.83%** of Earth’s initial mass, or **41.1 times** the reference budget). Even the slider’s 1×10²⁴ kg ceiling gives only **1,833 m/s** and **1.13542 AU**, so the target remains out of range across the control.
- The required directed-exhaust kinetic-energy estimate is **2.055×10³² J**, or **6.513×10²⁰ W** averaged over 10,000 years (about 5,361 times the sunlight Earth absorbs today). This ideal estimate excludes engine and power-plant mass, conversion losses, heat rejection and trajectory control; Earth’s rendered size, gravity and orbital response to mass loss are not simulated.

**Verdict: fails for this explicit exhaust-speed and propellant-budget case.** It is not a proof that every imaginable exhaust speed or propulsion concept is impossible.

## Assumptions and why keep the failures in the pitch

Laser heating milestones use simple heat-capacity/latent-heat and binding-energy estimates and ignore re-radiation; temperatures are global-equilibrium estimates. The solar-wind case uses 5 protons/cm³ at 400 km/s near 1 AU. Magnetic booms, scoop size, the Sun/orbit/Moon context, field lines, proton dots, thruster hardware and exhaust are schematic. The thruster orbital progress is calculated from the ideal rocket equation and the common quasi-circular slow-spiral Δv relation, not integrated by the main model. Every failure calculation is independent of the main simulation; no failed-concept animation proves that its hardware can be built.

The failures make scale and model boundaries visible. The main concept instead uses finite asteroid reaction mass, a separate hypothetical PV source and a separate reflected-light climate control. These are three individual enablers; support systems remain separate. The main launcher’s physics and training behavior are unchanged by the failed-model page.
