import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import "./build.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
async function filesIn(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await filesIn(`${directory}/${entry.name}`, `${path}/`));
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Unexpected package entry: ${path}`);
  }
  return files.sort();
}
const files = await filesIn(`${root}extension`);
const checksums = [];
for (const browser of ["chrome", "firefox"]) {
  const directory = `${root}dist/${browser}`;
  run(process.execPath, [`${root}scripts/check.mjs`, directory]);
  const name = `funda-estimator-${browser}.zip`;
  const archive = `${root}dist/${name}`;
  try {
    await unlink(archive);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  run("zip", ["-q", "-X", archive, ...files], directory);
  run("unzip", ["-t", archive]);
  const archivedFiles = run("unzip", ["-Z1", archive]).trim().split("\n").sort();
  if (JSON.stringify(archivedFiles) !== JSON.stringify(files)) throw new Error(`Unexpected archive contents: ${name}`);
  const manifest = JSON.parse(run("unzip", ["-p", archive, "manifest.json"]));
  if (manifest.manifest_version !== 3) throw new Error(`Not Manifest V3: ${name}`);
  if (browser === "firefox" && !manifest.browser_specific_settings?.gecko?.id) {
    throw new Error("Firefox package is missing its stable add-on ID");
  }
  const checksum = createHash("sha256").update(await readFile(archive)).digest("hex");
  checksums.push(`${checksum}  ${name}`);
  console.log(`Verified ${name}: ${files.length} runtime files, version ${manifest.version}`);
}
await writeFile(`${root}dist/SHA256SUMS.txt`, `${checksums.join("\n")}\n`);
