import test from "node:test";
import assert from "node:assert/strict";
import { loadEstimator, house, enabled } from "./helpers.mjs";

const { calculateValuation, calculateGarden, energyRates, extractFromText } = loadEstimator();
const gardenAdjustment = (area) => 17000 * Math.log((area + 55) / 110) / Math.log(1.5);

test("conversation house: actual floors, unrounded footprint and rounded final total", () => {
  const value = calculateValuation(house, enabled);
  assert.equal(value.baseValue, 781470);
  assert.equal(value.energyAdjustment, 0);
  assert.equal(value.garden.footprint, 38);
  assert.equal(value.garden.area, 118);
  assert.equal(value.garden.value, gardenAdjustment(118));
  assert.equal(value.total, Math.round(781470 + gardenAdjustment(118)));
  assert.equal(value.difference, 895000 - value.total);
  assert.equal(value.differencePercent, value.difference / value.total * 100);
  assert.equal(value.warnings.length, 0);
});

test("all four control combinations are independent; energy never multiplies garden", () => {
  for (const energyEnabled of [false, true]) {
    for (const gardenEnabled of [false, true]) {
      const value = calculateValuation({ ...house, energyLabel: "A" }, { energyEnabled, gardenEnabled });
      assert.equal(value.total, Math.round(781470 + (energyEnabled ? 31258.8 : 0) + (gardenEnabled ? gardenAdjustment(118) : 0)));
      assert.equal(value.energyAdjustment, energyEnabled ? 31258.8 : 0);
      assert.equal(value.garden !== null, gardenEnabled);
    }
  }
});

test("energy model covers every supported label and preserves C's zero", () => {
  const expected = { "A++++": 0.08, "A+++": 0.08, "A++": 0.06, "A+": 0.06,
    A: 0.04, B: 0.02, C: 0, D: -0.02, E: -0.04, F: -0.06, G: -0.08 };
  assert.deepEqual({ ...energyRates }, expected);
  for (const [label, rate] of Object.entries(expected)) {
    assert.equal(calculateValuation({ ...house, energyLabel: ` ${label.toLowerCase()} ` }, enabled).energyRate, rate);
  }
});

test("all garden sizes use the reference curve, including former tier boundaries", () => {
  for (const area of [0, 99, 100, 101, 299, 300, 301, 1000]) {
    const value = calculateGarden({ ...house, neighborhoodRate: 1000, gardenArea: area });
    assert.equal(value.value, gardenAdjustment(area), `${area} m²`);
    assert.equal(value.source, "listed");
  }
});

test("explicit garden wins over plot estimation", () => {
  const value = calculateValuation({ ...house, gardenArea: 70 }, enabled);
  assert.equal(value.garden.area, 70);
  assert.equal(value.garden.value, gardenAdjustment(70));
  assert.equal(value.total, Math.round(781470 + gardenAdjustment(70)));
  assert.equal(value.warnings.length, 0);
});

test("missing floors explicitly assumes 2.5 and does not round footprint prematurely", () => {
  const value = calculateValuation({ ...house, floors: null }, enabled);
  assert.equal(value.garden.source, "plot-assumed-floors");
  assert.equal(value.garden.area, 110.4);
  assert.equal(value.total, Math.round(781470 + gardenAdjustment(110.4)));
  assert.match(value.warnings.join(" "), /2,5 woonlagen aangenomen/);
});

test("plot smaller than footprint yields zero rather than negative garden", () => {
  const value = calculateGarden({ ...house, plotArea: 10, floors: 1 });
  assert.equal(value.area, 0);
  assert.equal(value.value, gardenAdjustment(0));
});

test("apartments never add garden, even if plot or garden is listed", () => {
  const value = calculateValuation({ ...house, propertyType: "apartment", gardenArea: 80 }, enabled);
  assert.equal(value.garden.source, "apartment");
  assert.equal(value.total, 781470);
});

test("unknown property type must not invent a footprint", () => {
  const value = calculateValuation({ ...house, propertyType: "unknown" }, enabled);
  assert.equal(value.garden, null);
  assert.match(value.warnings.join(" "), /perceelgegevens ontbreken/);
});

test("missing optional inputs warn only when enabled", () => {
  const listing = { ...house, energyLabel: null, plotArea: null };
  const withChecks = calculateValuation(listing, enabled);
  assert.equal(withChecks.total, 781470);
  assert.equal(withChecks.energyRate, null);
  assert.equal(withChecks.warnings.length, 2);
  assert.equal(calculateValuation(listing, { energyEnabled: false, gardenEnabled: false }).warnings.length, 0);
});

test("invalid baseline cannot produce an estimate", () => {
  for (const field of ["livingArea", "neighborhoodRate"]) {
    for (const invalid of [null, undefined, 0, -1, NaN, Infinity, "114"]) {
      const value = calculateValuation({ ...house, [field]: invalid }, enabled);
      assert.equal(value.available, false);
      assert.equal(value.total, undefined);
      assert.ok(value.warnings.length);
    }
  }
});

test("missing asking price still permits valuation but no comparison", () => {
  const value = calculateValuation({ ...house, askingPrice: null }, enabled);
  assert.equal(value.available, true);
  assert.equal(value.difference, null);
  assert.equal(value.differencePercent, null);
  assert.match(value.warnings.join(" "), /Vraagprijs ontbreekt/);
});

