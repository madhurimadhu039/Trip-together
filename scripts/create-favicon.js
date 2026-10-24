import fs from 'fs';
import path from 'path';

function createIconBuffer(size) {
  // New Trip Together Logo:
  // - Rounded squircle background with gradient from #0F2F44 (Oceanic Slate) to #0D9488 (Teal) to #10B981 (Emerald)
  // - Stylized location pin and journey waypoint star in amber/white
  const pixels = [];

  const radius = size * 0.24;
  const cx = size / 2;
  const cy = size / 2;

  // Colors [B, G, R]
  const deepOcean = [68, 47, 15];   // #0F2F44
  const teal = [136, 148, 13];      // #0D9488
  const emerald = [129, 185, 16];   // #10B981
  const amber = [36, 191, 251];     // #FBBF24
  const white = [255, 255, 255];    // #FFFFFF

  for (let dibY = 0; dibY < size; dibY++) {
    const svgY = (size - 1) - dibY;
    const row = [];

    for (let svgX = 0; svgX < size; svgX++) {
      const dx = Math.max(0, Math.abs(svgX + 0.5 - cx) - (cx - radius));
      const dy = Math.max(0, Math.abs(svgY + 0.5 - cy) - (cy - radius));
      const distFromCorner = Math.sqrt(dx * dx + dy * dy);

      if (distFromCorner > radius) {
        row.push(0, 0, 0, 0);
        continue;
      }

      // Background gradient
      const t = (svgX + svgY) / (2 * size);
      let b, g, r;
      if (t < 0.5) {
        const factor = t / 0.5;
        b = Math.round(deepOcean[0] + factor * (teal[0] - deepOcean[0]));
        g = Math.round(deepOcean[1] + factor * (teal[1] - deepOcean[1]));
        r = Math.round(deepOcean[2] + factor * (teal[2] - deepOcean[2]));
      } else {
        const factor = (t - 0.5) / 0.5;
        b = Math.round(teal[0] + factor * (emerald[0] - teal[0]));
        g = Math.round(teal[1] + factor * (emerald[1] - teal[1]));
        r = Math.round(teal[2] + factor * (emerald[2] - teal[2]));
      }
      let a = 255;

      if (distFromCorner > radius - 1) {
        const edgeAlpha = Math.max(0, Math.min(1, radius - distFromCorner));
        a = Math.round(edgeAlpha * 255);
      }

      const nx = svgX / size;
      const ny = svgY / size;

      // Pin head circle: center (0.5, 0.42), radius 0.24, inner radius 0.16
      const headDist = Math.hypot(nx - 0.5, ny - 0.42);
      if (headDist <= 0.25 && headDist >= 0.15) {
        b = white[0];
        g = white[1];
        r = white[2];
      }

      // Pin base triangle point down to (0.5, 0.82)
      if (ny >= 0.42 && ny <= 0.82) {
        const prog = (ny - 0.42) / (0.82 - 0.42);
        const halfW = (1 - prog) * 0.25;
        const innerHalfW = Math.max(0, (1 - prog) * 0.15);
        const curDistX = Math.abs(nx - 0.5);
        if (curDistX <= halfW && curDistX >= innerHalfW) {
          b = white[0];
          g = white[1];
          r = white[2];
        }
      }

      // Pin center dot (Golden Waypoint) at (0.5, 0.42), radius 0.08
      if (headDist <= 0.08) {
        b = amber[0];
        g = amber[1];
        r = amber[2];
      }

      row.push(b, g, r, a);
    }
    pixels.push(...row);
  }

  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0);
  bih.writeInt32LE(size, 4);
  bih.writeInt32LE(size * 2, 8);
  bih.writeUInt16LE(1, 12);
  bih.writeUInt16LE(32, 14);
  bih.writeUInt32LE(0, 16);
  bih.writeUInt32LE(pixels.length, 20);
  bih.writeInt32LE(0, 24);
  bih.writeInt32LE(0, 28);
  bih.writeUInt32LE(0, 32);
  bih.writeUInt32LE(0, 36);

  const xorMask = Buffer.from(pixels);
  const bytesPerRow = Math.ceil(size / 32) * 4;
  const andMask = Buffer.alloc(bytesPerRow * size, 0);
  for (let dibY = 0; dibY < size; dibY++) {
    for (let x = 0; x < size; x++) {
      const alphaIndex = (dibY * size + x) * 4 + 3;
      const alpha = pixels[alphaIndex];
      if (alpha === 0) {
        const byteIndex = dibY * bytesPerRow + Math.floor(x / 8);
        const bitOffset = 7 - (x % 8);
        andMask[byteIndex] |= (1 << bitOffset);
      }
    }
  }

  const dibBuffer = Buffer.concat([bih, xorMask, andMask]);
  return { size, dibBuffer };
}

export function generateIcoFile() {
  const images = [createIconBuffer(32), createIconBuffer(16)];
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + dirEntrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirEntries = [];
  let currentOffset = totalHeaderSize;

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size, 0);
    entry.writeUInt8(img.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.dibBuffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    currentOffset += img.dibBuffer.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...images.map((img) => img.dibBuffer),
  ]);
}

const icoBuffer = generateIcoFile();
const targetLocations = [
  path.resolve('public', 'favicon.ico'),
  path.resolve('dist', 'favicon.ico'),
  path.resolve('docs', 'favicon.ico'),
  path.resolve('favicon.ico'),
];

for (const loc of targetLocations) {
  const dir = path.dirname(loc);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(loc, icoBuffer);
  console.log(`Wrote ${icoBuffer.length} bytes to ${loc}`);
}
