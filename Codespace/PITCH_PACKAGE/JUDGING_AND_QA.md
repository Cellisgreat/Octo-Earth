# Judging checklist and Q&A brief

## Supplied participant-guide format

- **Demo video:** maximum 3 minutes.
- **Pitch:** 7 minutes.
- **Questions:** 5 minutes.
- **Technical report:** at most 8 pages; cover concept, enablers, model/labels, equations, benchmarks, results and limits.
- Provide runnable source with setup/run/test instructions, conservation/baseline evidence and a complete momentum ledger.
- The guide’s structural requirement is **safety factor ≥1.5 for every structural element**. The main launcher has no such pass; do not hide this behind the failed-model proxy.
- Numeric rulebook safety thresholds beyond the explicit supplied-guide statements are not present in the reviewed PDFs. Do not invent them.

## Judging weights quoted in the supplied guide

| Criterion | Marks | Pitch emphasis |
|---|---:|---|
| Physical correctness | 30 | Reaction mass, equal-and-opposite momentum, energy sources and loads. |
| Validation and numerical rigour | 20 | Ten guide benchmarks, convergence, baseline and clear tolerances. |
| Scientific honesty | 15 | Three individual enablers, separate support systems, failed concepts and unmodeled hazards. |
| Simulation depth | 15 | Orbits, mass depletion, fragments, Moon/planet gravity and habitability proxy. |
| Visualization and usability | 10 | Readable scales, selectable POVs, live telemetry and distinction between simulated and illustrated. |
| Presentation and questions | 10 | Explain estimates, forces, ledger, safety, evidence and next tests. |
| Optional energy bonus | +10 | Only if a real modeled source supplies the energy within the deadline; no automatic credit is claimed. |

## Likely questions and short, evidence-bounded answers

**1. Does OCTO-EARTH show that Earth can actually be moved to 2.7 AU?**  
No. It is a hypothetical numerical prototype. The configured analytic gate passes only under extreme assumptions, including a 3×10²² kg accessible asteroid and a multi-million-panel PV field. Capture, launcher construction, safety, deployment and climate response are not validated.

**2. Has the RL agent reached and maintained the target?**  
There is no current-version PPO retraining or target-hold evaluation. The current environment implements a continuous active hold, but implementation and unit checks are not performance evidence. Archived first-capture results predate the hold task and are not used as current success claims.

**3. What happens at arrival?**  
Arrival does not finish the agent-controlled phase. The agent must keep orbital and enabled climate checks inside their configured windows for 200 consecutive simulated years by default; any exit resets progress. A separate high-fidelity, zero-ejection coast follows as a passive stability test. It is not the active hold and is not PPO feedback.

**4. How does the simulation move Earth without teleporting it?**  
It ejects finite packets of asteroid reaction mass. The Earth–Moon system recoils according to momentum conservation and the orbital integrator advances the state. The policy commands ejection parameters; it never writes Earth’s velocity directly. Fragments retain velocities and are tracked rather than deleted.

**5. Where does the energy come from?**  
The model’s hypothetical source is sunlight captured by a thin-film photovoltaic field. Separate microwave arrays and arm-tip rectennas transfer power to the launcher. Conversion, beam, heat and packet-energy flows are tracked in the ledger. That energy chain is not a real, buildable supply system and does not establish a bonus award.

**6. Why are mirrors needed, and do they make energy?**  
At 2.7 AU direct solar flux is much lower. The simplified climate model uses reflected sunlight from the mirror ring to offset that shortfall. Mirrors redirect sunlight; they do not generate energy. Real mirror orbits, pointing and illumination patterns are not validated.

**7. What does “5 degrees” mean? Is Earth’s axial tilt held to 5°?**  
No. The project’s internal 5° figure is **orbital-plane inclination**, in degrees. It is not Earth’s spin-axis obliquity and not “5% rotation-axis tilt.” The supplied PDFs do not give a numeric rotation-axis-tilt threshold, and Earth’s axial tilt is not simulated.

**8. What does eccentricity ≤0.05 mean?**  
It is the project’s **absolute final eccentricity tolerance**, not a cap on how much eccentricity may change. It is a prototype setting, not a numeric official threshold found in the reviewed PDFs.

**9. Did you pass the structural safety requirement?**  
No. The guide requires SF ≥1.5 for every structural element. Formula helpers and a separate failed-concept proxy are not connected to real main-launcher material/section/hinge data. There is no main-launcher structural safety pass or certification.

**10. Why call the collector field an enabler but not bundle the transmitters with it?**  
The selected three are deliberately individual assumptions: finite-asteroid access, thin-film photovoltaic generation and the mirror ring. Transmitters, rectennas, radiators, launcher arms, factories, feedstock and pointing systems are listed separately. The classification is transparent, not a claim that the supporting equipment is feasible.

**11. What validation has been completed?**  
The p40 sandbox run passed 48 tests with one PyTorch-dependent device benchmark deselected; a full-suite attempt reached 48 passes and stopped at that benchmark because `torch` is missing. The standalone physics-check entrypoint is blocked by missing `stable_baselines3` and `torch`. These software results do not verify mission success or hardware.

**12. What is next?**  
Before claiming agent performance: retrain on the current environment version, evaluate multiple held-out seeds through active hold and the separate passive coast, publish physical metrics independently of reward, then test the missing structural, thermal, launch-shock, sensing and long-term-orbit models.
