import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ProductOverride, Settings, StoredEvent, TrackEvent } from "./types";

/**
 * A tiny JSON file store. It is deliberately not a database: this build is a
 * proposal demo that has to run from a folder with `npm run dev`, with no
 * service to provision. Everything the admin panel writes lands in
 * data/runtime/ and survives restarts. Swapping this module for Postgres or
 * SQLite later means changing these six functions and nothing else.
 */

const RUNTIME = path.join(process.cwd(), "data", "runtime");
const OVERRIDES = path.join(RUNTIME, "overrides.json");
const EVENTS = path.join(RUNTIME, "events.json");
const SETTINGS = path.join(RUNTIME, "settings.json");

/** Events are kept bounded so the file cannot grow without limit. */
const MAX_EVENTS = 8000;

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: "51999888777",
  whatsappLabel: "Ventas DFG",
  quoteIntro: "Hola DFG, quiero cotizar los siguientes repuestos:",
  contactEmail: "contact@dfgtruckparts.com",
};

function ensureDir() {
  if (!fs.existsSync(RUNTIME)) fs.mkdirSync(RUNTIME, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf8").trim();
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // A corrupt file must not take the site down. The panel can rewrite it.
    return fallback;
  }
}

/** Write to a sibling temp file then rename, so a crash cannot truncate data. */
function writeJson(file: string, data: unknown) {
  ensureDir();
  const tmp = file + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1), "utf8");
  fs.renameSync(tmp, file);
}

// --- product overrides ------------------------------------------------------

export function readOverrides(): Record<string, ProductOverride> {
  return readJson<Record<string, ProductOverride>>(OVERRIDES, {});
}

export function saveOverride(slug: string, patch: Partial<ProductOverride>) {
  const all = readOverrides();
  const next: ProductOverride = {
    ...all[slug],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  // Drop keys the admin cleared, so the excel value shows through again.
  for (const k of ["name", "application", "images"] as const) {
    if (next[k] === undefined || next[k] === null) delete next[k];
  }
  all[slug] = next;
  writeJson(OVERRIDES, all);
  return next;
}

export function clearOverride(slug: string) {
  const all = readOverrides();
  delete all[slug];
  writeJson(OVERRIDES, all);
}

// --- settings ---------------------------------------------------------------

export function readSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(SETTINGS, {}) };
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...readSettings(), ...patch };
  writeJson(SETTINGS, next);
  return next;
}

// --- analytics --------------------------------------------------------------

export function readEvents(): StoredEvent[] {
  return readJson<StoredEvent[]>(EVENTS, []);
}

export function appendEvent(event: TrackEvent) {
  const all = readEvents();
  all.push({ ...event, at: new Date().toISOString() });
  writeJson(EVENTS, all.slice(-MAX_EVENTS));
}

export function clearEvents() {
  writeJson(EVENTS, []);
}
