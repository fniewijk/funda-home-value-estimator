import { readdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { resolve } from "node:path";

const source = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL("../extension/", import.meta.url));
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
if (manifest.default_locale) {
  const defaultMessages = JSON.parse(await readFile(`${source}/_locales/${manifest.default_locale}/messages.json`, "utf8"));
  const messageNames = [...JSON.stringify(manifest).matchAll(/__MSG_(\w+)__/g)].map((match) => match[1]);
  for (const locale of await readdir(`${source}/_locales`)) {
    const messages = JSON.parse(await readFile(`${source}/_locales/${locale}/messages.json`, "utf8"));
    for (const name of messageNames) {
      if (!(messages[name] ?? defaultMessages[name])?.message) throw new Error(`Missing ${locale} manifest message: ${name}`);
    }
  }
}
console.log("Extension JavaScript syntax and manifest paths are valid.");
