(function (root) {
  "use strict";

  const { money, number, translate: t } = root.FundaEstimator;
  const stylesheet = `
    :host { all: initial; font: 14px/1.5 system-ui, sans-serif; color: #6A281C; }
    * { box-sizing: border-box; }
    aside { width: min(390px, calc(100vw - 24px)); max-height: 78vh; overflow: auto;
      background: #fff; border: 1px solid #64C1ED; border-radius: 16px;
      box-shadow: 0 8px 36px #6a281c30; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 12px;
      background: #6A281C; color: #fff; padding: 14px 18px; border-bottom: 4px solid #64C1ED; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .logo { width: 32px; height: 32px; padding: 3px; background: #fff; border-radius: 7px; }
    h2 { font-size: 16px; margin: 0; } button { font: inherit; cursor: pointer; }
    header button { border: 1px solid #64C1ED; background: #64C1ED; color: #6A281C; border-radius: 6px; }
    :focus-visible { outline: 3px solid #6A281C; outline-offset: 3px; }
    header :focus-visible { outline-color: #fff; }
    .body { padding: 16px 18px; } p { margin: 0 0 12px; }
    .address { font-weight: 600; } .total { font-size: 30px; font-weight: 750; color: #6A281C; }
    .eyebrow { font-size: 12px; color: #6A281C; margin-bottom: 0; }
    dl { margin: 12px 0; } .row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0;
      border-bottom: 1px solid #c6e8f8; } dt { color: #6A281C; } dd { margin: 0; text-align: right; }
    .note { font-size: 12px; color: #6A281C; } ul { padding-left: 18px; font-size: 12px; }
    .warning { color: #784500; background: #fff6de; padding: 8px 12px; border-radius: 6px; }
    .comparison { padding: 10px; background: #eff9fd; border-left: 3px solid #64C1ED; border-radius: 8px; }
    details { margin-top: 12px; } summary { cursor: pointer; } [hidden] { display: none; }
  `;

  function renderPanel(host, listing, valuation, settings, storageError) {
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const collapsed = shadow.querySelector(".body")?.hidden ?? false;
    shadow.replaceChildren();
    const element = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = t(text);
      if (className) node.className = className;
      return node;
    };
    const style = element("style", stylesheet);
    const aside = element("aside");
    aside.lang = root.FundaEstimator.language;
    aside.setAttribute("aria-label", t("Funda woningwaarde"));
    const header = element("header");
    const brand = element("div", undefined, "brand");
    const logo = element("img", undefined, "logo");
    logo.src = root.FundaEstimator.api.runtime.getURL("assets/logo.svg");
    logo.alt = "";
    logo.width = 32;
    logo.height = 32;
    brand.append(logo, element("h2", "Woningwaarde-check"));
    header.append(brand);
    const toggle = element("button", collapsed ? "Toon" : "Verberg");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(!collapsed));
    const body = element("div", undefined, "body");
    body.hidden = collapsed;
    toggle.addEventListener("click", () => {
      body.hidden = !body.hidden;
      toggle.textContent = t(body.hidden ? "Toon" : "Verberg");
      toggle.setAttribute("aria-expanded", String(!body.hidden));
    });
    header.append(toggle);
    body.append(element("p", listing.address || "Funda koopwoning", "address"));
    if (storageError) body.append(element("p", storageError, "warning"));
    if (valuation.available) {
      body.append(element("p", "Waardeindicatie", "eyebrow"));
      const total = element("p", money(valuation.total), "total");
      total.setAttribute("aria-live", "polite");
      body.append(total);
      const rows = element("dl");
      const row = (label, value) => {
        const wrapper = element("div", undefined, "row");
        wrapper.append(element("dt", label), element("dd", value));
        rows.append(wrapper);
      };
      row("Wonen", `${number(listing.livingArea)} m²`);
      row("Buurtgemiddelde", `${money(listing.neighborhoodRate)} / m²`);
      row("Basiswaarde", money(valuation.baseValue));
      row(t("Energielabel {label}", { label: listing.energyLabel ?? t("onbekend") }), !settings.energyEnabled ? "Uitgeschakeld"
        : valuation.energyRate === null ? "Niet toegepast" : `${money(valuation.energyAdjustment)} (${number(valuation.energyRate * 100)}%)`);
      row("Tuincorrectie", !settings.gardenEnabled ? "Uitgeschakeld"
        : valuation.garden === null ? "Niet toegepast" : `${money(valuation.garden.value)} (${number(valuation.garden.area)} m²)`);
      if (listing.askingPrice) row("Vraagprijs", money(listing.askingPrice));
      body.append(rows);
      if (valuation.difference !== null) {
        body.append(element("p", valuation.difference === 0 ? "Vraagprijs gelijk aan de waardeindicatie."
          : t(valuation.difference > 0
            ? "Vraagprijs {amount} ({percent}%) boven de waardeindicatie."
            : "Vraagprijs {amount} ({percent}%) onder de waardeindicatie.", {
            amount: money(Math.abs(valuation.difference)), percent: number(Math.abs(valuation.differencePercent))
          }), "comparison"));
      }
    } else {
      body.append(element("p", "Nog geen schatting mogelijk. Open de kenmerken en buurtinformatie; Funda kan deze gegevens later laden.", "warning"));
    }
    if (valuation.warnings.length) {
      const list = element("ul", undefined, "warning");
      valuation.warnings.forEach((warning) => list.append(element("li", warning)));
      body.append(list);
    }
    const alternative = root.FundaEstimator.huispediaLink(listing.address, root.location.href);
    const alternativeLink = element("a", alternative.direct
      ? "Tweede mening op Huispedia" : "Zoek op Huispedia voor een tweede mening");
    alternativeLink.href = alternative.url;
    alternativeLink.target = "_blank";
    alternativeLink.rel = "noopener noreferrer";
    const alternativeParagraph = element("p", undefined, "note");
    alternativeParagraph.append(alternativeLink);
    body.append(alternativeParagraph);
    const details = element("details");
    details.append(element("summary", "Hoe wordt dit berekend"));
    for (const text of root.FundaEstimator.calculationExplanation) {
      details.append(element("p", text, "note"));
    }
    body.append(details);
    aside.append(header, body);
    shadow.append(style, aside);
  }

  root.FundaEstimator = { ...root.FundaEstimator, renderPanel };
})(globalThis);
