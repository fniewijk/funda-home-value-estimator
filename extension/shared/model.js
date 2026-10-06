(function (root) {
  "use strict";

  const energyRates = Object.freeze({
    "A++++": 0.08, "A+++": 0.08, "A++": 0.06, "A+": 0.06,
    A: 0.04, B: 0.02, C: 0, D: -0.02, E: -0.04, F: -0.06, G: -0.08
  });
  const positive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
  const nonnegative = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

  function normalizeEnergyLabel(value) {
    if (typeof value !== "string") return null;
    const label = value.trim().toUpperCase();
    return Object.hasOwn(energyRates, label) ? label : null;
  }

  function calculateGarden(listing) {
    if (listing.propertyType === "apartment") {
      return { value: 0, area: 0, source: "apartment", bands: [] };
    }
    let area;
    let source;
    let footprint = null;
    let floors = null;
    if (nonnegative(listing.gardenArea)) {
      area = listing.gardenArea;
      source = "listed";
    } else if (listing.propertyType === "house" && positive(listing.plotArea)) {
      floors = positive(listing.floors) ? listing.floors : 2.5;
      footprint = Math.min(listing.plotArea, listing.livingArea / floors);
      area = Math.max(0, listing.plotArea - footprint);
      source = positive(listing.floors) ? "plot" : "plot-assumed-floors";
    } else {
      return null;
    }
    // Brainbay, 2024-12-18: mean terraced garden 55 m²; doubling adds about EUR 17,000.
    // https://brainbay.nl/nieuwsbericht/de-meerwaarde-van-een-grotere-tuin/
    // Our experimental log curve/55 m² offset makes zero finite and returns diminishing.
    // Applying these terrace anchors to all houses is an unvalidated generalization.
    // Centering the mixed neighborhood baseline at 55 m² is an assumption, not a source finding.
    // The source does not establish garden/no-garden discounts or a Utrecht-specific tariff.
    const referenceArea = 55;
    const doublingValue = 17000;
    const value = doublingValue * Math.log((area + referenceArea) / (2 * referenceArea)) / Math.log(1.5);
    return { area, source, footprint, floors, model: "garden-reference",
      referenceArea, doublingValue, value };
  }

  function calculateValuation(listing, settings) {
    const warnings = [];
    if (!positive(listing.livingArea)) warnings.push("Woonoppervlakte ontbreekt of is ongeldig.");
    if (!positive(listing.neighborhoodRate)) warnings.push("Gemiddelde buurtvraagprijs per m² ontbreekt of is ongeldig.");
    if (warnings.length) return { available: false, warnings };

    const baseValue = listing.livingArea * listing.neighborhoodRate;
    let energyAdjustment = 0;
    let energyRate = null;
    if (settings.energyEnabled) {
      const label = normalizeEnergyLabel(listing.energyLabel);
      if (label === null) {
        warnings.push("Energielabel ontbreekt: energiecorrectie niet toegepast.");
      } else {
        energyRate = energyRates[label];
        energyAdjustment = baseValue * energyRate;
      }
    }
    const garden = settings.gardenEnabled ? calculateGarden(listing) : null;
    if (settings.gardenEnabled && garden === null) {
      warnings.push("Tuinoppervlakte of bruikbare perceelgegevens ontbreken: tuincorrectie niet toegepast.");
    }
    if (garden?.source === "plot-assumed-floors") {
      warnings.push("Aantal woonlagen ontbreekt; 2,5 woonlagen aangenomen.");
    }
    if (!positive(listing.askingPrice)) warnings.push("Vraagprijs ontbreekt: prijsvergelijking niet beschikbaar.");
    const total = Math.round(baseValue + energyAdjustment + (garden?.value ?? 0));
    if (!positive(total)) {
      warnings.push("De berekende waarde is niet positief of ongeldig; dit model is niet bruikbaar voor deze invoer.");
      return { available: false, warnings };
    }
    const difference = positive(listing.askingPrice) ? listing.askingPrice - total : null;
    return {
      available: true, baseValue, energyRate, energyAdjustment, garden, total,
      difference,
      differencePercent: difference === null ? null : difference / total * 100,
      warnings
    };
  }

  root.FundaEstimator = {
    ...root.FundaEstimator, energyRates, normalizeEnergyLabel, calculateGarden, calculateValuation
  };
})(globalThis);
