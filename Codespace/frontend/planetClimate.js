// Simple, transparent black-body estimates for every clickable major planet.
// These calculations are display-only and are kept separate from the orbital / Earth climate models.
export const SOLAR_CONSTANT_W_M2 = 1361.0;
export const SIGMA_SB = 5.670374419e-8;

export const PLANET_TEMPERATURE_DATA = Object.freeze({
  Mercury: Object.freeze({ aAU: 0.38709893, bondAlbedo: 0.068, meanC: 167, kind: 'rocky',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html',
    note: 'Mercury has only a tenuous exosphere; the listed mean hides its very large day–night temperature swing.' }),
  Venus: Object.freeze({ aAU: 0.72333199, bondAlbedo: 0.770, meanC: 464, kind: 'rocky',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html',
    note: 'The dense carbon-dioxide atmosphere produces an extreme greenhouse effect; ε = 1 deliberately omits it.' }),
  Earth: Object.freeze({ aAU: 1.00000011, bondAlbedo: 0.294, meanC: 15, kind: 'rocky',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
    note: 'The black-body estimate omits Earth’s atmosphere and greenhouse effect; the real global-mean surface is warmer.' }),
  Mars: Object.freeze({ aAU: 1.52366231, bondAlbedo: 0.250, meanC: -65, kind: 'rocky',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
    note: 'The thin carbon-dioxide atmosphere, dust, seasons and day–night cycle are omitted from this single global estimate.' }),
  Jupiter: Object.freeze({ aAU: 5.20336301, bondAlbedo: 0.343, meanC: -110, kind: 'giant',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html',
    note: 'Jupiter has no solid surface; the reference is an atmospheric temperature near the 1-bar level and includes internal heat.' }),
  Saturn: Object.freeze({ aAU: 9.53707032, bondAlbedo: 0.342, meanC: -140, kind: 'giant',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html',
    note: 'Saturn has no solid surface; atmospheric pressure level and internal heat affect the reference temperature.' }),
  Uranus: Object.freeze({ aAU: 19.19126393, bondAlbedo: 0.300, meanC: -195, kind: 'giant',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html',
    note: 'Uranus has no solid surface; the reference is atmospheric, and pressure level and seasonal structure matter.' }),
  Neptune: Object.freeze({ aAU: 30.06896348, bondAlbedo: 0.290, meanC: -200, kind: 'giant',
    source: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html',
    note: 'Neptune has no solid surface; the reference is atmospheric, and pressure level and internal heat matter.' }),
});

const html = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const signedC = (c, digits = 1) => `${c < 0 ? '−' : ''}${Math.abs(c).toFixed(digits)} °C`;
const signedK = (k) => `${k.toFixed(1)} K`;

/** Transparent, globally averaged equilibrium estimate; not the project's climate model. */
export function blackbodyEstimate(rAU, bondAlbedo, emissivity = 1) {
  if (!(Number.isFinite(rAU) && rAU > 0) || !(Number.isFinite(bondAlbedo) && bondAlbedo >= 0 && bondAlbedo < 1) ||
      !(Number.isFinite(emissivity) && emissivity > 0)) throw new RangeError('rAU, albedo and emissivity must be physical positive values');
  const solarFlux = SOLAR_CONSTANT_W_M2 / (rAU * rAU);
  const absorbedMean = solarFlux * (1 - bondAlbedo) / 4;
  const temperatureK = Math.pow(absorbedMean / (emissivity * SIGMA_SB), 0.25);
  return { rAU, bondAlbedo, emissivity, solarFlux, absorbedMean, temperatureK, temperatureC: temperatureK - 273.15 };
}

/** Build the display record. `distanceNote` is supplied by the click/focus handler. */
export function buildPlanetTemperature(name, rAU, options = {}) {
  const ref = PLANET_TEMPERATURE_DATA[name];
  if (!ref) return null;
  const distance = Number.isFinite(rAU) && rAU > 0 ? rAU : ref.aAU;
  const estimate = blackbodyEstimate(distance, ref.bondAlbedo, 1);
  const referenceK = ref.meanC + 273.15;
  return {
    name, ...ref, ...estimate, referenceK,
    differenceK: referenceK - estimate.temperatureK,
    distanceNote: options.distanceNote || 'NASA mean orbital distance',
    displayOnly: !!options.displayOnly,
  };
}

