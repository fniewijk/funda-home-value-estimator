# Store submission: version 0.1.0

## Upload packages

- Chrome Web Store: [funda-estimator-chrome.zip](dist/funda-estimator-chrome.zip)
- Mozilla Add-ons (AMO): [funda-estimator-firefox.zip](dist/funda-estimator-firefox.zip)
- Integrity hashes: [SHA256SUMS.txt](dist/SHA256SUMS.txt)

These are unsigned submission ZIPs, not approved or signed store releases.
Each archive contains its manifest at the root and only extension runtime files.
There is no bundling, minification, remote code or dependency installation.
The uploaded JavaScript is readable source; no separate source build is needed.

Regenerate with Node.js 20+ and the `zip` / `unzip` utilities:

```sh
node --test
node scripts/package.mjs
```

Chrome minimum: 109. Firefox minimum: 140.
Firefox's permanent add-on ID is
`funda-home-value-estimator@extensions.local`; retain this ID for future updates.
The Firefox manifest declares no data collection. Version increases must be made
in both the extension manifest and package metadata before publishing updates.

## Suggested listing text

Name: **Funda Home Value Estimator**

English summary:

> Compare Funda asking prices with a transparent home value estimate and optional energy label and garden adjustments.

English description:

> See a local, indicative home value calculation on Dutch Funda sale listings.
> The base is living area multiplied by the neighborhood's average asking price
> per square metre. Enable or disable energy label and experimental garden
> adjustments independently from the toolbar control panel. Dutch and English
> interfaces are selected automatically from your browser language.
>
> View the calculation breakdown and open Huispedia for an alternative opinion.
> No account, analytics, tracking or automatic external data requests.
> The estimate is heuristic, not an appraisal or bidding advice, and may differ
> from actual value. No rights may be derived from it. Not affiliated with Funda
> or Huispedia. Extraction currently supports Dutch Funda feature labels.

Dutch summary:

> Vergelijk Funda-vraagprijzen met een transparante waardeindicatie en optionele energielabel- en tuincorrecties.

Dutch description:

> Bekijk een lokale waardeindicatie bij Nederlandstalige Funda-koopadvertenties.
> De basis is de woonoppervlakte maal de gemiddelde buurtvraagprijs per m².
> Zet de energielabel- en experimentele tuincorrectie afzonderlijk aan of uit
> via het controlepaneel. De interface kiest automatisch Nederlands of Engels
> op basis van de browsertaal.
>
> Bekijk de berekening en open Huispedia voor een tweede mening.
> Geen account, tracking, analytics of automatische externe gegevensverzoeken.
> Dit is een globale schatting, geen taxatie of biedadvies. De uitkomst kan
> afwijken van de werkelijke waarde. Aan deze waardeindicatie kunnen geen rechten
> worden ontleend. Niet verbonden aan Funda of Huispedia.

## Privacy and permission declarations

Single purpose:

> Provide a transparent, local home value comparison on Funda sale listings.

- `storage`: stores the two correction toggles locally in the user's browser.
- `activeTab`: reads the active Funda tab's URL and requests its already-extracted
  valuation when the user opens the toolbar popup.
- Content scripts: access only `https://www.funda.nl/*` and `https://funda.nl/*`
  to read rendered listing details and display the panel. No all-sites access.
- No remote JavaScript, backend, telemetry, analytics, tracking or accounts.
- Listing addresses and values are processed in memory, not stored or sent to
  the developer. Preferences are the only persistent extension data.
- A user-initiated Huispedia link opens an external site. A direct address link
  includes the property city, postcode, street and number in its URL; otherwise
  the link goes to Huispedia's homepage. Huispedia then receives a normal
  browser navigation and applies its own privacy policy. No lookup is automated.
- Chrome data-use disclosures and AMO's no-collection declaration must accurately
  reflect this behavior. Do not promise that clicking external links sends no data.

If a public privacy policy URL is required, publish a reviewed policy containing
the above facts on a website you control. This repository does not supply a
verified public policy URL or legal assurance.

## Reviewer test instructions

No credentials or account required.

1. Open a Dutch Funda purchase-detail listing with visible living area and
   neighborhood average asking price per m²; expand features if necessary.
