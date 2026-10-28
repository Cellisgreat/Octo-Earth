# Rebuilding pitch assets

The p40 slide deck has been regenerated. The technical-brief HTML source is updated, but its bundled PDF remains the earlier three-model render; it is not the current p40 handout.

- `OCTO_EARTH_PITCH_DECK.pptx`: regenerated from `build_pitch_deck.py`; dependency `python-pptx` (the main simulation does not import it).
- `TECHNICAL_BRIEF_SOURCE.html`: current p40 print source, self-contained with inline CSS/SVG and no external runtime URLs.
- `TECHNICAL_BRIEF_8P.pdf`: prior p39 three-model snapshot. A fresh print render was not possible in this sandbox because Chromium cannot launch without `libnspr4.so`.
- `CALCULATIONS_REPORT.pdf` / `.html`: generated from the project’s `calc_report.py` and `octoearth_rl.py` functions.

When regenerating the technical-brief PDF, use the current HTML source and check the eight-page layout. Do not reduce the brief’s caveats or relabel project-internal tolerances as official rules.
