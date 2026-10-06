(async function () {
  "use strict";

  const estimator = globalThis.FundaEstimator;
  const { translate: t, money } = estimator;
  estimator.localizeDocument(document);
  for (const text of estimator.calculationExplanation) {
    const paragraph = document.createElement("p");
    paragraph.textContent = t(text);
    document.getElementById("calculation-details").append(paragraph);
  }
  const energy = document.getElementById("energy-enabled");
  const garden = document.getElementById("garden-enabled");
  const status = document.getElementById("settings-status");
  const retry = document.getElementById("retry");
  const listingStatus = document.getElementById("listing-status");
  const result = document.getElementById("listing-result");
  const refresh = document.getElementById("refresh");
  let saved = null;

  function enableControls(enabled) {
    energy.disabled = !enabled;
    garden.disabled = !enabled;
  }

  async function refreshListing() {
    refresh.disabled = true;
    result.hidden = true;
    listingStatus.hidden = false;
    listingStatus.className = "";
    listingStatus.textContent = t("Woninggegevens laden…");
    try {
      const [tab] = await estimator.api.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !/^https:\/\/(?:www\.)?funda\.nl\//.test(tab.url ?? "")) {
        listingStatus.textContent = t("Open een koopwoning op funda.nl om de waardeindicatie te zien.");
        return;
      }
      const response = await estimator.api.tabs.sendMessage(tab.id, { type: "GET_VALUATION" });
      const snapshot = response?.snapshot;
      if (!snapshot) {
        listingStatus.textContent = t("Deze pagina is geen ondersteunde Funda-koopadvertentie, of wordt nog geladen.");
        return;
      }
      const { listing, valuation } = snapshot;
      const alternative = estimator.huispediaLink(listing.address, tab.url);
      const alternativeLink = document.getElementById("huispedia-link");
      alternativeLink.href = alternative.url;
      alternativeLink.textContent = t(alternative.direct
        ? "Tweede mening op Huispedia" : "Zoek op Huispedia voor een tweede mening");
      document.getElementById("address").textContent = listing.address;
      document.getElementById("estimate").textContent = valuation.available ? money(valuation.total) : t("Onvoldoende gegevens");
      document.getElementById("comparison").textContent = valuation.available && valuation.difference !== null
        ? t("Vraagprijs: {price}. Verschil met de waardeindicatie: {difference}.", {
          price: money(listing.askingPrice), difference: money(valuation.difference)
        })
        : t("Prijsvergelijking niet beschikbaar.");
      const warnings = document.getElementById("warnings");
      warnings.replaceChildren();
      for (const warning of [...valuation.warnings, ...(response.storageError ? [response.storageError] : [])]) {
        const item = document.createElement("li");
        item.textContent = t(warning);
        warnings.append(item);
      }
      listingStatus.hidden = true;
      result.hidden = false;
    } catch (error) {
      console.error("Funda estimator: current listing could not be read", error);
      listingStatus.className = "error";
      listingStatus.textContent = t("Woning kon niet worden gelezen. Herlaad de Funda-pagina na installatie en probeer opnieuw.");
    } finally {
      refresh.disabled = false;
    }
  }

  async function load() {
    enableControls(false);
    retry.hidden = true;
    status.hidden = false;
    status.className = "status";
    status.textContent = t("Instellingen laden…");
    try {
      saved = await estimator.loadSettings();
      energy.checked = saved.energyEnabled;
      garden.checked = saved.gardenEnabled;
      status.className = "status";
      status.textContent = "";
      status.hidden = true;
      enableControls(true);
    } catch (error) {
      console.error("Funda estimator: settings could not be loaded", error);
      status.className = "status error";
      status.hidden = false;
      status.textContent = t("Instellingen konden niet worden geladen.");
      retry.hidden = false;
    }
  }

  async function save() {
    enableControls(false);
    status.hidden = false;
    const next = { energyEnabled: energy.checked, gardenEnabled: garden.checked };
    try {
      await estimator.saveSettings(next);
      saved = next;
      status.className = "status";
      status.textContent = t("Opgeslagen. Open advertenties worden direct bijgewerkt.");
      // Messaging also synchronizes the current page before displaying the result.
      await refreshListing();
    } catch (error) {
      console.error("Funda estimator: settings could not be saved", error);
      energy.checked = saved.energyEnabled;
      garden.checked = saved.gardenEnabled;
      status.className = "status error";
      status.textContent = t("Opslaan mislukt. Vorige instellingen zijn behouden.");
    } finally {
      enableControls(true);
    }
  }

  energy.addEventListener("change", save);
  garden.addEventListener("change", save);
  retry.addEventListener("click", load);
  refresh.addEventListener("click", refreshListing);
  await load();
  await refreshListing();
})();
