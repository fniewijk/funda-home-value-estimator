import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = await mkdtemp(join(tmpdir(), "estimator-store-images-"));
const temporaryImage = join(profile, "capture.png");
const images = [
  ...["nl", "en"].flatMap(language => ["valuation", "controls"].map(screen => ({
    name: `screenshot-${screen}-${language}.jpg`,
    width: 1280, height: 800,
    url: new URL(`../store-assets/capture.html?screen=${screen}&lang=${language}`, import.meta.url).href,
  }))),
  ...[{ width: 440, height: 280, name: "promo-small-440x280.jpg" },
    { width: 1400, height: 560, name: "promo-marquee-1400x560.jpg" }].map(image => ({
    ...image, url: new URL(`../store-assets/promo.html${image.width === 440 ? "?size=small" : ""}`, import.meta.url).href,
  })),
];

try {
  for (const image of images) {
    const child = spawn(chrome, [
      "--headless", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
      "--allow-file-access-from-files", "--disable-background-networking", "--disable-sync",
      `--user-data-dir=${profile}`, `--window-size=${image.width},${image.height}`,
      "--force-device-scale-factor=1", "--virtual-time-budget=3000",
      `--screenshot=${temporaryImage}`, image.url,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    let spawnError;
    child.stderr.on("data", data => { stderr += data; });
    child.on("error", error => { spawnError = error; });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 150; attempt++) {
        if (spawnError) throw spawnError;
        try {
          ready = (await stat(temporaryImage)).size > 0;
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        if (ready) break;
        await delay(200);
      }
      if (!ready) throw new Error(`Screenshot failed for ${image.name}: ${stderr}`);
      await delay(300);
    } finally {
      if (child.exitCode === null && child.pid) {
        child.kill("SIGTERM");
        for (let attempt = 0; attempt < 30 && child.exitCode === null && child.signalCode === null; attempt++) {
          await delay(100);
        }
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }
    }
    const output = join(root, "store-assets", image.name);
    const conversion = spawnSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "95",
      temporaryImage, "--out", output], { encoding: "utf8" });
    if (conversion.error) throw conversion.error;
    if (conversion.status !== 0) throw new Error(conversion.stderr);
    const metadata = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", "-g", "hasAlpha", "-g", "space", output], { encoding: "utf8" });
    if (metadata.error) throw metadata.error;
    if (metadata.status !== 0 || !metadata.stdout.includes(`pixelWidth: ${image.width}\n`)
      || !metadata.stdout.includes(`pixelHeight: ${image.height}\n`)
      || !metadata.stdout.includes("hasAlpha: no") || !metadata.stdout.includes("space: RGB")) {
      throw new Error(`Invalid image metadata: ${metadata.stdout}\n${metadata.stderr}`);
    }
    console.log(`Created ${image.name} (${image.width} x ${image.height}, RGB JPEG).`);
    await rm(temporaryImage);
  }
} finally {
  await rm(profile, { recursive: true, force: true });
}
