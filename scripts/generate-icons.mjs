/**
 * Génère les icônes bitmap de Moovy à partir de la géométrie du logo
 * SVG (src/app/icon.svg) : favicon.ico (16/32/48) + apple-icon.png (180).
 *
 * Rastérisation et encodage en pur JavaScript (PNG avec deflate « stored »,
 * ICO avec images PNG) — aucune dépendance. Ré-exécutable : `node scripts/generate-icons.mjs`.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Couleurs du thème (cf. src/app/globals.css). */
const GRAD_FROM = [0xfb, 0x71, 0x85]; // #fb7185
const GRAD_TO = [0xe1, 0x1d, 0x48]; // #e11d48
const GLYPH = [0x0b, 0x0b, 0x0f]; // #0b0b0f

/** Géométrie du logo dans un repère 128×128. */
const SIZE = 128;
const RADIUS = 28; // coins du carré arrondi
// Polygone du M (fill-rule evenodd) — points du path « M28 96 V36 ... Z ».
const M_PATH = [
  [28, 96], [28, 36], [52, 62], [64, 47], [76, 62], [100, 36],
  [100, 96], [82, 96], [82, 68], [64, 89], [46, 68], [46, 96],
];
// Triangle play « M58 44 L82 30 L82 58 Z ».
const PLAY_PATH = [[58, 44], [82, 30], [82, 58]];

/** Point dans un polygone (règle pair-impair, comme fill-rule="evenodd"). */
function pointInPolygonEvenOdd(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Carré arrondi : signe de la distance signée (< 0 à l'intérieur). */
function roundedRectSDF(x, y, half, radius) {
  const qx = Math.abs(x) - (half - radius);
  const qy = Math.abs(y) - (half - radius);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Couleur du dégradé diagonal en (x, y) — projection sur la direction (1,1). */
function gradientAt(x, y) {
  const t = (x + y) / (2 * SIZE);
  return [0, 1, 2].map((c) => Math.round(GRAD_FROM[c] + (GRAD_TO[c] - GRAD_FROM[c]) * t));
}

/**
 * Rastérise le logo en RGBA. `options.fullBleed` retire les coins arrondis
 * (pour l'icône iOS, qui applique son propre masque).
 * Antialiasing par sur-échantillonnage `ss × ss` sous chaque pixel.
 */
function renderLogo(size, { fullBleed = false, ss = 4 } = {}) {
  const pixels = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = ((px + (sx + 0.5) / ss) / size) * SIZE;
          const y = ((py + (sy + 0.5) / ss) / size) * SIZE;
          // Transparence hors du carré (arrondi ou bord droit).
          const outside = fullBleed
            ? x < 0 || y < 0
            : roundedRectSDF(x - 64, y - 64, 64, RADIUS) > 0;
          if (outside) continue;
          const glyph =
            pointInPolygonEvenOdd(x, y, M_PATH) || pointInPolygonEvenOdd(x, y, PLAY_PATH);
          const [cr, cg, cb] = glyph ? GLYPH : gradientAt(x, y);
          r += cr; g += cg; b += cb; a += 255;
        }
      }
      const n = ss * ss;
      const o = (py * size + px) * 4;
      pixels[o] = Math.round(r / n);
      pixels[o + 1] = Math.round(g / n);
      pixels[o + 2] = Math.round(b / n);
      pixels[o + 3] = Math.round(a / n);
    }
  }
  return pixels;
}

