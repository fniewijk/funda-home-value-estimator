import test from "node:test";
import assert from "node:assert/strict";
import { loadEstimator } from "./helpers.mjs";

const { huispediaLink } = loadEstimator();
const url = "https://www.funda.nl/detail/koop/utrecht/huis-filipijnen-64/44525458/";

test("Huispedia links use the current address, postcode and listing city", () => {
  const link = huispediaLink("Filipijnen 64 3524 JN Utrecht Lunetten-Zuid", url);
  assert.equal(link.url, "https://huispedia.nl/utrecht/3524jn/filipijnen/64");
  assert.equal(link.direct, true);
  assert.equal(huispediaLink("Simplonbaan 45 3524GB Utrecht", url).url,
    "https://huispedia.nl/utrecht/3524gb/simplonbaan/45");
  assert.equal(huispediaLink("Prof. Wentlaan 54 3571 AA Utrecht",
    "https://www.funda.nl/koop/utrecht/huis-12345-test/").url,
    "https://huispedia.nl/utrecht/3571aa/prof-wentlaan/54");
});

test("incomplete, unsupported or unsafe inputs provide an explicit search fallback", () => {
  for (const [address, listingUrl] of [
    ["Filipijnen 64", url], ["Filipijnen 64 A 3524 JN Utrecht", url],
    ["Filipijnen 64 3524 JN Utrecht", "not-a-url"],
    ["Filipijnen 64 3524 JN Utrecht", "https://funda.nl.evil.test/detail/koop/utrecht/huis/1/"],
    ["Filipijnen 64 3524 JN Utrecht", "https://www.funda.nl/zoeken/koop"],
    [null, url], ["Filipijnen 64 3524 JN Utrecht", null]
  ]) {
    const link = huispediaLink(address, listingUrl);
    assert.equal(link.url, "https://huispedia.nl/");
    assert.equal(link.direct, false);
  }
});
