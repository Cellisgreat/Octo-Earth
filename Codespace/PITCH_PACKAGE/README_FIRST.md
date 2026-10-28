# OCTO-EARTH pitch package

**Updated 28 October 2026.** This is a video-ready production pack for a seven-minute pitch and a separate three-minute demo video. It contains an updated slide deck, timed scripts, the current p40 technical-brief HTML source (the bundled PDF is an earlier snapshot), calculation references, failure analysis, a validation summary and Q&A notes. It is **not** a rendered or recorded video.

## Start here

1. Open `OCTO_EARTH_PITCH_DECK.pptx` and present with `OCTO_EARTH_7_MIN_PITCH_SCRIPT.md`.
2. Record the demo from `OCTO_EARTH_3_MIN_DEMO_SCRIPT.md` using the local project viewer. Keep the final cut at or below three minutes.
3. Use `TECHNICAL_BRIEF_SOURCE.html` for the current p40 four-model handout. `TECHNICAL_BRIEF_8P.pdf` is the earlier rendered three-model snapshot; it has not been regenerated in this sandbox, so do not present that PDF as the current p40 brief.
4. Read `VALIDATION_AND_OPEN_GAPS.md` and `JUDGING_AND_QA.md` before Q&A. Do not convert model checks into a hardware certification or an RL success claim.

## Files

- `OCTO_EARTH_PITCH_DECK.pptx` — eight slides with speaker timing on-slide.
- `OCTO_EARTH_7_MIN_PITCH_SCRIPT.md` — timed narration aligned to the deck.
- `OCTO_EARTH_3_MIN_DEMO_SCRIPT.md` — time-coded screen-recording storyboard, voice-over and shot notes.
- `OCTO_EARTH_3_MIN_CAPTIONS.srt` — starter caption file aligned to the demo voice-over.
- `RECORDING_CHECKLIST.md` — local setup, recording checks and export checklist.
- `TECHNICAL_BRIEF_SOURCE.html` — current p40 four-model technical reference. `TECHNICAL_BRIEF_8P.pdf` is the earlier p39 rendered snapshot and has not been regenerated.
- `CALCULATIONS_REPORT.pdf` / `CALCULATIONS_REPORT.html` — full calculation reference generated from the project’s calculation functions.
- `EVIDENCE/` — the dated 27 October successful-check snapshot and pre-hold archive note; not the current p40 verification.
- `FAILED_CONCEPTS.md` — the four independent failed-model screens, assumptions and separate calculations.
- `VALIDATION_AND_OPEN_GAPS.md` — current checks, what they mean, and what remains unverified.
- `JUDGING_AND_QA.md` — supplied judging weights, schedule requirements and likely questions.
- `METRICS_AND_CAVEATS.json` — machine-readable hypothetical-preset figures and evidence status.
- `SOURCES.md` — supplied challenge documents and project-local sources.
- `BUILD_ASSETS.md` / `build_pitch_deck.py` — optional regeneration notes and slide generator.

## Central claim

OCTO-EARTH is a **hypothetical, physics-led simulation prototype** exploring whether reaction-mass ejections could move the Earth–Moon system outward while a separate mirror model offsets reduced sunlight. Earth moves only through momentum-conserving physics; the RL policy does not directly alter Earth’s velocity and does not create energy.

Exactly three **individual** enablers are selected: (E1) access to a finite asteroid, (E2) a thin-film photovoltaic collector field, and (E3) a space-mirror ring. Launcher, power-transfer, radiator, factory and pointing equipment; feedstock; and unresolved engineering assumptions are inventoried separately. This classification does not make any supporting hardware buildable or safe.

## Evidence boundary

- p40 verification: **48 project tests passed with one PyTorch-dependent device benchmark deselected**; the full suite's only failure was the missing `torch` package. `octoearth_rl.py --check` is blocked at dependency preflight by missing `stable_baselines3` and `torch`; see `VALIDATION_AND_OPEN_GAPS.md`.
- These are software, numerical and formula-level checks—not mission success, hardware validation, structural certification, or proof of habitability.
- The current environment is `controlled-target-hold-v1`. **No PPO retraining or current-version target-hold evaluation has been performed. No current RL success is claimed.** The archived PPO comparison uses the older first-capture task and is not evidence for the current hold task.
- The default hypothetical numbers are internally calculated estimates, not engineering designs. The model itself labels the configuration physically hypothetical.
- Project-internal orbit tolerances (2.7 AU ±0.05 AU; orbital-plane inclination ≤5°; absolute final eccentricity ≤0.05) are not official thresholds found in the reviewed PDFs. Earth’s spin-axis tilt is not modeled.

The runnable source and interactive viewer are included at the project root in this same archive; this folder holds the pitch assets.
