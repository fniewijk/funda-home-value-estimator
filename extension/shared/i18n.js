(function (root) {
  "use strict";

  const english = Object.freeze({
    "Tweede mening op Huispedia": "Second opinion on Huispedia",
    "Zoek op Huispedia voor een tweede mening": "Search Huispedia for a second opinion",
    "Basis: woonoppervlakte × gemiddelde buurtvraagprijs per m².": "Base: living area × average neighborhood asking price per m².",
    "Energielabel: correctie op de basiswaarde. A+++/A++++ +8%, A+/A++ +6%, A +4%, B +2%, C 0%, D −2%, E −4%, F −6%, G −8%.": "Energy label: adjustment to the base value. A+++/A++++ +8%, A+/A++ +6%, A +4%, B +2%, C 0%, D −2%, E −4%, F −6%, G −8%.",
    "Tuin: experimentele correctie op basis van opgegeven of geschatte tuinoppervlakte. 55 m² = € 0; 110 m² = +€ 17.000. Kleinere tuinen geven een korting; extra meters tellen minder zwaar mee. Niet toegepast bij appartementen.": "Garden: experimental adjustment based on listed or estimated garden area. 55 m² = €0; 110 m² = +€17,000. Smaller gardens receive a discount; additional metres contribute less. Not applied to apartments.",
    "Zet de energielabel- en tuincorrectie aan of uit in het controlepaneel via het extensie-icoon.": "Enable or disable the energy label and garden adjustments in the control panel via the extension icon.",
    "Dit is een globale schatting, geen taxatie of biedadvies. De uitkomst kan afwijken van de werkelijke waarde. Aan deze waardeindicatie kunnen geen rechten worden ontleend.": "This is a rough estimate, not an appraisal or bidding advice. The result may differ from the actual value. No rights may be derived from this value estimate.",
    "Funda woningwaarde": "Funda home value",
    "Woningwaarde-check": "Home value check",
    "Een transparante vergelijking met de buurt.": "A transparent comparison with the neighborhood.",
    "Controlepaneel": "Control panel",
    "De basis van de geschatte woningwaarde is de gemiddelde vraagprijs per m² in de buurt, vermenigvuldigd met de woonoppervlakte.": "The estimated home value starts with the neighborhood's average asking price per m² multiplied by the living area.",
    "Energielabel meenemen": "Include energy label",
    "Energielabelaanpassing": "Energy label adjustment",
    "Tuincorrectie meenemen": "Include garden adjustment",
    "Gemeten tuin of schatting uit perceel en woonlagen.": "Listed garden area or an estimate from plot size and residential floors.",
    "Instellingen laden…": "Loading settings…",
    "Opnieuw proberen": "Try again",
    "Huidige woning": "Current home",
    "Woninggegevens laden…": "Loading home details…",
    "WAARDEINDICATIE": "VALUE ESTIMATE",
    "Waardeindicatie": "Value estimate",
    "Pagina opnieuw lezen": "Read page again",
    "Hoe wordt dit berekend": "How this is calculated",
    "Heuristisch model, geen taxatie of biedadvies. Pas het berekenmodel aan via het controlepaneel.": "Heuristic model, not an appraisal or bidding advice. Adjust the calculation model in the control panel.",
    "Energiecorrecties: A+++/A++++ +8%, A+/A++ +6%, A +4%, B +2%, C 0%, D −2%, E −4%, F −6%, G −8%.": "Energy adjustments: A+++/A++++ +8%, A+/A++ +6%, A +4%, B +2%, C 0%, D −2%, E −4%, F −6%, G −8%.",
    "Alle woonhuizen: experimentele tuincorrectie ten opzichte van 55 m². Bij 55 m² is de aanpassing € 0; bij 110 m² +€ 17.000. Kleinere tuinen geven een korting; extra meters tellen steeds minder zwaar mee.": "All houses: experimental garden adjustment relative to 55 m². At 55 m² the adjustment is €0; at 110 m² it is +€17,000. Smaller gardens receive a discount; additional metres contribute progressively less.",
    "Formule: € 17.000 × ln((tuinoppervlakte + 55) / 110) / ln(1,5).": "Formula: €17,000 × ln((garden area + 55) / 110) / ln(1.5).",
    "Brainbay, 18 december 2024": "Brainbay, 18 December 2024",
    "noemt een gemiddelde tuin van 55 m² bij tussenwoningen en circa € 17.000 meerwaarde bij verdubbeling. De curve, kortingen en aanname dat 55 m² al in het buurtgemiddelde zit zijn niet gevalideerd. Dit is geen lokale marktprijs of vergelijking met een appartement zonder tuin.": "reports an average terraced-house garden of 55 m² and approximately €17,000 added value when it doubles. The curve, discounts and assumption that the neighborhood average already includes 55 m² are unvalidated. This is not a local market price or a comparison with an apartment without a garden.",
    "Toepassing van deze tussenwoningreferentie op alle woonhuizen is een niet-gevalideerde veralgemenisering. Appartementen krijgen geen extra tuinwaarde.": "Applying this terraced-house reference to all houses is an unvalidated generalization. Apartments receive no additional garden value.",
    "Als de tuinmaat ontbreekt: perceel − woonoppervlakte / woonlagen. Zonder aantal woonlagen gebruiken we expliciet een aanname van 2,5.": "If garden size is missing: plot area − living area / residential floors. If the floor count is missing, we explicitly assume 2.5 floors.",
    "Opgegeven tuinoppervlakten hebben voorrang. Voor- en achtertuin worden opgeteld; een totale tuinmaat heeft voorrang. De perceelschatting is buitenruimte, geen gemeten tuin: muren, bijgebouwen en ongelijke verdiepingen zijn niet apart verrekend.": "Listed garden areas take priority. Front and rear gardens are added together; a total garden area takes priority. The plot estimate is outdoor space, not a measured garden: walls, outbuildings and unequal floors are not accounted for separately.",
    "Deze percentages zijn aannames uit het prototype, geen geverifieerde marktcoëfficiënten. Buurtvraagprijzen zijn geen verkoopprijzen en kunnen verschillen in energie en tuin al bevatten. Aanpassingen kunnen daardoor dubbel meetellen.": "These percentages are prototype assumptions, not verified market coefficients. Neighborhood asking prices are not sale prices and may already reflect differences in energy labels and gardens. Adjustments may therefore double-count these effects.",
    "Werkt lokaal op Funda. Geen account, tracking of externe dataverzending. Niet verbonden aan Funda.": "Runs locally on Funda. No account, tracking or external data transmission. Not affiliated with Funda.",
    "Toon": "Show",
    "Verberg": "Hide",
    "Funda koopwoning": "Funda home for sale",
    "Wonen": "Living area",
    "Buurtgemiddelde": "Neighborhood average",
    "Basiswaarde": "Base value",
    "Energielabel {label}": "Energy label {label}",
    "onbekend": "unknown",
    "Uitgeschakeld": "Disabled",
    "Niet toegepast": "Not applied",
    "Tuincorrectie": "Garden adjustment",
    "Vraagprijs": "Asking price",
    "Vraagprijs gelijk aan de waardeindicatie.": "Asking price equals the value estimate.",
    "Vraagprijs {amount} ({percent}%) boven de waardeindicatie.": "Asking price is {amount} ({percent}%) above the value estimate.",
    "Vraagprijs {amount} ({percent}%) onder de waardeindicatie.": "Asking price is {amount} ({percent}%) below the value estimate.",
    "Nog geen schatting mogelijk. Open de kenmerken en buurtinformatie; Funda kan deze gegevens later laden.": "No estimate available yet. Open the features and neighborhood information; Funda may load these details later.",
    "De basis van de geschatte woningwaarde is de gemiddelde vraagprijs per m² in de buurt, vermenigvuldigd met de woonoppervlakte. De energielabelaanpassing geldt alleen voor de basiswaarde; de tuincorrectie wordt apart verrekend.": "The estimated home value starts with the neighborhood's average asking price per m² multiplied by the living area. The energy label adjustment applies only to the base value; the garden adjustment is calculated separately.",
    "Tuinoppervlakte uit de advertentie.": "Garden area from the listing.",
    "Geschat grondoppervlak van de woning: {area} m²; {floors} woonlagen.": "Estimated building footprint: {area} m²; {floors} residential floors.",
    "De perceelschatting is buitenruimte, geen gemeten tuin. Muren, bijgebouwen en ongelijke verdiepingen zijn niet apart verrekend.": "The plot estimate is outdoor space, not a measured garden. Walls, outbuildings and unequal floors are not accounted for separately.",
    "Woonhuis: experimentele tuincorrectie ten opzichte van {area} m². Bij 55 m² is de aanpassing € 0; bij 110 m² +€ 17.000. Kleinere tuinen geven een korting; extra meters tellen steeds minder zwaar mee.": "House: experimental garden adjustment relative to {area} m². At 55 m² the adjustment is €0; at 110 m² it is +€17,000. Smaller gardens receive a discount; additional metres contribute progressively less.",
    "€ 17.000 × ln(({area} + 55) / 110) / ln(1,5) = {value}": "€17,000 × ln(({area} + 55) / 110) / ln(1.5) = {value}",
    "Bron: Brainbay, 18 december 2024": "Source: Brainbay, 18 December 2024",
    "Brainbay beschrijft gemiddelde meerwaarde bij vergroting van een tuin. De referentie van 55 m² en € 17.000 bij verdubbeling betreft tussenwoningen; toepassing op alle woonhuizen is een niet-gevalideerde veralgemenisering. De curve, kortingen en aanname dat 55 m² al in het buurtgemiddelde zit zijn niet gevalideerd. Dit is geen lokale marktprijs of vergelijking met een appartement zonder tuin.": "Brainbay describes the average added value of enlarging a garden. The 55 m² reference and €17,000 doubling increment concern terraced houses; applying them to all houses is an unvalidated generalization. The curve, discounts and assumption that the neighborhood average already includes 55 m² are unvalidated. This is not a local market price or a comparison with an apartment without a garden.",
    "Appartement: geen extra perceel-/tuinwaarde toegepast.": "Apartment: no additional plot or garden value applied.",
    "Buurtvraagprijzen kunnen verschillen in energie en tuin al bevatten. Aanpassingen kunnen daardoor dubbel meetellen.": "Neighborhood asking prices may already reflect differences in energy labels and gardens. Adjustments may therefore double-count these effects.",
    "Open een koopwoning op funda.nl om de waardeindicatie te zien.": "Open a home for sale on funda.nl to see the value estimate.",
    "Deze pagina is geen ondersteunde Funda-koopadvertentie, of wordt nog geladen.": "This page is not a supported Funda sale listing, or is still loading.",
    "Onvoldoende gegevens": "Insufficient data",
    "Vraagprijs: {price}. Verschil met de waardeindicatie: {difference}.": "Asking price: {price}. Difference from the value estimate: {difference}.",
    "Prijsvergelijking niet beschikbaar.": "Price comparison unavailable.",
    "Woning kon niet worden gelezen. Herlaad de Funda-pagina na installatie en probeer opnieuw.": "Could not read the home details. Reload the Funda page after installation and try again.",
    "Instellingen konden niet worden geladen.": "Could not load settings.",
    "Opgeslagen. Open advertenties worden direct bijgewerkt.": "Saved. Open listings are updated immediately.",
    "Opslaan mislukt. Vorige instellingen zijn behouden.": "Save failed. Previous settings have been retained.",
    "Instellingen konden niet opnieuw worden geladen. De laatst geladen controles worden gebruikt.": "Could not reload settings. The last loaded controls are being used.",
    "Instellingen konden niet worden geladen. Standaardcontroles zijn actief; open het extensie-icoon om opnieuw te proberen.": "Could not load settings. Default controls are active; open the extension icon to try again.",
    "Woonoppervlakte ontbreekt of is ongeldig.": "Living area is missing or invalid.",
    "Gemiddelde buurtvraagprijs per m² ontbreekt of is ongeldig.": "Average neighborhood asking price per m² is missing or invalid.",
    "Energielabel ontbreekt: energiecorrectie niet toegepast.": "Energy label is missing: energy adjustment not applied.",
    "Tuinoppervlakte of bruikbare perceelgegevens ontbreken: tuincorrectie niet toegepast.": "Garden area or usable plot details are missing: garden adjustment not applied.",
    "Aantal woonlagen ontbreekt; 2,5 woonlagen aangenomen.": "Residential floor count is missing; 2.5 floors assumed.",
    "Vraagprijs ontbreekt: prijsvergelijking niet beschikbaar.": "Asking price is missing: price comparison unavailable.",
    "De berekende waarde is niet positief of ongeldig; dit model is niet bruikbaar voor deze invoer.": "The calculated value is nonpositive or invalid; this model cannot be used for these inputs."
  });

  function detectLanguage(uiLanguage) {
    return /^nl(?:-|$)/i.test(uiLanguage ?? "") ? "nl" : "en";
  }
  const api = root.browser ?? root.chrome;
  const language = detectLanguage(api?.i18n?.getUILanguage?.() ?? root.navigator?.language);
  const locale = language === "nl" ? "nl-NL" : "en-GB";
  function translate(text, parameters = {}) {
    const translated = language === "en" && Object.hasOwn(english, text) ? english[text] : text;
    return translated.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(parameters, key) ? String(parameters[key]) : match);
  }
  function localizeDocument(document) {
    document.documentElement.lang = language;
    const visit = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (Object.hasOwn(english, text)) {
          node.textContent = node.textContent.replace(text, translate(text));
        }
      } else if (!["SCRIPT", "STYLE"].includes(node.tagName)) {
        for (const child of node.childNodes ?? []) visit(child);
      }
    };
    visit(document.documentElement);
  }
  const money = (value) => new Intl.NumberFormat(locale, {
    style: "currency", currency: "EUR", maximumFractionDigits: 0
  }).format(value);
  const number = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  root.FundaEstimator = {
    ...root.FundaEstimator, detectLanguage, language, locale, translate, localizeDocument, money, number,
    calculationExplanation: Object.freeze([
      "Basis: woonoppervlakte × gemiddelde buurtvraagprijs per m².",
      "Energielabel: correctie op de basiswaarde. A+++/A++++ +8%, A+/A++ +6%, A +4%, B +2%, C 0%, D −2%, E −4%, F −6%, G −8%.",
      "Tuin: experimentele correctie op basis van opgegeven of geschatte tuinoppervlakte. 55 m² = € 0; 110 m² = +€ 17.000. Kleinere tuinen geven een korting; extra meters tellen minder zwaar mee. Niet toegepast bij appartementen.",
      "Zet de energielabel- en tuincorrectie aan of uit in het controlepaneel via het extensie-icoon.",
      "Dit is een globale schatting, geen taxatie of biedadvies. De uitkomst kan afwijken van de werkelijke waarde. Aan deze waardeindicatie kunnen geen rechten worden ontleend."
    ])
  };
})(globalThis);
