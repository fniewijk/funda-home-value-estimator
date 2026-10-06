import { mkdir, writeFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { renderIcon } from "./generate-icons.mjs";

const destination = new URL("../store-assets/", import.meta.url);
await mkdir(destination, { recursive: true });
const icons = [
  ["chrome-store-icon-128.png", 128, 12],
  ["firefox-store-icon-64.png", 64, 6],
  ["firefox-store-icon-128.png", 128, 12],
  ["store-icon-256.png", 256, 24],
  ["store-icon-512.png", 512, 48]
];
for (const [name, size, padding] of icons) {
  const image = renderIcon(size, padding);
  if (image.readUInt32BE(16) !== size || image.readUInt32BE(20) !== size || image[25] !== 6) {
    throw new Error(`Invalid PNG dimensions or RGBA format: ${name}`);
  }
  const compressed = [];
  for (let offset = 8; offset < image.length;) {
    const length = image.readUInt32BE(offset);
    if (image.toString("ascii", offset + 4, offset + 8) === "IDAT") {
      compressed.push(image.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }
  const pixels = inflateSync(Buffer.concat(compressed));
  if (pixels.length !== size * (size * 4 + 1)) throw new Error(`Invalid PNG pixel data: ${name}`);
  let visible = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (pixels[y * (size * 4 + 1) + 1 + x * 4 + 3] > 0) {
        visible++;
        if (x < padding || y < padding || x >= size - padding || y >= size - padding) {
          throw new Error(`Artwork exceeds transparent padding: ${name}`);
        }
      }
    }
  }
  if (!visible) throw new Error(`Empty icon: ${name}`);
  await writeFile(new URL(name, destination), image);
  console.log(`Generated and verified ${name}: ${size} × ${size}, transparent RGBA`);
}
