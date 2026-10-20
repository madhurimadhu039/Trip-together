import fs from 'fs';
import path from 'path';

function createIconBuffer(size) {
  // Render size x size pixel grid
  // Logo:
  // - Rounded rectangle background with gradient from #0D4A42 (13, 74, 66) to #14B8A6 (20, 184, 166)
  // - Mountain/tent peak in center: #D97706 (217, 119, 6) and #FBBF24 (251, 191, 36)
  // - Sun circle: #FBBF24 (251, 191, 36)
  // - Base rail line: white #FFFFFF (255, 255, 255)
  const pixels = []; // [B, G, R, A] for each pixel (bottom-to-top)

  const radius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  // Pre-calculate colors
  const tealDark = [66, 74, 13];    // B, G, R
  const tealLight = [166, 184, 20]; // B, G, R
  const amberDark = [6, 119, 217];  // B, G, R
  const amberLight = [36, 191, 251];// B, G, R
  const white = [255, 255, 255];

  // Note: DIB rows are ordered from bottom (y = size - 1) up to top (y = 0)
  for (let dibY = 0; dibY < size; dibY++) {
    // svgY corresponds to normal top-to-bottom coordinates
    const svgY = (size - 1) - dibY;
    const row = [];

    for (let svgX = 0; svgX < size; svgX++) {
      // Check rounded rect boundary
      // Rect from [0.5, 0.5] to [size-0.5, size-0.5]
      const dx = Math.max(0, Math.abs(svgX + 0.5 - cx) - (cx - radius));
      const dy = Math.max(0, Math.abs(svgY + 0.5 - cy) - (cy - radius));
      const distFromCorner = Math.sqrt(dx * dx + dy * dy);

      if (distFromCorner > radius) {
        // Outside rounded rect - fully transparent
        row.push(0, 0, 0, 0);
        continue;
      }

      // Inside base rounded rect: compute gradient
      const t = (svgX + svgY) / (2 * size);
      let b = Math.round(tealDark[0] + t * (tealLight[0] - tealDark[0]));
      let g = Math.round(tealDark[1] + t * (tealLight[1] - tealDark[1]));
      let r = Math.round(tealDark[2] + t * (tealLight[2] - tealDark[2]));
      let a = 255;

      // Anti-aliasing at the corner boundary
      if (distFromCorner > radius - 1) {
        const edgeAlpha = Math.max(0, Math.min(1, radius - distFromCorner));
        a = Math.round(edgeAlpha * 255);
      }

      const nx = svgX / size; // 0 to 1
      const ny = svgY / size; // 0 to 1

      // 1. Sun circle at (0.5, 0.24), radius 0.08
      const sunDist = Math.hypot(nx - 0.5, ny - 0.24);
      if (sunDist < 0.08) {
        b = amberLight[0];
        g = amberLight[1];
        r = amberLight[2];
      }

      // 2. Large mountain peak: apex at (0.5, 0.28), base from (0.26, 0.68) to (0.74, 0.68)
      if (ny >= 0.28 && ny <= 0.68) {
        const progress = (ny - 0.28) / (0.68 - 0.28);
        const halfWidth = progress * 0.24;
        if (Math.abs(nx - 0.5) <= halfWidth) {
          b = amberDark[0];
          g = amberDark[1];
          r = amberDark[2];
        }
      }

      // 3. Inner mountain peak: apex at (0.5, 0.44), base from (0.38, 0.68) to (0.62, 0.68)
      if (ny >= 0.44 && ny <= 0.68) {
        const progress = (ny - 0.44) / (0.68 - 0.44);
        const halfWidth = progress * 0.13;
        if (Math.abs(nx - 0.5) <= halfWidth) {
          b = amberLight[0];
          g = amberLight[1];
          r = amberLight[2];
        }
      }

      // 4. White transit rail line: y from 0.72 to 0.76, x from 0.22 to 0.78
      if (ny >= 0.72 && ny <= 0.76 && nx >= 0.22 && nx <= 0.78) {
        b = white[0];
        g = white[1];
        r = white[2];
      }

      // 5. Transit wheels: circle at (0.34, 0.74) and (0.66, 0.74), radius 0.04
      const wheel1Dist = Math.hypot(nx - 0.34, ny - 0.74);
      const wheel2Dist = Math.hypot(nx - 0.66, ny - 0.74);
      if (wheel1Dist < 0.045 || wheel2Dist < 0.045) {
        b = white[0];
        g = white[1];
        r = white[2];
      }

      row.push(b, g, r, a);
    }

    pixels.push(...row);
  }

  // BITMAPINFOHEADER (40 bytes)
  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0);              // biSize
  bih.writeInt32LE(size, 4);             // biWidth
  bih.writeInt32LE(size * 2, 8);         // biHeight (doubled for XOR + AND masks)
  bih.writeUInt16LE(1, 12);              // biPlanes
  bih.writeUInt16LE(32, 14);             // biBitCount (32-bit BGRA)
  bih.writeUInt32LE(0, 16);              // biCompression (BI_RGB)
  bih.writeUInt32LE(pixels.length, 20);  // biSizeImage
  bih.writeInt32LE(0, 24);              // biXPelsPerMeter
  bih.writeInt32LE(0, 28);              // biYPelsPerMeter
  bih.writeUInt32LE(0, 32);              // biClrUsed
  bih.writeUInt32LE(0, 36);              // biClrImportant

  const xorMask = Buffer.from(pixels);

  // AND mask: 1 bit per pixel, each row padded to multiple of 4 bytes (32 bits)
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
  return {
    size,
    dibBuffer,
  };
}

export function generateIcoFile() {
  const images = [createIconBuffer(32), createIconBuffer(16)];

  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + dirEntrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);             // Reserved
  header.writeUInt16LE(1, 2);             // Type 1 = ICO
  header.writeUInt16LE(images.length, 4); // Number of images

  const dirEntries = [];
  let currentOffset = totalHeaderSize;

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size, 0);                  // Width
    entry.writeUInt8(img.size, 1);                  // Height
    entry.writeUInt8(0, 2);                         // Color count
    entry.writeUInt8(0, 3);                         // Reserved
    entry.writeUInt16LE(1, 4);                      // Color planes
    entry.writeUInt16LE(32, 6);                     // Bits per pixel
    entry.writeUInt32LE(img.dibBuffer.length, 8);   // Resource size
    entry.writeUInt32LE(currentOffset, 12);         // Offset
    dirEntries.push(entry);
    currentOffset += img.dibBuffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...images.map((img) => img.dibBuffer),
  ]);

  return icoBuffer;
}

const icoBuffer = generateIcoFile();
console.log(`Generated binary ICO file: ${icoBuffer.length} bytes`);

// Write to public, dist, docs, and root
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
