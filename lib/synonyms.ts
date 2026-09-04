/**
 * Spanish to English search bridge.
 *
 * The catalog descriptions come out of the excel in English ("CABIN SHOCK
 * ABSORBER", "FUEL FILTER"), but the storefront is in Spanish and the people
 * using it are mechanics and buyers who type "amortiguador" and "filtro".
 * Without this map the two most natural searches on the site return nothing.
 *
 * Each entry expands a Spanish term into the English words that actually appear
 * in the data. A term matches if any of its expansions does, so "bolsa de aire"
 * finds AIR SPRING and "filtro volvo" still narrows to Volvo filters.
 *
 * Keys are already normalised: lowercase, no accents, no punctuation.
 */
export const ES_EN: Record<string, string[]> = {
  // suspensión y chasis
  amortiguador: ["shock absorber", "shock"],
  amortiguadores: ["shock absorber", "shock"],
  suspension: ["suspension"],
  bolsa: ["air spring"],
  bolson: ["air spring"],
  fuelle: ["air spring"],
  muelle: ["spring"],
  resorte: ["spring"],
  buje: ["bushing"],
  bujes: ["bushing"],
  soporte: ["mounting"],
  soportes: ["mounting"],
  base: ["mounting"],
  tirante: ["stay"],
  brazo: ["stay", "arm"],

  // frenos
  freno: ["brake"],
  frenos: ["brake"],
  zapata: ["shoe"],
  zapatas: ["shoe"],
  pastilla: ["pad"],
  pastillas: ["pad"],
  disco: ["disc", "disk"],
  discos: ["disc", "disk"],
  ratchet: ["slack adjuster"],
  ratcheta: ["slack adjuster"],
  regulador: ["slack adjuster"],
  camara: ["chamber"],
  camaras: ["chamber"],
  pulmon: ["chamber"],
  diafragma: ["diaphragm"],
  valvula: ["valve"],
  valvulas: ["valve"],
  secador: ["dryer"],
  levas: ["cam"],
  leva: ["cam"],

  // motor y enfriamiento
  filtro: ["filter"],
  filtros: ["filter"],
  aceite: ["oil"],
  combustible: ["fuel"],
  aire: ["air"],
  agua: ["water"],
  bomba: ["pump"],
  bombas: ["pump"],
  radiador: ["radiator"],
  radiadores: ["radiator"],
  enfriador: ["cooler"],
  compresor: ["compressor"],
  turbo: ["turbo"],
  culata: ["cylinder head"],
  camisa: ["liner"],
  anillo: ["ring"],
  anillos: ["ring"],
  carter: ["carter"],
  tapa: ["cap"],
  polea: ["pulley"],
  tensor: ["tensioner"],
  faja: ["belt"],
  correa: ["belt"],
  manguera: ["hose"],
  mangueras: ["hose"],
  abrazadera: ["clamp"],
  arbol: ["camshaft"],
  arrancador: ["starter"],
  alternador: ["alternator"],
  tanque: ["tank"],

  // transmisión
  embrague: ["clutch"],
  cloche: ["clutch"],
  croche: ["clutch"],
  plato: ["plate"],
  collarin: ["release bearing"],
  cilindro: ["cylinder"],
  maestro: ["master"],
  caja: ["gear box", "gearbox"],
  cambio: ["gear shift"],
  cambios: ["gear shift"],
  palanca: ["handle"],
  cruceta: ["joint cross", "universal joint", "cross"],
  crucetas: ["joint cross", "universal joint", "cross"],
  cardan: ["universal joint", "joint cross"],
  diferencial: ["differential"],

  // rodamientos, sellos y ferretería
  rodamiento: ["bearing"],
  rodamientos: ["bearing"],
  ruliman: ["bearing"],
  rulimanes: ["bearing"],
  reten: ["seal"],
  retenes: ["seal"],
  sello: ["seal"],
  sellos: ["seal"],
  empaque: ["seal", "gasket"],
  perno: ["bolt"],
  pernos: ["bolt"],
  tuerca: ["nut"],
  tuercas: ["nut"],
  esparrago: ["bolt"],

  // dirección y cabina
  direccion: ["steering"],
  cabina: ["cabin"],
  puerta: ["door"],
  espejo: ["mirror"],
  rueda: ["wheel"],
  ruedas: ["wheel"],
  llanta: ["wheel"],
  eje: ["axle"],
  delantero: ["front"],
  delantera: ["front"],
  trasero: ["rear"],
  trasera: ["rear"],
  posterior: ["rear"],
  sensor: ["sensor"],
  sensores: ["sensor"],
  kit: ["kit"],
  juego: ["kit"],
};


/**
 * Words with no discriminating power. They are dropped before matching: because
 * every field is matched as a substring, requiring "de" to appear somewhere
 * silently threw away good results.
 */
export const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas",
  "para", "con", "sin", "por", "y", "o", "a", "en", "al", "the", "of", "for",
]);

/**
 * Turns a search term into every string worth matching against. Falls back to a
 * naive singular form, so "filtros" resolves through "filtro" and lands on
 * "filter" without needing its own entry.
 */
export function expandTerm(term: string): string[] {
  const direct = ES_EN[term];
  if (direct) return [term, ...direct];

  for (const suffix of ["es", "s"]) {
    if (term.endsWith(suffix) && term.length > suffix.length + 2) {
      const singular = term.slice(0, -suffix.length);
      const hit = ES_EN[singular];
      if (hit) return [term, singular, ...hit];
    }
  }

  return [term];
}
