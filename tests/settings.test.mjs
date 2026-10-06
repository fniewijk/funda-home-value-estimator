import test from "node:test";
import assert from "node:assert/strict";
import { loadEstimator } from "./helpers.mjs";

test("defaults enable checks; stored false values survive normalization and reload", async () => {
  const store = {};
  const estimator = loadEstimator({
    storage: { local: {
      get: async () => store,
      set: async (value) => Object.assign(store, value)
    } }
  });
  assert.deepEqual({ ...await estimator.loadSettings() }, { energyEnabled: true, gardenEnabled: true });
  await estimator.saveSettings({ energyEnabled: false, gardenEnabled: true });
  assert.deepEqual({ ...await estimator.loadSettings() }, { energyEnabled: false, gardenEnabled: true });
  await estimator.saveSettings({ energyEnabled: true, gardenEnabled: false });
  assert.deepEqual({ ...await estimator.loadSettings() }, { energyEnabled: true, gardenEnabled: false });
  assert.deepEqual({ ...estimator.normalizeSettings({ energyEnabled: "false", gardenEnabled: null }) },
    { energyEnabled: true, gardenEnabled: true });
});

test("storage errors propagate, rather than report success", async () => {
  const estimator = loadEstimator({
    storage: { local: {
      get: async () => { throw new Error("read failed"); },
      set: async () => { throw new Error("write failed"); }
    } }
  });
  await assert.rejects(estimator.loadSettings(), /read failed/);
  await assert.rejects(estimator.saveSettings({ energyEnabled: false, gardenEnabled: false }), /write failed/);
});
