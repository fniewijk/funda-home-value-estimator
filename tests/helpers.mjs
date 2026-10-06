import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

export function loadEstimator(browser = {}) {
  const context = createContext({ browser, URL, console, Intl });
  for (const file of ["shared/i18n.js", "shared/links.js", "shared/model.js", "shared/settings.js", "content/extractor.js"]) {
    runInContext(readFileSync(new URL(`../extension/${file}`, import.meta.url), "utf8"), context);
  }
  return context.FundaEstimator;
}

export const house = {
  livingArea: 114, neighborhoodRate: 6855, askingPrice: 895000,
  energyLabel: "C", plotArea: 156, gardenArea: null, floors: 3, propertyType: "house"
};
export const enabled = { energyEnabled: true, gardenEnabled: true };
