(function (root) {
  "use strict";

  const api = root.browser ?? root.chrome;
  const defaults = Object.freeze({ energyEnabled: true, gardenEnabled: true });
  const key = "valuationSettings";

  function normalizeSettings(value) {
    return {
      energyEnabled: typeof value?.energyEnabled === "boolean" ? value.energyEnabled : defaults.energyEnabled,
      gardenEnabled: typeof value?.gardenEnabled === "boolean" ? value.gardenEnabled : defaults.gardenEnabled
    };
  }

  async function loadSettings() {
    const stored = await api.storage.local.get(key);
    return normalizeSettings(stored[key]);
  }

  async function saveSettings(settings) {
    await api.storage.local.set({ [key]: normalizeSettings(settings) });
  }

  root.FundaEstimator = {
    ...root.FundaEstimator, api, defaults, settingsKey: key, normalizeSettings, loadSettings, saveSettings
  };
})(globalThis);