/** Detailed worked-calculation card for a clicked planet (Earth uses the dedicated mirror comparison). */
export function planetTemperaturePanelHtml(p) {
  if (!p) return '';
  const flux = p.solarFlux.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const absorbed = p.absorbedMean.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const distance = p.rAU.toFixed(3);
  const estimateC = signedC(p.temperatureC);
  const referenceC = signedC(p.meanC, 0);
  const delta = `${p.differenceK < 0 ? '−' : '+'}${Math.abs(p.differenceK).toFixed(1)} K`;
  const surfaceLabel = p.kind === 'giant' ? 'NASA mean atmospheric reference' : 'NASA mean surface reference';
  const giant = p.kind === 'giant';
  const status = p.displayOnly
    ? `<div class="pclimateDisplayOnly"><b>DISPLAY-ONLY PLANET.</b> Its path in this project is schematic, not a simulated orbit; this estimate uses the NASA semimajor axis.</div>`
    : `<div class="pclimateDisplayOnly">Distance source: ${html(p.distanceNote)}. The temperature estimate is a separate black-body calculation, not an output of the orbital simulation.</div>`;
  return `<section class="pclimateCard" aria-live="polite" aria-label="${html(p.name)} temperature calculation">
    <header class="pclimateHead"><div><div class="pclimateKicker">PLANET TEMPERATURE · WORKED ESTIMATE</div><h2>${html(p.name)}</h2></div>
      <button type="button" class="pclimateClose" data-planet-climate-close aria-label="Close planet temperature calculation" title="Close">×</button></header>
    <div class="pclimateResult"><b>${p.temperatureK.toFixed(1)} K</b><span>${estimateC}</span><small>simple radiative equilibrium</small></div>
    <div class="pclimateRows">
      <div><span>Sun distance, r</span><b>${distance} AU</b></div>
      <div><span>Solar flux, S₀ / r²</span><b>${flux} W/m²</b></div>
      <div><span>Bond albedo, A</span><b>${p.bondAlbedo.toFixed(3)}</b></div>
      <div><span>Global-mean absorbed, S(1−A)/4</span><b>${absorbed} W/m²</b></div>
      <div><span>Earth mirror contribution</span><b>0 W/m² · Earth-only system</b></div>
    </div>
    <div class="pclimateFormula"><b>Worked formula</b><code>T<sub>eq</sub> = [S₀(1−A) / (4 ε σ r²)]<sup>1/4</sup></code>
      <span>=[1361 × (1−${p.bondAlbedo.toFixed(3)}) / (4 × 1 × 5.670374419×10⁻⁸ × ${distance}²)]<sup>1/4</sup> = ${p.temperatureK.toFixed(1)} K</span>
      <small>ε = 1 (black-body: no greenhouse insulation); σ = Stefan–Boltzmann constant; S₀ = 1361 W/m².</small>
    </div>
    <div class="pclimateReference"><b>${surfaceLabel}: ${p.meanC < 0 ? '−' : ''}${Math.abs(p.meanC).toFixed(0)} °C (${signedK(p.referenceK)}).</b>
      <span>NASA reference minus this simple estimate: ${delta}.</span></div>
    <p class="pclimateCaveat">${html(p.note)} ${giant ? 'A giant planet has no solid surface; “temperature” depends on atmospheric pressure level.' : ''}
      The NASA mean is a standard reference, not recalculated for the current live orbital distance; it and this equilibrium estimate are different quantities, not two outputs of one model.</p>
    ${status}
    <footer class="pclimateSource"><a href="${html(p.source)}" target="_blank" rel="noopener noreferrer">NASA NSSDC ${giant ? 'planet' : 'planet'} fact sheet ↗</a>
      <span>Bond albedo and reference values</span></footer>
  </section>`;
}