/* ------------------------- Encodage PNG (RGBA 8 bits) ------------------------- */

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes) {
  let a = 1, b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16 | a) >>> 0;
}

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(type, 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** PNG sans compression réelle : deflate en blocs « stored » (rapide, suffisant). */
function encodePng(width, height, rgba) {
  // Chaque ligne est précédée d'un octet de filtre (0 = aucun).
  const stride = width * 4;
  const raw = new Uint8Array(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  // Flux zlib : blocs non compressés de 65 535 octets max.
  const blocks = Math.ceil(raw.length / 65535);
  const zlib = new Uint8Array(2 + raw.length + blocks * 5 + 4);
  let o = 0;
  zlib[o++] = 0x78; zlib[o++] = 0x01; // CMF/FLG (deflate, pas de dictionnaire)
  for (let i = 0; i < blocks; i++) {
    const len = Math.min(65535, raw.length - i * 65535);
    const last = i === blocks - 1;
    zlib[o++] = last ? 0x01 : 0x00;
    zlib[o++] = len & 0xff; zlib[o++] = len >>> 8; // LEN
    zlib[o++] = ~len & 0xff; zlib[o++] = (~len >>> 8) & 0xff; // NLEN
    zlib.set(raw.subarray(i * 65535, i * 65535 + len), o);
    o += len;
  }
  const dv = new DataView(zlib.buffer);
  dv.setUint32(o, adler32(raw)); // Adler-32 des données brutes

  const ihdr = new Uint8Array(13);
  const idv = new DataView(ihdr.buffer);
  idv.setUint32(0, width); idv.setUint32(4, height);
  ihdr[8] = 8; // profondeur
  ihdr[9] = 6; // RGBA
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const idat = chunk(new Uint8Array([0x49, 0x44, 0x41, 0x54]), zlib);
  const iend = chunk(new Uint8Array([0x49, 0x45, 0x4e, 0x44]), new Uint8Array(0));
  const ihdrChunk = chunk(new Uint8Array([0x49, 0x48, 0x44, 0x52]), ihdr);

  const png = new Uint8Array(signature.length + ihdrChunk.length + idat.length + iend.length);
  let p = 0;
  for (const part of [signature, ihdrChunk, idat, iend]) {
    png.set(part, p);
    p += part.length;
  }
  return png;
}

/* ----------------------------- Fichier .ico ----------------------------- */

/** ICO avec entrées PNG (support natif depuis Windows Vista). */
function buildIco(pngs) {
  const header = new Uint8Array(6);
  const dv = new DataView(header.buffer);
  dv.setUint16(2, 1, true); // type = icône
  dv.setUint16(4, pngs.length, true);

  const entries = new Uint8Array(16 * pngs.length);
  const edv = new DataView(entries.buffer);
  let offset = header.length + entries.length;
  pngs.forEach(({ width, height, png }, i) => {
    const e = i * 16;
    edv.setUint8(e, width === 256 ? 0 : width);
    edv.setUint8(e + 1, height === 256 ? 0 : height);
    edv.setUint16(e + 4, 1, true); // plans
    edv.setUint16(e + 6, 32, true); // bpp
    edv.setUint32(e + 8, png.length, true);
    edv.setUint32(e + 12, offset, true);
    offset += png.length;
  });

  const ico = new Uint8Array(offset);
  ico.set(header, 0);
  ico.set(entries, header.length);
  let p = header.length + entries.length;
  for (const { png } of pngs) {
    ico.set(png, p);
    p += png.length;
  }
  return ico;
}

/* --------------------------------- Génération --------------------------------- */

const outDir = join(root, "src", "app");
mkdirSync(outDir, { recursive: true });

// favicon.ico : 16, 32 et 48 px.
const faviconSizes = [16, 32, 48];
const faviconPngs = faviconSizes.map((size) => ({
  width: size,
  height: size,
  png: encodePng(size, size, renderLogo(size)),
}));
writeFileSync(join(outDir, "favicon.ico"), buildIco(faviconPngs));
console.log(`✓ favicon.ico (${faviconSizes.join(", ")})`);

// apple-icon.png : 180×180, pleine page (iOS applique son propre masque).
const apple = 180;
writeFileSync(
  join(outDir, "apple-icon.png"),
  encodePng(apple, apple, renderLogo(apple, { fullBleed: true })),
);
console.log(`✓ apple-icon.png (${apple}×${apple})`);
