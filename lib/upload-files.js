import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const CACHE_DIR = path.join(DATA_DIR, "cache");

// Apaga uma foto enviada E todas as versões redimensionadas dela guardadas em
// cache (arquivos "LARGURA-nome.webp"), para não sobrar lixo no disco.
export function removeUploadFile(filename) {
  const name = path.basename(String(filename));
  fs.unlink(path.join(UPLOADS_DIR, name), () => {});
  const base = path.basename(name, path.extname(name));
  fs.readdir(CACHE_DIR, (err, files) => {
    if (err) return;
    for (const f of files) {
      if (f.endsWith(`-${base}.webp`) && /^\d+-/.test(f)) {
        fs.unlink(path.join(CACHE_DIR, f), () => {});
      }
    }
  });
}
