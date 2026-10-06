import { readdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const source = fileURLToPath(new URL("../extension/", import.meta.url));
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await check(path);
    else if (entry.name.endsWith(".js")) new Script(await readFile(path, "utf8"), { filename: path });
  }
}
await check(source);
const manifest = JSON.parse(await readFile(`${source}/manifest.json`, "utf8"));
await Promise.all([
  ...manifest.content_scripts.flatMap((script) => script.js),
  manifest.action.default_popup,
  ...Object.values(manifest.icons),
  ...Object.values(manifest.action.default_icon),
  ...manifest.web_accessible_resources.flatMap((resource) => resource.resources)
].map((path) => access(`${source}/${path}`)));
console.log("Extension JavaScript syntax and manifest paths are valid.");