2. Confirm the floating panel shows base, energy and garden adjustments.
3. Open the toolbar popup. Disable both corrections: the estimate must equal
   living area × neighborhood average rate. Restore either independently.
4. Reopen the popup: preferences remain saved. Open pages update immediately.
5. Open the Huispedia link: it opens a separate tab only when clicked.
6. Test a listing without a neighborhood rate: show an explicit missing-data
   warning, not an invented estimate. Search/rental pages show no valuation panel.
7. Set the browser interface to Dutch or English, reload the extension and tab,
   and confirm labels, explanations and formatting follow that language.

The local development fixture is not included in the upload archives. Site
markup may change, and Funda may apply visitor verification.

## Listing artwork

All artwork is separate from the runtime ZIPs.

| Upload slot | File |
| --- | --- |
| Chrome icon, 128 x 128 | [PNG](store-assets/chrome-store-icon-128.png) |
| Firefox icon, 64 x 64 | [PNG](store-assets/firefox-store-icon-64.png) |
| Firefox icon, 128 x 128 | [PNG](store-assets/firefox-store-icon-128.png) |
| Dutch valuation screenshot, 1280 x 800 | [JPEG](store-assets/screenshot-valuation-nl.jpg) |
| Dutch controls screenshot, 1280 x 800 | [JPEG](store-assets/screenshot-controls-nl.jpg) |
| English valuation screenshot, 1280 x 800 | [JPEG](store-assets/screenshot-valuation-en.jpg) |
| English controls screenshot, 1280 x 800 | [JPEG](store-assets/screenshot-controls-en.jpg) |
| Small promotional tile, 440 x 280 | [JPEG](store-assets/promo-small-440x280.jpg) |
| Marquee promotional tile, 1400 x 560 | [JPEG](store-assets/promo-marquee-1400x560.jpg) |

Use the English screenshots for the global screenshot slots as well. The
language-neutral promotional tiles work for either language. No video is supplied.
Screenshots and tiles are RGB JPEGs without transparency. The icon PNGs use
transparent padding and original house artwork, not Funda's official logo.
Additional 256 and 512 px PNGs are available in [store-assets](store-assets/).

Screenshots show the actual extension UI with explicitly labeled sample data,
not live listings or verified market valuations. The English screenshots retain
Dutch listing fields because the extension translates its UI, not Funda.

Regenerate icons with `node scripts/generate-store-icons.mjs`. Regenerate
screenshots/tiles on macOS with `node scripts/generate-store-images.mjs`, which
uses installed Chrome and `sips`. Set `CHROME_PATH` if Chrome is elsewhere.
The renderer uses a temporary separate browser profile and cleans it up.

## Remaining publisher steps

- Sign in to your own Chrome developer and AMO accounts.
- Upload the corresponding ZIP; review the official store validator output.
- Supply publisher identity, support details, distribution choices and any
  required public privacy policy URL. None are fabricated here.
- Upload the padded [Chrome store icon](store-assets/chrome-store-icon-128.png)
  or [Firefox store icon](store-assets/firefox-store-icon-64.png).
  A [128 px Firefox version](store-assets/firefox-store-icon-128.png) and
  [256 px](store-assets/store-icon-256.png) / [512 px](store-assets/store-icon-512.png)
  versions are also provided. All are transparent PNGs using the original house
  artwork. Regenerate with `node scripts/generate-store-icons.mjs`.
- Upload the appropriate screenshots and promotional tiles from the table above.
- Run a real installed-extension smoke test in both browsers before submitting.
  Automated tests and browser fixture checks do not replace this step.
- Submit for store review. Firefox's installable signed release comes from AMO;
  renaming an unsigned ZIP to XPI does not produce a signed add-on.
- Independently review the name, branding and legal disclaimer for publication.
  The original house logo is not the official Funda logo; store approval and
  trademark/legal suitability are not guaranteed.

Official references:

- [Chrome publishing](https://developer.chrome.com/docs/webstore/publish)
- [Chrome listing images](https://developer.chrome.com/docs/webstore/images)
- [AMO submission](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Firefox add-on IDs](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/)
