import test from "node:test";
import assert from "node:assert/strict";
import { loadEstimator } from "./helpers.mjs";

const { parseDutchNumber, extractFromText, extractListing, isListingUrl } = loadEstimator();
const text = `
Vraagprijs
€ 895.000 kosten koper
Vraagprijs per m²
€ 7.851
Soort woonhuis
Eengezinswoning, tussenwoning
Wonen
114 m²
Perceel
156 m²
Aantal woonlagen
3 woonlagen
Energielabel
C
Buurt
Tuindorp en Van Lieflandlaan-West
Gem. vraagprijs / m² € 6.855
`;

test("Dutch amounts accept grouped thousands and comma decimals", () => {
  for (const [input, output] of [["€ 6.855", 6855], ["114", 114], ["110,4", 110.4],
    ["1.095.000", 1095000], ["6.855,50", 6855.5], ["6\u00a0855", 6855]]) {
    assert.equal(parseDutchNumber(input), output);
  }
  for (const input of ["", "unknown", "1.2.3", "-40", "NaN", "6.85", null]) {
    assert.equal(parseDutchNumber(input), null);
  }
});

test("extracts conversation fields without confusing neighborhood and listing rates", () => {
  const listing = extractFromText(text, "Huis te koop: Prof. Wentlaan 54 | Funda");
  assert.equal(listing.address, "Prof. Wentlaan 54");
  assert.equal(listing.livingArea, 114);
  assert.equal(listing.plotArea, 156);
  assert.equal(listing.floors, 3);
  assert.equal(listing.energyLabel, "C");
  assert.equal(listing.askingPrice, 895000);
  assert.equal(listing.neighborhoodRate, 6855);
  assert.equal(listing.propertyType, "house");
  assert.equal(listing.propertySubtype, "terraced");
  assert.equal(listing.gardenArea, null);
  assert.equal(listing.neighborhood, "Tuindorp en Van Lieflandlaan-West");
});

test("missing neighborhood never substitutes listing price per m²", () => {
  const listing = extractFromText(text.replace(/Gem\. vraagprijs \/ m² € 6.855/, ""));
  assert.equal(listing.neighborhoodRate, null);
  assert.equal(listing.askingPrice, 895000);
});

test("reads compact summary area, energy label and asking price", () => {
  const listing = extractFromText("€ 450.000 k.k.\n79 m²wonen 100 m²perceel A+++energielabel\nGem. vraagprijs / m² € 5.419");
  assert.equal(listing.livingArea, 79);
  assert.equal(listing.plotArea, 100);
  assert.equal(listing.energyLabel, "A+++");
  assert.equal(listing.neighborhoodRate, 5419);
  assert.equal(listing.askingPrice, 450000);
});

test("apartments and unknown types are distinguished without guessing from title", () => {
  assert.equal(extractFromText("Soort appartement\nBovenwoning", "Huis te koop: test").propertyType, "apartment");
  assert.equal(extractFromText("Wonen\n79 m²", "Huis te koop: test").propertyType, "unknown");
});

test("terraced subtype comes only from the structured house-type field", () => {
  assert.equal(extractFromText("Soort woonhuis\nEengezinswoning, tussenwoning").propertySubtype, "terraced");
  assert.equal(extractFromText("Soort woning\nTussenwoning").propertySubtype, "terraced");
  for (const text of ["Soort woonhuis\nEengezinswoning, hoekwoning",
    "Soort woonhuis\nVrijstaande woning\nOmschrijving\nEen tussenwoning.",
    "Soort appartement\nBenedenwoning, tussenwoning", "Een tussenwoning met tuin.",
    "Soort woonhuis\nEengezinswoning"]) {
    assert.equal(extractFromText(text, "Tussenwoning te koop").propertySubtype, null, text);
  }
});

test("garden features summed; total overrides parts; description is not a measurement", () => {
  assert.equal(extractFromText("Voortuin\n20 m²\nAchtertuin\n70 m²").gardenArea, 90);
  assert.equal(extractFromText("Tuinoppervlakte\n110 m²\nAchtertuin\n70 m²").gardenArea, 110);
  assert.equal(extractFromText("Tuin\n0 m²").gardenArea, 0);
  assert.equal(extractFromText("Een diepe achtertuin (ca. 70 m²) en 13 meter lang.").gardenArea, null);
});

test("definition list adapter preserves label/value boundaries", () => {
  const entries = [["Wonen", "114 m²"], ["Soort woonhuis", "Tussenwoning"],
    ["Vraagprijs", "€ 895.000 kosten koper"], ["Energielabel", "A++"]];
  const document = {
    title: "Fallback title",
    body: null,
    querySelector(selector) {
      if (selector === "h1") return { textContent: "Prof. Wentlaan 54" };
      if (selector === "main") return {
        innerText: "Gem. vraagprijs / m² € 6.855",
        querySelectorAll: () => entries.map(([key, value]) => ({
          textContent: key, nextElementSibling: { tagName: "DD", textContent: value }
        }))
      };
      return null;
    }
  };
  const listing = extractListing(document);
  assert.equal(listing.livingArea, 114);
  assert.equal(listing.energyLabel, "A++");
  assert.equal(listing.propertyType, "house");
  assert.equal(listing.propertySubtype, "terraced");
  assert.equal(listing.neighborhoodRate, 6855);
});

