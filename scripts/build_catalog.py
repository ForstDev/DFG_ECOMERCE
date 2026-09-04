# -*- coding: utf-8 -*-
"""
Convierte el excel del catalogo DFG a data/catalog.json + data/catalog-report.md

Uso:  python scripts/build_catalog.py [ruta_al_xlsx]
Requiere:  python -m pip install openpyxl
"""
import json, re, sys, io, os, datetime
from collections import Counter, defaultdict, OrderedDict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

try:
    import openpyxl
except ImportError:
    sys.exit("Falta openpyxl.  Instalalo con:  python -m pip install openpyxl")

XLSX = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Alvaro\Downloads\CATALOGO_marcas_separadas.xlsx"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(HERE, "..", "data"))

# --- Normalizacion de marcas -------------------------------------------------
# El excel trae variantes y erratas de la misma marca. Se unifican para que el
# filtro del catalogo no muestre cuatro entradas distintas de Mercedes Benz.
BRAND_ALIASES = {
    "VOVLO": "VOLVO",
    "MERCEDES": "MERCEDES BENZ",
    "MERCEDEZ BENZ": "MERCEDES BENZ",
    "MERCEBES BENZ": "MERCEDES BENZ",
    "MBB": "MERCEDES BENZ",
    "MB": "MERCEDES BENZ",
    "MWB": "MERCEDES BENZ",
    "FLETTGUARD": "FLEETGUARD",
    "CAT": "CATERPILLAR",
}
# "TODOS" no es una marca, significa "aplica a todas". No entra al filtro.
BRAND_DROP = {"TODOS"}

FAMILY_FIXES = {"UNIVERSAL JOINT\\": "UNIVERSAL JOINT"}

IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif")

MAX_CODE_LEN = 24


def clean(v):
    if v is None:
        return ""
    return re.sub(r"\s+", " ", str(v)).strip()


def slugify(text):
    s = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return s or "sin-codigo"


