# OCTO-EARTH — seven-minute pitch script

**Delivery:** ~125–135 words per minute. Use the time windows as hard cues; keep the detailed numbers on the slide rather than reading every label. The deck has eight slides. The times total exactly 7:00.

## 0:00–0:35 — Slide 1 · The question

Can we change Earth’s orbit without changing the laws of physics—and still keep it habitable? OCTO-EARTH is a simulation prototype that explores that question. Its target is the Earth–Moon system moving from 1 AU toward a circular orbit at 2.7 AU within 10,000 simulated years, while a simplified climate model tracks the sunlight shortfall. This is a research question and a scale study, not a claim that a mission is feasible.

## 0:35–1:25 — Slide 2 · Momentum, not a shortcut

Earth never teleports. The control system commands packets of finite asteroid material to leave the Earth–Moon system; the system recoils in the opposite direction under momentum conservation. All eight mass-driver arms throw one packet together per event. The ejected material keeps its velocity and remains in the simulation as fragments or recorded escapes and impacts. The Moon’s gravity is represented in both the fast and high-fidelity models. The agent does not directly edit Earth’s velocity, and it cannot create energy. Our first design check is whether the impulse, energy and mass ledgers close—not whether an animation looks convincing.

## 1:25–2:10 — Slide 3 · Three enablers, separately

We deliberately choose exactly three individual enablers: first, access to a finite 3-times-10-to-the-22-kilogram asteroid as reaction-mass feedstock; second, a thin-film photovoltaic collector field as the electrical source; and third, a space-mirror ring that redirects sunlight for the climate model. These are not bundled systems. Their supporting equipment is listed separately: launcher ring and arms, power conditioning, radiators, microwave transmitters, rectennas, collector station-keeping and factories, plus mirror orbit and pointing. Separating the labels makes the hidden engineering gaps visible; it does not make the support hardware ordinary or buildable.

## 2:10–3:20 — Slide 4 · Scale of the hypothetical preset

The model’s slow-spiral estimate needs about 11.66 kilometres per second of Earth velocity change and a 1.697-times-10-to-the-33-joule increase in Earth–Moon orbital energy. The launcher’s minimum draw is about 1.664-times-10-to-the-35 joules. At the maximum configured speed, the mass screen requires about 1.415-times-10-to-the-22 kilograms—roughly 0.193 lunar masses—from a 3-times-10-to-the-22-kilogram reservoir. The electricity estimate at 2.7 AU is around 1.114-times-10-to-the-25 watts, while peak launcher demand is around 6.338-times-10-to-the-24 watts.

The photovoltaic field has five million collectors at 0.5 AU, intercepting the configured 30 percent of solar output. The modeled total panel area is about 2.109-times-10-to-the-22 square metres; each square panel would be roughly 64,950 kilometres on a side. At 2.7 AU, the mirror capacity is about 1.90-times-10-to-the-17 watts. These are calculations inside a hypothetical configuration—not buildable hardware, verified power delivery, or a promise of success.

## 3:20–4:25 — Slide 5 · Physics and control loop

The fast model is used for learning and propagates the Earth–Moon system efficiently; the high-fidelity model integrates Sun, Earth, Moon, planets through Jupiter and explicit fragments with N-body gravity. The PPO policy receives 31 state values and chooses five controls: packet throttle, two direction angles, ejection speed and mirror-light set-point. Actions become physical forces through the simulation. Reward is a learning score; orbit, mass, energy, climate and safety metrics are reported separately.

Arrival is not success. The implemented task requires 200 consecutive simulated years of agent-controlled orbit and climate hold by default; leaving tolerance resets the clock. After that, evaluation has a distinct passive high-fidelity coast with no ejections. That coast is not agent control and does not train PPO. We have not retrained or evaluated PPO on this current hold task, so we make no current RL success claim.

## 4:25–5:20 — Slide 6 · What the viewer means

The overview and beam views visualize recorded orbital states, collector tracking and energy telemetry; the time controls let a reviewer inspect motion and events. Earth point-of-view layers are individually selectable. Clouds, winds and storms are explanatory graphics, not a coupled weather or space-environment simulation. Habitability is a global-mean two-box climate proxy, not proof of life or regional climate.

Our internal orbit windows are 2.7 AU plus or minus 0.05 AU, orbital-plane inclination at most 5 degrees, and absolute final eccentricity at most 0.05. The 5-degree value is not Earth’s rotation-axis tilt; it is not 5 percent. The supplied PDFs do not state numeric rotation-axis-tilt or eccentricity-change limits, and spin, obliquity and seasons are not modeled.

## 5:20–6:10 — Slide 7 · Four failed-model screens

We also show four independent rejected-model screens. One intentionally merges a laser push with a Dyson-powered, arm-held collector: the required beam is about 6.614-times-10-to-the-25 watts, and the simple global-equilibrium estimate is nearly 44,000 kelvin. Two, an ideal fusion rocket harvesting hydrogen, needs about 1.949-times-10-to-the-21 kilograms; even the entire solar wind for 10,000 years supplies only about 24 percent. Three, Lorentz-force arms need about 4.351-times-10-to-the-17 amperes per arm against an assumed quench screen of 2.25-times-10-to-the-8 amperes; inside Earth’s magnetosphere, internal forces cannot push Earth’s centre of mass. Four, Earth-derived thrusters at an assumed 10-kilometre-per-second exhaust speed: ejecting 1-times-10-to-the-23 kilograms gives only 169 metres per second and an orbit estimate of 1.011 AU. The same ideal rocket equation requires about 4.111-times-10-to-the-24 kilograms—nearly 69 percent of Earth’s initial mass—and even the 1-times-10-to-the-24-kilogram test ceiling remains short. These are concept screens, not full hardware tests, and they remain independent from the main asteroid launcher.

## 6:10–7:00 — Slide 8 · Evidence, limits, next gate

For this p40 packaging check, 48 tests pass when the PyTorch-dependent device benchmark is deselected; the full suite stops at that test because `torch` is missing. The separate physics-check entrypoint is blocked by missing `stable_baselines3` and `torch`. The guide requires safety factor at least 1.5 for every structural element; our main launcher has no structural pass. Launch shock, radiators, beam safety, asteroid capture and long-term stability remain open. The reviewed PDFs omit numeric tilt and eccentricity-change limits.

Next, retrain the current PPO and evaluate held-out seeds through active hold and the separate passive coast; report physical metrics apart from reward; then add structural and thermal analysis. OCTO-EARTH today is an inspectable model with explicit bookkeeping—not a certified propulsion system.