test("dimension-only terrace keeps original plot fallback with new reference curve", () => {
  const listing = extractFromText("Vraagprijs\n€ 495.000 kosten koper\nWonen\n98 m²\nPerceel\n115 m²\nAantal woonlagen\n3 woonlagen\nSoort woonhuis\nTussenwoning\nEnergielabel\nB\nGem. vraagprijs / m² € 5.419\nAchtertuin\n6 m diep en 5 m breed\nZijtuin\n10 m²");
  const value = calculateValuation(listing, enabled);
  assert.equal(value.garden.source, "plot");
  assert.equal(value.garden.area, 115 - 98 / 3);
  const adjustment = 17000 * Math.log(((115 - 98 / 3) + 55) / 110) / Math.log(1.5);
  assert.equal(value.garden.model, "garden-reference");
  assert.equal(value.garden.value, adjustment);
  assert.equal(value.total, Math.round(531062 + 10621.24 + adjustment));
  assert.equal(value.warnings.length, 0);
});

test("garden curve matches reference/doubling anchors and remains finite at zero", () => {
  const listing = { ...house, propertySubtype: "terraced" };
  assert.equal(calculateGarden({ ...listing, gardenArea: 55 }).value, 0);
  assert.equal(calculateGarden({ ...listing, gardenArea: 110 }).value, 17000);
  const zero = calculateGarden({ ...listing, gardenArea: 0 });
  assert.equal(zero.value, 17000 * Math.log(0.5) / Math.log(1.5));
  assert.ok(Number.isFinite(zero.value));
  assert.equal(zero.model, "garden-reference");
  assert.equal(zero.referenceArea, 55);
  assert.equal(zero.source, "listed");
});

test("garden curve is increasing, continuous and has diminishing returns", () => {
  const valueAt = (gardenArea) => calculateGarden({ ...house, propertySubtype: "terraced", gardenArea }).value;
  let previous = valueAt(0);
  let previousIncrement = Infinity;
  for (let area = 10; area <= 1000; area += 10) {
    const current = valueAt(area);
    const increment = current - previous;
    assert.ok(increment > 0);
    assert.ok(increment < previousIncrement);
    previous = current;
    previousIncrement = increment;
  }
  for (const area of [55, 100, 110, 300]) {
    assert.ok(Math.abs(valueAt(area + 0.000001) - valueAt(area - 0.000001)) < 0.01);
  }
  assert.ok(valueAt(30) < 0);
  assert.ok(valueAt(83) > 0);
});

test("terraced controls apply discounts independently; no energy multiplication", () => {
  const listing = { ...house, propertySubtype: "terraced", gardenArea: 30, energyLabel: "B" };
  const adjustment = calculateGarden(listing).value;
  for (const energyEnabled of [false, true]) {
    for (const gardenEnabled of [false, true]) {
      const value = calculateValuation(listing, { energyEnabled, gardenEnabled });
      assert.equal(value.total, Math.round(781470 + (energyEnabled ? 15629.4 : 0) + (gardenEnabled ? adjustment : 0)));
      assert.equal(value.garden?.value ?? 0, gardenEnabled ? adjustment : 0);
    }
  }
});

test("all house subtypes use the curve; apartments remain excluded", () => {
  for (const propertySubtype of [null, undefined, "terraced", "detached", "corner", "semi-detached"]) {
    const garden = calculateGarden({ ...house, propertySubtype, gardenArea: 110 });
    assert.equal(garden.value, 17000);
    assert.equal(garden.model, "garden-reference");
  }
  const apartment = calculateGarden({ ...house, propertyType: "apartment", propertySubtype: "terraced", gardenArea: 110 });
  assert.equal(apartment.value, 0);
  assert.equal(apartment.source, "apartment");
  const terrace = { ...house, propertySubtype: "terraced", gardenArea: 110 };
  assert.equal(calculateGarden({ ...terrace, neighborhoodRate: 1000 }).value, 17000);
  const missing = calculateValuation({ ...terrace, gardenArea: null, plotArea: null }, enabled);
  assert.equal(missing.garden, null);
  assert.match(missing.warnings.join(" "), /perceelgegevens ontbreken/);
});

test("Simplonbaan corner house uses listed garden and modest reference adjustment", () => {
  const listing = extractFromText("Soort woonhuis\nEengezinswoning, hoekwoning\nWonen\n137 m²\nPerceel\n212 m²\nAantal woonlagen\n4 woonlagen\nEnergielabel\nB\nAchtertuin\n115 m²\nVraagprijs\n€ 700.000\nGem. vraagprijs / m² € 5.419");
  const value = calculateValuation(listing, enabled);
  assert.equal(value.garden.source, "listed");
  assert.equal(value.garden.area, 115);
  assert.equal(value.garden.value, gardenAdjustment(115));
  assert.equal(Math.round(value.garden.value), 18252);
  assert.equal(value.total, 775503);
});

test("garden discounts cannot produce a nonpositive valuation or invalid comparison", () => {
  const value = calculateValuation({ ...house, propertySubtype: "terraced",
    gardenArea: 0, livingArea: 10, neighborhoodRate: 1000 }, enabled);
  assert.equal(value.available, false);
  assert.equal(value.total, undefined);
  assert.equal(value.differencePercent, undefined);
  assert.match(value.warnings.join(" "), /model is niet bruikbaar/);
});