test("heading separates nested street, postcode, city and neighborhood text", () => {
  const textNode = (textContent) => ({ nodeType: 3, textContent });
  const heading = {
    textContent: "Simplonbaan 453524 GB UtrechtLunetten-Zuid",
    childNodes: [
      { childNodes: [textNode("Simplonbaan 45")] },
      { childNodes: [textNode("3524 GB Utrecht"), { childNodes: [textNode("Lunetten-Zuid")] }] }
    ]
  };
  const main = { innerText: text, querySelectorAll: () => [] };
  const document = {
    title: "Fallback",
    querySelector: (selector) => selector === "h1" ? heading : selector === "main" ? main : null
  };
  assert.equal(extractListing(document).address, "Simplonbaan 45 3524 GB Utrecht Lunetten-Zuid");
  heading.childNodes = [textNode("  Prof. Wentlaan 54 \n 3524 GB Utrecht  ")];
  assert.equal(extractListing(document).address, "Prof. Wentlaan 54 3524 GB Utrecht");
});

test("restored garden extraction ignores depth and width measurements", () => {
  for (const value of [
    "Achtertuin\n6,40 meter diep en 15,00 meter breed",
    "Achtertuin\n15,00 m breed en 6,40 m diep",
    "Achtertuin\n6,40 m × 15,00 m",
    "Achtertuin\n6,40 meter x 15,00 meter"
  ]) {
    const listing = extractFromText(value);
    assert.equal(listing.gardenArea, null);
  }
});

test("listed area wins over dimensions and repeated DOM facts are not doubled", () => {
  const facts = "Achtertuin\n96 m² (6,40 meter diep en 15,00 meter breed)\nVoortuin\n20 m²\nZijtuin\n10 m²";
  const listing = extractFromText(`${facts}\n${facts}`);
  assert.equal(listing.gardenArea, 116);
  assert.equal(extractFromText("Achtertuin\n95 m² (6,40 meter diep en 15,00 meter breed)").gardenArea, 95);
});

test("valid later fields replace missing ones; explicit area supersedes dimensions", () => {
  assert.equal(extractFromText("Achtertuin\nOnbekend\nAchtertuin\n96 m²").gardenArea, 96);
  const listing = extractFromText("Achtertuin\n6 m diep en 15 m breed\nAchtertuin\n96 m²");
  assert.equal(listing.gardenArea, 96);
});

test("restored extraction ignores side and surrounding gardens; totals still win", () => {
  assert.equal(extractFromText("Zijtuin\n10 m²").gardenArea, null);
  assert.equal(extractFromText("Tuin rondom\n150 m²\nAchtertuin\n70 m²").gardenArea, 70);
  assert.equal(extractFromText("Tuinoppervlakte\n160 m²\nTuin rondom\n150 m²\nZijtuin\n10 m²").gardenArea, 160);
});

test("incomplete or invalid dimensions never invent garden area", () => {
  for (const value of ["Achtertuin\n13 meter diep", "Achtertuin\n0 m diep en 15 m breed",
    "Achtertuin\n-6 m diep en 15 m breed", "Balkon\n6 m diep en 15 m breed",
    "Een achtertuin van 6 m diep en 15 m breed.", "Tuinligging\n6 m diep en 15 m breed"]) {
    assert.equal(extractFromText(value).gardenArea, null, value);
  }
  const partial = extractFromText("Voortuin\nOnbekend\nAchtertuin\n96 m²");
  assert.equal(partial.gardenArea, 96);
});

test("supports current and legacy purchase details, excludes search/rent/other hosts", () => {
  for (const url of [
    "https://www.funda.nl/detail/koop/utrecht/huis-prof-wentlaan-54/12345678/",
    "https://www.funda.nl/koop/utrecht/huis-12345-prof-wentlaan-54/",
    "https://funda.nl/detail/koop/utrecht/appartement-test/1234/?origin=search"
  ]) assert.equal(isListingUrl(url), true, url);
  for (const url of [
    "https://www.funda.nl/zoeken/koop?selected_area=utrecht",
    "https://www.funda.nl/koop/utrecht/",
    "https://www.funda.nl/detail/huur/utrecht/huis-test/1234/",
    "https://www.funda.nl/",
    "https://funda.nl.evil.test/detail/koop/utrecht/huis-test/1234/",
    "not-a-url"
  ]) assert.equal(isListingUrl(url), false, url);
});
