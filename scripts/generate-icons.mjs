import { readFile, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const assets = new URL("../extension/assets/", import.meta.url);
const svg = await readFile(new URL("logo.svg", assets), "utf8");
// The logo uses only filled polygons; rasterize that same artwork for Chrome's PNG icons.
const polygons = [...svg.matchAll(/<path fill="(#[\da-f]+)" d="([^"]+)"/gi)].map(([, fill, path]) => {
  const tokens = path.match(/[MLHVZ]|-?\d+(?:\.\d+)?/gi);
  const points = [];
  let x = 0;
  let y = 0;
  let command;
  for (let index = 0; index < tokens.length;) {
    if (/^[A-Z]$/i.test(tokens[index])) command = tokens[index++];
    if (command === "Z") break;
    if (command === "M" || command === "L") {
      x = Number(tokens[index++]);
      y = Number(tokens[index++]);
      command = "L";
    } else if (command === "H") x = Number(tokens[index++]);
    else if (command === "V") y = Number(tokens[index++]);
    else throw new Error(`Unsupported SVG command: ${command}`);
    points.push([x, y]);
  }
  const hex = fill.length === 4 ? fill.slice(1).split("").map((digit) => digit.repeat(2)).join("") : fill.slice(1);
  return { points, color: [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) };
});

function contains(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function chunk(type, data) {
  const content = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of content) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, content, checksum]);
}

export function renderIcon(size, padding = 0) {
  if (!Number.isInteger(size) || size <= 0 || padding < 0 || padding * 2 >= size) {
    throw new Error("Invalid icon size or padding");
  }
  const pixels = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sum = [0, 0, 0];
      let covered = 0;
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          const px = (x + (sx + 0.5) / 4 - padding) * 128 / (size - padding * 2);
          const py = (y + (sy + 0.5) / 4 - padding) * 128 / (size - padding * 2);
          const polygon = polygons.findLast(({ points }) => contains(points, px, py));
          if (!polygon) continue;
          covered++;
          polygon.color.forEach((channel, index) => { sum[index] += channel; });
        }
      }
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      for (let index = 0; index < 3; index++) pixels[offset + index] = covered ? Math.round(sum[index] / covered) : 0;
      pixels[offset + 3] = Math.round(covered / 16 * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))
  ]);
}

for (const size of [16, 32, 48, 128]) {
  await writeFile(new URL(`icon-${size}.png`, assets), renderIcon(size));
}
console.log("Generated house icons at 16, 32, 48 and 128 pixels.");
