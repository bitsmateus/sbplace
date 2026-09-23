import path from "node:path";
import fs from "node:fs";

// Plain JSON-file store (no native modules involved). This app's catalog is
// small (a handful of bikes for one shop), so a real SQL engine buys nothing
// here — and a native binding (better-sqlite3) turned out to be unreliable
// in this specific hosting environment (it segfaulted on load, even freshly
// compiled from source, even for a plain `:memory:` database — verified via
// a live shell in the deployed container). This store is pure JavaScript,
// so there is no compiled binary that can be wrong for the host.

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "sbplace.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, "uploads"), { recursive: true });

function emptyStore() {
  return { bikes: [], nextId: 1, settings: {} };
}

function readStore() {
  if (!fs.existsSync(DB_PATH)) return emptyStore();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    if (!raw.trim()) return emptyStore();
    const data = JSON.parse(raw);
    return {
      bikes: Array.isArray(data.bikes) ? data.bikes : [],
      nextId: typeof data.nextId === "number" ? data.nextId : 1,
      settings: data.settings && typeof data.settings === "object" ? data.settings : {},
    };
  } catch {
    // corrupt/partial file — don't crash the site, start fresh in memory
    // (the bad file is left on disk in case it needs manual recovery)
    return emptyStore();
  }
}

function writeStore(store) {
  // write to a temp file then rename, so a crash mid-write never leaves a
  // half-written (and therefore unreadable) sbplace.json behind
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2));
  fs.renameSync(tmpPath, DB_PATH);
}

export default readStore;
export { DATA_DIR, readStore, writeStore };
