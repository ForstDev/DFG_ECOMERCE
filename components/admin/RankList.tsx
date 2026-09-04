import Link from "next/link";
import type { Ranked } from "@/lib/stats";

/**
 * A ranked list with an inline bar. The bar has no background track: the point
 * is the relative length between rows, and an empty track would just add
 * dashboard furniture to a panel that is already dense.
 */
export function RankList({
  title,
  subtitle,
  items,
  hrefFor,
  unit,
  tone = "default",
  empty,
}: {
  title: string;
  subtitle?: string;
  items: Ranked[];
  hrefFor?: (item: Ranked) => string;
  unit?: string;
  tone?: "default" | "warn";
  empty: string;
}) {
  const max = items[0]?.count ?? 1;

  return (
    <div className="border border-line bg-paper">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">{title}</h2>
        {subtitle && <p className="mt-1 text-[12px] text-ink-mute">{subtitle}</p>}
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-[12.5px] text-ink-mute">{empty}</p>
      ) : (
        <ol className="divide-y divide-line">
          {items.map((item, i) => {
            const row = (
              <>
                <span className="code-type w-5 shrink-0 text-[11px] text-ink-mute">
                  {i + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={
                        "truncate text-[13px] font-semibold " +
                        (tone === "warn" ? "text-red-deep" : "text-ink")
                      }
                    >
                      {item.label}
                    </span>
                    <span className="code-type shrink-0 text-[12px] font-bold text-ink">
                      {item.count.toLocaleString("es")}
                      {unit ? " " + unit : ""}
                    </span>
                  </span>

                  {item.extra && (
                    <span className="mt-0.5 block truncate text-[11.5px] text-ink-mute">
                      {item.extra}
                    </span>
                  )}

                  <span
                    className={
                      "mt-2 block h-[3px] " + (tone === "warn" ? "bg-red" : "bg-ink")
                    }
                    style={{ width: Math.max(4, (item.count / max) * 100) + "%" }}
                  />
                </span>
              </>
            );

            return (
              <li key={item.key}>
                {hrefFor ? (
                  <Link
                    href={hrefFor(item)}
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-5 py-3">{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
