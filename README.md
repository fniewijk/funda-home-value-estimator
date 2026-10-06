# Funda Home Value Estimator

A local, dependency-free Chrome / Firefox WebExtension that adds a valuation
panel to Funda **purchase listing detail pages**. The toolbar popup independently
enables/disables energy-label and garden corrections. **Both corrections are on
by default** on a fresh installation. Preferences persist locally
and update open listings without reloading. Rental and search pages are excluded.

## Language

The page panel, popup, calculation explanations, warnings and toolbar metadata
support Dutch and English. The extension automatically uses the browser's UI
language (`browser.i18n.getUILanguage` / `chrome.i18n.getUILanguage`):
`nl` and `nl-*` select Dutch; `en` and `en-*` select English. Other languages
fall back to English. If the extension API is unavailable (for example in the
test fixture), the browser's `navigator.language` is used.
Numbers and euro amounts follow the selected language's formatting.
Reload the extension and pages after changing the browser language.

This translates the extension UI, not Funda itself. Data extraction still uses
Funda's Dutch feature labels; English-language Funda listing extraction is not
part of this change.

## Load it

Store listing icons, bilingual demonstration screenshots and promotional tiles
are in [store-assets](store-assets/). See the
[submission guide](STORE-SUBMISSION.md#listing-artwork) for upload slots and
regeneration commands. Listing artwork is separate from extension ZIPs.

No npm installation or dependencies are required to use the extension.

### Chrome

1. Open `chrome://extensions` and enable **Developer mode**.
2. Select **Load unpacked** and choose the [extension](extension/) folder.
3. Open/reload a Funda purchase listing. Click the extension icon for controls.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**, then [extension/manifest.json](extension/manifest.json).
3. Open/reload a Funda purchase listing. Click the extension icon for controls.

Temporary Firefox add-ons are removed when Firefox restarts. Persistent distribution
requires a Mozilla-signed add-on; Chrome distribution requires a Web Store submission
or managed installation. This repository does not claim store approval.

## Calculation

```
base = living area × neighborhood average asking price per m²
estimate = round(base + base × enabled energy adjustment + enabled garden value)
```

The **Gem. vraagprijs / m²** in Funda's neighborhood section is the baseline,
**not the listing's Vraagprijs per m²**. If living area or the neighborhood rate is
missing, there is no estimate. Open the listing's features/neighborhood information
if Funda has not rendered them yet. No external data is fetched and missing values
are not fabricated.

Energy assumptions relative to C:

| Label | Adjustment |
| --- | --- |
| A+++ / A++++ | +8% |
| A+ / A++ | +6% |
| A | +4% |
| B | +2% |
| C | 0% |
| D | -2% |
| E | -4% |
| F | -6% |
| G | -8% |

For houses, use an explicit garden area from listing features when available.
Otherwise, estimate outdoor plot area as
`max(0, plot area - min(plot area, living area / floors))`.
Use the listed number of residential floors; if absent, explicitly warn about a
**2.5-floor assumption**. Plot-derived outdoor area can include paths and outbuildings.
Named front/back garden areas are summed when present; an explicit total garden
area takes priority. Repeated feature labels are counted once. Side gardens and
depth/width dimensions are not used; if no supported area is listed, the model
falls back to plot area minus estimated building footprint.
The plot fallback is unchanged. Its method and limitations are explained under
**Hoe wordt dit berekend**, rather than in a separate plot-estimation warning.
Prose descriptions are not used as measured garden facts.
Apartments receive no additional plot/garden value.

### Experimental garden adjustment for all houses

All house types (including unknown subtypes) use the same curve.
An unknown property type can use an explicit garden area but never a guessed
footprint. Apartments remain unchanged. Garden measurement and plot fallback
are unchanged; the original percentage bands are no longer used.

```
garden adjustment = 17000 × ln((garden area + 55) / 110) / ln(1.5)
```

A 55 m² garden gives no adjustment; a 110 m² garden gives +€17,000.
Smaller gardens give a discount. The curve is continuous, finite at zero
(approximately -€29,062) and has diminishing marginal returns.
It does not scale with the neighborhood €/m² rate.
If adjustments result in a nonpositive or nonfinite estimate, no valuation or
price comparison is shown and a visible model-input warning is displayed.

[Brainbay's study, 18 December 2024](https://brainbay.nl/nieuwsbericht/de-meerwaarde-van-een-grotere-tuin/)
reports an average terraced-house garden of 55 m² (sold homes in 2022–2024)
and approximately €17,000 additional model value when the garden doubles.
Across all houses, doubling an average 83 m² garden adds about €25,000.
An urban 1930s terrace example rises from €495,000 at 30 m² to €508,000
at 50 m² and €516,000 at 70 m², demonstrating diminishing returns.
These are model-value comparisons holding other features constant, not universal
garden tariffs or measured causal effects.

**Implementation assumptions:** the logarithmic shape and 55 m² offset are ours.
Applying the terrace-based anchors to corner, semi-detached, detached and other
houses is an unvalidated generalization, not a finding of the study.
Treating 55 m² as already represented in Funda's mixed neighborhood baseline is
unvalidated. Discounts below that size, especially the no-garden case, are
extrapolations not established by the study. The curve is neither Brainbay's model
nor locally calibrated, and does not establish house-versus-apartment premiums.

Missing optional data skips that correction **with a visible warning**.
Disabled checks do not produce missing-data warnings.
The comparison is `(asking price - estimate) / estimate`, not a prediction of bids.

### Important limitations

This implements the model in the supplied conversation, not a trained or
independently validated appraisal model. The energy percentages and garden rates
are **heuristic assumptions**, not verified NVM coefficients. The experimental
garden curve is source-informed but not independently validated.
Neighborhood asking
prices already reflect a mix of gardens and labels; adding corrections can double
count these effects. Asking prices are not transaction prices. Condition, ownership,
leasehold, location within a neighborhood and renovations are not modeled.
No bidding premium, investment advice or claims of market accuracy are included.

Funda HTML can change. Extraction uses visible Dutch feature labels and definition
lists rather than private APIs. Unsupported/missing data is surfaced explicitly.
Listing headings retain spaces between the street address, postcode, city and
neighborhood, even when Funda places them in adjacent nested elements.

## Development and validation

Optional tooling requires **Node.js 20+**; no package install is necessary:

```sh
node --test
node scripts/check.mjs
node scripts/build.mjs
```

Equivalent `npm test`, `npm run check` and `npm run build` shortcuts are available
if npm is installed. Build creates [dist/chrome](dist/chrome/) and
[dist/firefox](dist/firefox/) with browser-specific manifests. Firefox output includes
an add-on ID and a no-data-collection declaration. The development source manifest
is usable for temporary loading in both browsers.

To make upload archives after building (macOS/Linux):

```sh
node scripts/package.mjs
```

Archives must contain `manifest.json` at their root. Store listing metadata,
artwork, permission review and signing are separate release tasks.
Packaging rebuilds both distributions, checks their manifests and syntax, creates
fresh runtime-only archives and verifies ZIP integrity and entry lists.
SHA-256 hashes are saved alongside the archives.
See [store submission notes](STORE-SUBMISSION.md) for listing text, privacy and
permission declarations, reviewer instructions and remaining publisher steps.

### Manual smoke test

1. Load the extension and open a Funda house with a neighborhood rate.
2. Verify the panel displays the extracted area/rate, correction breakdown and warnings.
3. Turn energy off, then garden off: with both off, estimate must equal area × rate.
4. Reopen the popup and browser; saved controls should remain unchanged.
5. Test an apartment, missing label, missing neighborhood rate and late-loaded data.
6. Navigate between listings and then to a search/rental page; stale estimates must disappear.
7. Repeat in Chrome and Firefox. Test fixture: [tests/fixtures/listing.html](tests/fixtures/listing.html).

## Privacy

The page panel and popup offer a **Second opinion on Huispedia** link.
The URL is constructed locally from the address, postcode and Funda listing city.
Incomplete addresses or house-number additions use a clearly labeled general
Huispedia search link instead. Constructed address URLs are not verified and may
not match Huispedia's naming. Huispedia is an alternative estimate, not ground truth.
No external lookup occurs until the user clicks; the link opens in a new tab.
Visiting Huispedia is subject to that site's own privacy policy.

Only `storage` and `activeTab` permissions are requested. Content scripts run on
Funda only; the active tab is queried when the user opens the popup. Nothing leaves
the browser: no backend, analytics, accounts, remote scripts or telemetry.
Listing content is displayed using DOM text nodes, not injected HTML.
Not affiliated with Funda.

## Project logo

The original [house logo](extension/assets/logo.svg) uses the supplied palette:
light blue `#64C1ED`, brown `#6A281C` and white. The popup and page panel use the
same palette, with pale blue backgrounds and separate warning/error colours.
It is not Funda's official logo. It appears in the popup, page panel and
browser toolbar. PNG icons are generated from the SVG during builds, without
external dependencies. To regenerate them separately, run
`node scripts/generate-icons.mjs`.
Store listing PNGs with transparent padding are in [store-assets](store-assets/):
128 px for Chrome, 64/128 px for Firefox, and 256/512 px reusable versions.
Regenerate with `node scripts/generate-store-icons.mjs`. These are listing
assets, separate from the extension's toolbar icons and upload archives.

The UI calls the result **Waardeindicatie**. It remains an asking-price-based
heuristic, not an appraisal; the explanation and limitations are under
**Hoe wordt dit berekend**.
The popup and page panel share a concise explanation of the base calculation,
energy rates, experimental garden correction and control-panel toggles.
They state that the estimate may differ from actual value and that no rights
may be derived from it. This disclaimer does not guarantee protection from
legal claims; the detailed model assumptions and sources remain documented above
and in the algorithm.
