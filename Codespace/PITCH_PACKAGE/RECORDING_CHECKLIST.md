# Recording checklist (video, max 3:00)

## Before recording

1. Work from the extracted `octo-earth` project folder and verify `frontend/TECHNICAL_BRIEF.pdf` and the pitch deck are the current package versions.
2. On Windows, run `RUN_OCTOEARTH.bat --no-train --no-browser` once to create/repair the project environment and open the viewer without launching PPO. The batch file accepts extra arguments. On another platform, install from `requirements.txt`, then run `python octoearth_rl.py --no-train --no-browser`.
3. Wait for the physics and guide checks to finish. If any check fails, stop the recording and investigate; do not capture a green dashboard from an old run.
4. Prepare the viewer with the local overview, Beams, Ledger, Earth-POV and Weather & Life views available. Hide unnecessary menus and keep the selected POV / time controls visible.
5. Record at 1920×1080 or better, 30 fps, with cursor highlighting enabled but no cursor obscuring figures. Capture voice-over separately to keep narration clear.
6. Close unrelated applications, disable notifications, and avoid showing local file paths or private data.

## During the take

- Follow the time-coded demo storyboard exactly; target 2:50–2:58 so there is room for the final cut to stay under 3:00.
- Use `--no-train` for this demo. Do not start current-version training merely to create a success-looking plot. No current PPO target-hold evaluation exists.
- If no live physical ejection event is available, use the deck’s schematic and label it as such. Do not animate an invented result.
- If an archived mission is displayed at all, overlay **HISTORICAL PRE-HOLD — NOT CURRENT RL EVIDENCE**.
- Keep the main three enablers distinct from support systems. The first failed concept is a merged laser + Dyson-collector attempt; it is not the main launcher.
- Leave a readable end card for two seconds: `48 tests pass · 1 Torch-dependent benchmark blocked` and `Physics check blocked by missing dependencies · No current PPO evaluation · No structural certification`.

## After recording

- Verify duration ≤3:00, audio sync, captions, legibility, and that all statements match `VALIDATION_AND_OPEN_GAPS.md`.
- Export a high-quality MP4 (H.264, 1080p) and an accessible caption file. The ZIP includes the script and storyboard, not an MP4 recording.
- Do not add stock footage, external URLs, or illustrative weather as if it were a physics output. The pitch package is designed around local project assets.
