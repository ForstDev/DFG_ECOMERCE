import Link from "next/link";
import { buildCatalogHref, type CatalogParams } from "@/lib/url";

/**
 * Numbered paging rather than infinite scroll: buyers work through a family
 * methodically and need to be able to come back to page 7.
 */
export function Pagination({
  params,
  page,
  pages,
}: {
  params: CatalogParams;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  const window: (number | "gap")[] = [];
  const push = (n: number | "gap") => {
    if (window[window.length - 1] !== n) window.push(n);
  };

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) push(i);
    else push("gap");
  }

  const cell =
    "grid h-10 min-w-10 place-items-center border px-3 text-[12.5px] font-semibold transition-colors";

  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <Link
        href={buildCatalogHref(params, { pagina: String(Math.max(1, page - 1)) })}
        scroll={false}
        aria-disabled={page === 1}
        className={
          cell +
          (page === 1
            ? " pointer-events-none border-line text-line-strong"
            : " border-line text-ink hover:border-ink")
        }
      >
        Anterior
      </Link>

      {window.map((n, i) =>
        n === "gap" ? (
          <span key={"gap" + i} className="px-1 text-ink-mute">
            ...
          </span>
        ) : (
          <Link
            key={n}
            href={buildCatalogHref(params, { pagina: String(n) })}
            scroll={false}
            aria-current={n === page ? "page" : undefined}
            className={
              cell +
              " code-type " +
              (n === page
                ? " border-ink bg-ink text-paper"
                : " border-line text-ink hover:border-ink")
            }
          >
            {n}
          </Link>
        ),
      )}

      <Link
        href={buildCatalogHref(params, { pagina: String(Math.min(pages, page + 1)) })}
        scroll={false}
        aria-disabled={page === pages}
        className={
          cell +
          (page === pages
            ? " pointer-events-none border-line text-line-strong"
            : " border-line text-ink hover:border-ink")
        }
      >
        Siguiente
      </Link>
    </nav>
  );
}
