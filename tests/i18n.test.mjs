import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { loadEstimator, house, enabled } from "./helpers.mjs";

const source = readFileSync(new URL("../extension/shared/i18n.js", import.meta.url), "utf8");
function localization(uiLanguage, navigatorLanguage = "nl-NL", useChrome = false) {
  const api = uiLanguage === undefined ? {} : { i18n: { getUILanguage: () => uiLanguage } };
  const context = createContext({
    [useChrome ? "chrome" : "browser"]: api, navigator: { language: navigatorLanguage }, Intl
  });
  runInContext(source, context);
  return context.FundaEstimator;
}

test("browser UI language selects Dutch or English and overrides navigator", () => {
  for (const language of ["nl", "nl-NL", "nl-BE", "NL-nl"]) {
    assert.equal(localization(language, "en-US").language, "nl");
  }
  for (const language of ["en", "en-US", "en-GB", "de-DE", "fr", ""]) {
    assert.equal(localization(language).language, "en");
  }
  assert.equal(localization("en-US", "nl-NL", true).language, "en");
  assert.equal(localization(undefined, "nl-BE").language, "nl");
  assert.equal(localization(undefined, "en-US").language, "en");
});

test("translations preserve Dutch, interpolate safely and format by locale", () => {
  const dutch = localization("nl-NL");
  const english = localization("en-GB");
  assert.equal(dutch.translate("Tuincorrectie"), "Tuincorrectie");
  assert.equal(english.translate("Tuincorrectie"), "Garden adjustment");
  assert.equal(english.translate("Energielabel {label}", { label: "B" }), "Energy label B");
  assert.equal(english.translate("Vraagprijs {amount} ({percent}%) onder de waardeindicatie.",
    { amount: "€10,000", percent: "1.5" }), "Asking price is €10,000 (1.5%) below the value estimate.");
  assert.equal(english.translate("Vraagprijs gelijk aan de waardeindicatie."), "Asking price equals the value estimate.");
  assert.equal(english.translate("Simplonbaan 45"), "Simplonbaan 45");
  assert.equal(dutch.number(1234.5), "1.234,5");
  assert.equal(english.number(1234.5), "1,234.5");
  assert.equal(dutch.money(775503).replace(/\u00a0/g, " "), "€ 775.503");
  assert.equal(english.money(775503), "€775,503");
});

test("every static popup text has an English translation", () => {
  const { translate } = localization("en");
  const html = readFileSync(new URL("../extension/popup/popup.html", import.meta.url), "utf8");
  for (const match of html.matchAll(/>([^<>]+)</g)) {
    const text = match[1].trim();
    if (!text || text === "FUNDA HOME VALUE ESTIMATOR") continue;
    assert.notEqual(translate(text), text, `Missing English popup text: ${text}`);
  }
});

test("all model warnings and storage errors are translated", () => {
  const { translate } = localization("en");
  const { calculateValuation } = loadEstimator();
  const warnings = [
    ...calculateValuation({ ...house, livingArea: null, neighborhoodRate: null }, enabled).warnings,
    ...calculateValuation({ ...house, energyLabel: null, plotArea: null, askingPrice: null }, enabled).warnings,
    ...calculateValuation({ ...house, floors: null }, enabled).warnings,
    ...calculateValuation({ ...house, livingArea: 10, neighborhoodRate: 1000, gardenArea: 0 }, enabled).warnings
  ];
  for (const warning of warnings) assert.notEqual(translate(warning), warning);
  for (const file of ["content/content.js", "popup/popup.js"]) {
    const code = readFileSync(new URL(`../extension/${file}`, import.meta.url), "utf8");
    for (const match of code.matchAll(/(?:storageError|(?:listingStatus|status)\.textContent) = (?:t\()?"([^"]+)"/g)) {
      if (match[1]) assert.notEqual(translate(match[1]), match[1]);
    }
  }
});

test("document localization preserves inline spacing and skips scripts and styles", () => {
  const { localizeDocument } = localization("en");
  const text = { nodeType: 3, textContent: " Tuincorrectie " };
  const scriptText = { nodeType: 3, textContent: "Tuincorrectie" };
  const styleText = { nodeType: 3, textContent: "Tuincorrectie" };
  const document = { documentElement: { childNodes: [
    text, { tagName: "SCRIPT", childNodes: [scriptText] },
    { tagName: "STYLE", childNodes: [styleText] }
  ] } };
  localizeDocument(document);
  assert.equal(document.documentElement.lang, "en");
  assert.equal(text.textContent, " Garden adjustment ");
  assert.equal(scriptText.textContent, "Tuincorrectie");
  assert.equal(styleText.textContent, "Tuincorrectie");
});

test("both manifest locales contain all referenced metadata messages", () => {
  const manifest = readFileSync(new URL("../extension/manifest.json", import.meta.url), "utf8");
  assert.equal(JSON.parse(manifest).default_locale, "en");
  for (const locale of ["en", "nl"]) {
    const messages = JSON.parse(readFileSync(new URL(`../extension/_locales/${locale}/messages.json`, import.meta.url), "utf8"));
    for (const match of manifest.matchAll(/__MSG_(\w+)__/g)) {
      assert.ok(messages[match[1]]?.message, `${locale}: ${match[1]}`);
    }
  }
});

test("shared concise explanation is complete in Dutch and English", () => {
  const dutch = localization("nl");
  const english = localization("en");
  assert.equal(dutch.calculationExplanation.length, 5);
  for (const paragraph of dutch.calculationExplanation) {
    assert.equal(dutch.translate(paragraph), paragraph);
    assert.notEqual(english.translate(paragraph), paragraph);
  }
  assert.match(dutch.calculationExplanation.join(" "), /geen rechten worden ontleend/);
  assert.match(english.calculationExplanation.map(english.translate).join(" "), /No rights may be derived/);
});
