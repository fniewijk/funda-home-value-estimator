(function () {
  "use strict";

  const estimator = globalThis.FundaEstimator;
  let settings = null;
  let storageError = "";
  let host = null;
  let snapshot = null;
  let signature = "";
  let timer = null;
  let previousUrl = location.href;

  function update() {
    timer = null;
    if (!estimator.isListingUrl(location.href)) {
      host?.remove();
      host = null;
      snapshot = null;
      signature = "";
      return;
    }
    if (!settings) return;
    const listing = estimator.extractListing(document);
    const valuation = estimator.calculateValuation(listing, settings);
    snapshot = { listing, valuation, settings };
    const nextSignature = JSON.stringify({ ...snapshot, storageError });
    if (nextSignature === signature && host?.isConnected) return;
    signature = nextSignature;
    if (!host?.isConnected) {
      host = document.createElement("div");
      host.id = "funda-home-value-estimator";
      host.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483646;";
      document.body.append(host);
    }
    estimator.renderPanel(host, listing, valuation, settings, storageError);
  }

  function schedule() {
    if (timer !== null) return;
    timer = setTimeout(update, 250);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(() => {
    if (previousUrl !== location.href) {
      previousUrl = location.href;
      snapshot = null;
      update();
    }
  }, 1000);
  addEventListener("popstate", update);
  estimator.api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[estimator.settingsKey]) return;
    settings = estimator.normalizeSettings(changes[estimator.settingsKey].newValue);
    storageError = "";
    update();
  });
  estimator.api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "GET_VALUATION") return false;
    estimator.loadSettings().then((stored) => {
      settings = stored;
      storageError = "";
      update();
      sendResponse({ snapshot, storageError });
    }).catch((error) => {
      console.error("Funda estimator: settings refresh failed", error);
      storageError = "Instellingen konden niet opnieuw worden geladen. De laatst geladen controles worden gebruikt.";
      update();
      sendResponse({ snapshot, storageError });
    });
    return true;
  });
  estimator.loadSettings().then((stored) => {
    settings = stored;
    update();
  }).catch((error) => {
    console.error("Funda estimator: settings could not be loaded", error);
    settings = estimator.defaults;
    storageError = "Instellingen konden niet worden geladen. Standaardcontroles zijn actief; open het extensie-icoon om opnieuw te proberen.";
    update();
  });
})();
