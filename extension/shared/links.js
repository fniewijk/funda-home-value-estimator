(function (root) {
  "use strict";

  function huispediaLink(address, listingUrl) {
    const fallback = { url: "https://huispedia.nl/", direct: false };
    if (typeof address !== "string" || typeof listingUrl !== "string") return fallback;
    let parsed;
    try {
      parsed = new URL(listingUrl);
    } catch {
      return fallback;
    }
    if (parsed.protocol !== "https:" || !/^(?:www\.)?funda\.nl$/.test(parsed.hostname)) return fallback;
    const city = parsed.pathname.match(/^\/(?:detail\/koop|koop)\/([^/]+)\//i)?.[1];
    const match = address.match(/^(.+?)\s+(\d+)\s+([1-9]\d{3})\s*([a-z]{2})\b/i);
    if (!city || !match) return fallback;
    const street = match[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!street) return fallback;
    return {
      url: `https://huispedia.nl/${city}/${match[3]}${match[4].toLowerCase()}/${street}/${match[2]}`,
      direct: true
    };
  }

  root.FundaEstimator = { ...root.FundaEstimator, huispediaLink };
})(globalThis);