def parse_codes(raw):
    """
    La columna CODIGO a veces trae una sola referencia y a veces una lista de
    equivalencias OEM separadas por "/", con el formato "MARCA: codigo".

        "SCANIA: 1372444/ FLEETGUARD: FF5297"
        "VOLVO 85106370/FREIGHTLINER DNP527682/ CATERPILLAR 3I1456"

    Devuelve (codigo_principal, [ {brand, code}, ... ]). El principal es la
    primera referencia; el resto queda como referencias cruzadas, que siguen
    siendo buscables y se muestran en la ficha.
    """
    if not raw:
        return "", []

    segments = [s.strip() for s in re.split(r"[/;]", raw) if s.strip()]
    refs = []

    for seg in segments:
        brand, code = "", seg

        if ":" in seg:
            left, right = seg.split(":", 1)
            if right.strip():
                brand, code = left.strip(), right.strip()
        else:
            # "VOLVO 85106370" -> marca + codigo, solo si son dos tokens y el
            # segundo tiene digitos. Evita partir codigos como "4515+4707".
            parts = seg.split()
            if (
                len(parts) == 2
                and re.fullmatch(r"[A-Za-z][A-Za-z.\-]+", parts[0])
                and any(ch.isdigit() for ch in parts[1])
            ):
                brand, code = parts[0].strip(), parts[1].strip()

        code = code.strip(" .,-")
        if code:
            refs.append({"brand": brand.upper(), "code": code})

    if not refs:
        return raw[:MAX_CODE_LEN], []

    primary = refs[0]["code"]

    # Ultimo recurso: si el principal sigue siendo larguisimo, se usa su primer
    # token. Un codigo de mas de 24 caracteres no es un codigo.
    if len(primary) > MAX_CODE_LEN:
        first_token = primary.split()[0]
        primary = first_token if len(first_token) <= MAX_CODE_LEN else primary[:MAX_CODE_LEN]

    return primary, refs[1:]


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True, read_only=True)
    ws = wb["CATALOG"]
    rows = list(ws.iter_rows(values_only=True))
    head = [clean(h) for h in rows[0]]
    raw_rows = [dict(zip(head, r)) for r in rows[1:] if any(c is not None for c in r)]

    report = {
        "total": len(raw_rows),
        "dropped": 0,
        "no_image": 0,
        "no_subfamily": 0,
        "brand_fixes": Counter(),
        "slug_collisions": [],
        "bad_urls": [],
        "split_codes": [],
    }

    brand_cols = [
        "marca_camion_1",
        "marca_camion_2",
        "marca_camion_3",
        "marca_camion_4",
        "marca_camion_5",
    ]

    products, used_slugs = [], {}

    for r in raw_rows:
        code_raw = clean(r.get("CODIGO"))
        name = clean(r.get("DESCRIPCION"))
        if not code_raw:
            report["dropped"] += 1
            continue

        code, cross_refs = parse_codes(code_raw)
        if cross_refs:
            report["split_codes"].append((code, len(cross_refs) + 1, code_raw))

        family = clean(r.get("FAMILIA")).upper()
        family = FAMILY_FIXES.get(family, family) or "OTROS"
        subfamily = clean(r.get("SUBFAMILIA")).upper()
        if not subfamily:
            report["no_subfamily"] += 1

        images = []
        for part in clean(r.get("IMAGENES")).split(","):
            part = part.strip()
            if not part:
                continue
            if part.lower().startswith("http") and part.lower().endswith(IMG_EXT):
                images.append(part)
            else:
                report["bad_urls"].append((code, part))
        if not images:
            report["no_image"] += 1

        brands, seen = [], set()
        for col in brand_cols:
            v = clean(r.get(col)).upper()
            if not v:
                continue
            if v in BRAND_ALIASES:
                report["brand_fixes"][v + " -> " + BRAND_ALIASES[v]] += 1
                v = BRAND_ALIASES[v]
            if v in BRAND_DROP or v in seen:
                continue
            seen.add(v)
            brands.append(v)

        base = slugify(code)
        slug = base
        if base in used_slugs:
            used_slugs[base] += 1
            slug = base + "-" + str(used_slugs[base])
            report["slug_collisions"].append((code, slug))
        else:
            used_slugs[base] = 1

        products.append(
            OrderedDict(
                [
                    ("id", clean(r.get("ID"))),
                    ("slug", slug),
                    ("code", code),
                    ("codeRaw", code_raw if code_raw != code else ""),
                    ("crossRefs", cross_refs),
                    ("name", name.upper()),
                    ("family", family),
                    ("subfamily", subfamily),
                    ("brands", brands),
                    ("brandLabel", " - ".join(brands)),
                    ("application", clean(r.get("APLICACION"))),
                    ("images", images),
                ]
            )
        )

    # --- Taxonomia ----------------------------------------------------------
    fam_map = defaultdict(lambda: {"count": 0, "subfamilies": Counter(), "image": ""})
    for p in products:
        f = fam_map[p["family"]]
        f["count"] += 1
        if p["subfamily"]:
            f["subfamilies"][p["subfamily"]] += 1
        if not f["image"] and p["images"]:
            f["image"] = p["images"][0]

    families = []
    for name in sorted(fam_map):
        f = fam_map[name]
        families.append(
            OrderedDict(
                [
                    ("name", name),
                    ("slug", slugify(name)),
                    ("count", f["count"]),
                    ("image", f["image"]),
                    (
                        "subfamilies",
                        [
                            {"name": s, "slug": slugify(s), "count": c}
                            for s, c in sorted(f["subfamilies"].items(), key=lambda x: -x[1])
                        ],
                    ),
                ]
            )
        )

    brand_counts = Counter()
    for p in products:
        for b in p["brands"]:
            brand_counts[b] += 1
    brands_list = [
        {"name": b, "slug": slugify(b), "count": c}
        for b, c in sorted(brand_counts.items(), key=lambda x: (-x[1], x[0]))
    ]

    os.makedirs(OUT_DIR, exist_ok=True)
    catalog = OrderedDict(
        [
            ("generatedAt", datetime.datetime.now().isoformat(timespec="seconds")),
            ("source", os.path.basename(XLSX)),
            (
                "totals",
                {
                    "products": len(products),
                    "families": len(families),
                    "brands": len(brands_list),
                    "withImage": sum(1 for p in products if p["images"]),
                    "images": sum(len(p["images"]) for p in products),
                    "withCrossRefs": sum(1 for p in products if p["crossRefs"]),
                },
            ),
            ("families", families),
            ("brands", brands_list),
            ("products", products),
        ]
    )

    out = os.path.join(OUT_DIR, "catalog.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(catalog, fh, ensure_ascii=False, indent=1)

    # --- Reporte ------------------------------------------------------------
    t = catalog["totals"]
    lines = [
        "# Reporte de conversion del catalogo",
        "",
        "Origen: `" + os.path.basename(XLSX) + "`",
        "Generado: " + catalog["generatedAt"],
        "",
        "## Totales",
        "",
        "- Filas en el excel: **" + str(report["total"]) + "**",
        "- Productos publicados: **" + str(len(products)) + "**",
        "- Filas descartadas sin codigo: **" + str(report["dropped"]) + "**",
        "- Familias: **" + str(len(families)) + "**  |  Marcas: **" + str(len(brands_list)) + "**",
        "- Productos con imagen: **" + str(t["withImage"]) + "** ("
        + str(t["withImage"] * 100 // len(products)) + "%)",
        "- Productos sin imagen: **" + str(report["no_image"]) + "**",
        "- Productos sin subfamilia: **" + str(report["no_subfamily"]) + "**",
        "- URLs de imagen: **" + str(t["images"]) + "**",
        "- Productos con referencias cruzadas: **" + str(t["withCrossRefs"]) + "**",
        "",
        "## Referencias cruzadas",
        "",
        "La columna CODIGO mezcla dos cosas: el codigo de la pieza y, en "
        + str(t["withCrossRefs"])
        + " filas, una lista de equivalencias OEM separadas por barra.",
        "El conversor toma la primera referencia como codigo principal y guarda el",
        "resto como referencias cruzadas, que siguen siendo buscables y se muestran",
        "en la ficha del producto.",
        "",
        "| Codigo principal | Referencias | Valor original |",
        "| --- | --- | --- |",
    ]
    for code, n, raw in sorted(report["split_codes"], key=lambda x: -x[1])[:25]:
        lines.append("| " + code + " | " + str(n) + " | `" + raw[:120] + "` |")

    lines += ["", "## Marcas normalizadas", "", "| Correccion | Filas |", "| --- | --- |"]
    for k, v in report["brand_fixes"].most_common():
        lines.append("| " + k + " | " + str(v) + " |")
    if not report["brand_fixes"]:
        lines.append("| sin correcciones | 0 |")

    lines += ["", "## Codigos repetidos", ""]
    if report["slug_collisions"]:
        lines += [
            "El mismo codigo aparece en mas de una fila. Se les asigno una URL unica.",
            "",
            "| Codigo | URL asignada |",
            "| --- | --- |",
        ]
        for code, slug in report["slug_collisions"]:
            lines.append("| " + code + " | /producto/" + slug + " |")
    else:
        lines.append("Ninguno.")

    lines += ["", "## URLs de imagen descartadas", ""]
    if report["bad_urls"]:
        lines += ["| Codigo | Valor |", "| --- | --- |"]
        for code, url in report["bad_urls"][:60]:
            lines.append("| " + code + " | `" + url + "` |")
    else:
        lines.append("Ninguna. Todas las URLs del excel son validas.")

    lines += [
        "",
        "## Productos por familia",
        "",
        "| Familia | Productos | Subfamilias |",
        "| --- | --- | --- |",
    ]
    for f in sorted(families, key=lambda x: -x["count"]):
        lines.append("| " + f["name"] + " | " + str(f["count"]) + " | " + str(len(f["subfamilies"])) + " |")

    with open(os.path.join(OUT_DIR, "catalog-report.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")

    print("OK  ->  " + out)
    print("    productos: %d  familias: %d  marcas: %d" % (len(products), len(families), len(brands_list)))
    print("    con imagen: %d  sin imagen: %d" % (t["withImage"], report["no_image"]))
    print("    con referencias cruzadas: %d" % t["withCrossRefs"])
    print("    colisiones de codigo: %d" % len(report["slug_collisions"]))
    print("    tamano json: %d KB" % (os.path.getsize(out) // 1024))


if __name__ == "__main__":
    main()
