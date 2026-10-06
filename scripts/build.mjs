import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import "./generate-icons.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = `${root}extension`;
const manifest = JSON.parse(await readFile(`${source}/manifest.json`, "utf8"));
for (const browser of ["chrome", "firefox"]) {
  const destination = `${root}dist/${browser}`;
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
  const output = structuredClone(manifest);
  if (browser === "chrome") output.minimum_chrome_version = "109";
  if (browser === "firefox") {
    output.browser_specific_settings = {
      gecko: {
        id: "funda-home-value-estimator@extensions.local",
        strict_min_version: "140.0",
        data_collection_permissions: { required: ["none"] }
      }
    };
  }
  await writeFile(`${destination}/manifest.json`, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Built ${browser}: ${destination}`);
}
