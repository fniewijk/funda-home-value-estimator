(function (root) {
  "use strict";

  function parseDutchNumber(value) {
    if (typeof value !== "string") return null;
    const cleaned = value.replace(/[€\s\u00a0]/g, "");
    if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/.test(cleaned)) return null;
    const number = Number(cleaned.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  const amount = "(\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:,\\d+)?)";
  const areaUnit = "(?:m²|m2|m\\^2)";
  const numberAfter = (text, label, suffix = "") => {
    const match = text.match(new RegExp(`${label}\\s*[:]?\\s*(?:€\\s*)?${amount}\\s*${suffix}`, "i"));
    return match ? parseDutchNumber(match[1]) : null;
  };

  function extractFromText(rawText, title = "") {
    const text = rawText.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ");
    const neighborhoodRate = numberAfter(text, "Gem\\.?\\s*vraagprijs\\s*\\/\\s*m(?:²|2|\\^2)");
    const livingArea = numberAfter(text, "(?:^|\\n)\\s*Wonen", areaUnit)
      ?? parseDutchNumber(text.match(new RegExp(`${amount}\\s*${areaUnit}\\s*wonen`, "i"))?.[1] ?? "");
    const askingPrice = numberAfter(text, "(?:^|\\n)\\s*Vraagprijs(?!\\s*per)")
      ?? parseDutchNumber(text.match(new RegExp(`€\\s*${amount}\\s*(?:k\\.k\\.|v\\.o\\.n\\.|kosten koper|vrij op naam)`, "i"))?.[1] ?? "");
    const plotArea = numberAfter(text, "(?:^|\\n)\\s*Perceel", areaUnit)
      ?? parseDutchNumber(text.match(new RegExp(`${amount}\\s*${areaUnit}\\s*perceel`, "i"))?.[1] ?? "");
    const energyMatch = text.match(/Energielabel\s*[:]?[\s]*([A-G]\+{0,4})(?![A-Za-z+])/i)
      ?? text.match(/(?:^|\s)([A-G]\+{0,4})\s*energielabel/i);
    const typeMatch = text.match(/(?:^|\n)\s*Soort (?:woonhuis|appartement|woning)\s*[:]?[\s]*([^\n]+)/i);
    const propertyType = /(?:Soort appartement|appartement)/i.test(typeMatch?.[0] ?? "")
      ? "apartment"
      : /Soort woonhuis|eengezinswoning|tussenwoning|vrijstaande woning|bungalow/i.test(typeMatch?.[0] ?? "")
        ? "house" : "unknown";
    const floors = numberAfter(text, "(?:^|\\n)\\s*Aantal woonlagen");
    const totalGarden = numberAfter(text, "(?:^|\\n)\\s*(?:Tuinoppervlakte|Tuin oppervlakte)", areaUnit);
    const frontGarden = numberAfter(text, "(?:^|\\n)\\s*Voortuin", areaUnit);
    const backGarden = numberAfter(text, "(?:^|\\n)\\s*Achtertuin", areaUnit);
    const genericGarden = numberAfter(text, "(?:^|\\n)\\s*Tuin", areaUnit);
    const gardenArea = totalGarden ?? genericGarden
      ?? (frontGarden !== null || backGarden !== null ? (frontGarden ?? 0) + (backGarden ?? 0) : null);
    const neighborhood = text.match(/(?:^|\n)\s*Buurt\s*\n\s*([^\n]+)/i)?.[1]?.trim() ?? null;
    return {
      address: title.replace(/\s*\|\s*Funda.*$/i, "").replace(/^Huis te koop:\s*/i, "").trim(),
      neighborhood, livingArea, askingPrice, neighborhoodRate, plotArea, gardenArea,
      floors, energyLabel: root.FundaEstimator.normalizeEnergyLabel(energyMatch?.[1] ?? null), propertyType,
      propertySubtype: propertyType === "house" && /\btussenwoning\b/i.test(typeMatch?.[1] ?? "") ? "terraced" : null
    };
  }

  function extractListing(document) {
    const main = document.querySelector("main") ?? document.body;
    // Pair definition terms explicitly; layout can otherwise join labels and values.
    const facts = [...main.querySelectorAll("dt")].map((term) => {
      const value = term.nextElementSibling;
      return value?.tagName === "DD" ? `${term.textContent.trim()}\n${value.textContent.trim()}` : "";
    }).filter(Boolean).join("\n");
    const heading = document.querySelector("h1");
    const headingParts = [];
    const collectHeadingText = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) headingParts.push(text);
      } else {
        for (const child of node.childNodes ?? []) collectHeadingText(child);
      }
    };
    if (heading) collectHeadingText(heading);
    const title = (headingParts.join(" ") || heading?.textContent || document.title).replace(/\s+/g, " ").trim();
    return extractFromText(`${facts}\n${main.innerText || main.textContent}`, title);
  }

  function isListingUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && /^(?:www\.)?funda\.nl$/.test(parsed.hostname)
        && /^\/(?:detail\/koop\/[^/]+\/[^/]+\/\d+|koop\/[^/]+\/(?:huis|appartement)-\d+[^/]*)\/?$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  root.FundaEstimator = { ...root.FundaEstimator, parseDutchNumber, extractFromText, extractListing, isListingUrl };
})(globalThis);
