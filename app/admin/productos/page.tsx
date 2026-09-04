import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { search, getProduct } from "@/lib/catalog";
import { readOverrides } from "@/lib/store";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Productos" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const estado = sp.estado ?? "todos";
  const page = Number(sp.pagina ?? 1) || 1;
  const editing = sp.editar ? getProduct(sp.editar) : undefined;
  const overrides = readOverrides();

  // The catalog search is reused so the panel finds a product exactly the way a
  // customer would, by code or by description.
  const base = search({ q: q || undefined, perPage: 4000, page: 1 });

  const filtered = base.items.filter((p) => {
    if (estado === "sin-foto") return p.images.length === 0;
    if (estado === "editados") return Boolean(overrides[p.slug]);
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages);
  const items = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const href = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, estado, pagina: String(safePage), ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (!v || v === "todos" || (k === "pagina" && v === "1")) continue;
      next.set(k, v);
    }
    const qs = next.toString();
    return qs ? "/admin/productos?" + qs : "/admin/productos";
  };

  const TABS = [
    { key: "todos", label: "Todos" },
    { key: "sin-foto", label: "Sin foto" },
    { key: "editados", label: "Editados" },
  ];

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="border-b border-line pb-6">
        <h1 className="text-[28px] font-bold uppercase leading-none tracking-tight md:text-[38px]">
          Productos
        </h1>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-ink-mute">
          Busca un repuesto por código o descripción y edita su foto, su
          descripción y su aplicación. Los cambios se ven en la tienda al instante.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <AdminSearch initialValue={q} estado={estado} />

        <div className="flex gap-px bg-line">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={href({ estado: t.key, pagina: "1", editar: undefined })}
              className={
                "px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.07em] transition-colors " +
                (estado === t.key
                  ? "bg-ink text-paper"
                  : "bg-paper text-ink-mute hover:text-ink")
              }
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-4 code-type text-[12px] text-ink-mute">
        {filtered.length.toLocaleString("es")}{" "}
        {filtered.length === 1 ? "repuesto" : "repuestos"}
        {q ? ' para "' + q + '"' : ""}
      </p>

      <div className="mt-4 border border-line bg-paper">
        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-ink-mute">
            No hay repuestos para esa combinación.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((p) => (
              <li key={p.slug} className="flex items-center gap-4 px-4 py-3">
                <span className="photo-plate h-14 w-14 shrink-0 border border-line">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="code-type text-[9px] text-ink-mute">S/F</span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="code-type text-[12.5px] font-bold text-red">
                      {p.code}
                    </span>
                    {overrides[p.slug] && (
                      <span className="bg-ink px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-paper">
                        Editado
                      </span>
                    )}
                    {p.images.length === 0 && (
                      <span className="border border-red px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-red">
                        Sin foto
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
                    {p.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-mute">
                    {p.family}
                    {p.subfamily ? " / " + p.subfamily : ""}
                    {p.brandLabel ? " / " + p.brandLabel : ""}
                  </p>
                </div>

                <Link
                  href={href({ editar: p.slug })}
                  scroll={false}
                  className="inline-flex shrink-0 items-center gap-1.5 border border-line-strong px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <PencilSimpleIcon size={13} weight="bold" />
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-2">
          <Link
            href={href({ pagina: String(Math.max(1, safePage - 1)), editar: undefined })}
            className={
              "border border-line px-4 py-2 text-[12px] font-semibold " +
              (safePage === 1 ? "pointer-events-none text-line-strong" : "hover:border-ink")
            }
          >
            Anterior
          </Link>
          <span className="code-type px-2 text-[12px] text-ink-mute">
            {safePage} de {pages}
          </span>
          <Link
            href={href({ pagina: String(Math.min(pages, safePage + 1)), editar: undefined })}
            className={
              "border border-line px-4 py-2 text-[12px] font-semibold " +
              (safePage === pages
                ? "pointer-events-none text-line-strong"
                : "hover:border-ink")
            }
          >
            Siguiente
          </Link>
        </nav>
      )}

      {editing && (
        <ProductEditor
          key={editing.slug}
          product={editing}
          isOverridden={Boolean(overrides[editing.slug])}
          closeHref={href({ editar: undefined })}
        />
      )}
    </div>
  );
}
