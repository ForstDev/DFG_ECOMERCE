"use client";

import { useMemo, useState } from "react";

type Row = { day: string; searches: number; views: number; cartAdds: number };

/**
 * Daily activity as three small multiples rather than one chart with three
 * lines. The three measures live on different scales (views run well above
 * quote adds), and stacking them on a shared axis would either flatten the
 * small one or force a second y axis, which is never the right answer. Each
 * facet is a single series, so identity comes from its title and no
 * categorical palette is needed; the brand red is held back for the hover
 * marker so it always means "this is what you are pointing at".
 */

const SERIES = [
  { key: "searches", label: "Búsquedas" },
  { key: "views", label: "Fichas vistas" },
  { key: "cartAdds", label: "Agregados a cotizar" },
] as const;

const W = 720;
const H = 64;

export function ActivityChart({ data }: { data: Row[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const maxima = useMemo(
    () => ({
      searches: Math.max(1, ...data.map((d) => d.searches)),
      views: Math.max(1, ...data.map((d) => d.views)),
      cartAdds: Math.max(1, ...data.map((d) => d.cartAdds)),
    }),
    [data],
  );

  const step = data.length > 1 ? W / (data.length - 1) : W;
  const x = (i: number) => i * step;
  const y = (v: number, max: number) => H - (v / max) * (H - 6) - 3;

  const dayLabel = (iso: string) => {
    const [, m, d] = iso.split("-");
    return d + "/" + m;
  };

  const active = hover !== null ? data[hover] : null;

  return (
    <figure className="border border-line bg-paper">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">
          Actividad diaria
        </h2>
        <p className="code-type text-[11.5px] text-ink-mute">
          {active
            ? dayLabel(active.day) +
              " / " +
              active.searches +
              " busq / " +
              active.views +
              " vistas / " +
              active.cartAdds +
              " agregados"
            : data.length + " días"}
        </p>
      </figcaption>

      <div
        className="relative px-5 py-5"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - r.left - 20) / (r.width - 40);
          const i = Math.round(ratio * (data.length - 1));
          setHover(i >= 0 && i < data.length ? i : null);
        }}
      >
        {SERIES.map(({ key, label }) => {
          const max = maxima[key];
          const points = data.map((d, i) => [x(i), y(d[key], max)] as const);
          const line = points.map(([px, py], i) => (i ? "L" : "M") + px + " " + py).join(" ");
          const area = line + " L " + W + " " + H + " L 0 " + H + " Z";

          return (
            <div key={key} className="mb-4 last:mb-0">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[11.5px] font-semibold text-ink">{label}</span>
                <span className="code-type text-[11px] text-ink-mute">
                  max {max.toLocaleString("es")}
                </span>
              </div>

              <svg
                viewBox={"0 0 " + W + " " + H}
                preserveAspectRatio="none"
                className="block h-16 w-full"
                role="presentation"
              >
                <path d={area} fill="var(--color-ink-soft)" opacity="0.09" />
                <path
                  d={line}
                  fill="none"
                  stroke="var(--color-ink-soft)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="0"
                  y1={H - 0.5}
                  x2={W}
                  y2={H - 0.5}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {hover !== null && points[hover] && (
                  <>
                    <line
                      x1={points[hover][0]}
                      y1="0"
                      x2={points[hover][0]}
                      y2={H}
                      stroke="var(--color-red)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={points[hover][0]}
                      cy={points[hover][1]}
                      r="4"
                      fill="var(--color-red)"
                      stroke="var(--color-paper)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}
              </svg>
            </div>
          );
        })}

        <div className="flex justify-between border-t border-line pt-2">
          <span className="code-type text-[10.5px] text-ink-mute">
            {data[0] ? dayLabel(data[0].day) : ""}
          </span>
          <span className="code-type text-[10.5px] text-ink-mute">
            {data[data.length - 1] ? dayLabel(data[data.length - 1].day) : ""}
          </span>
        </div>
      </div>

      {/* The same numbers as a table, for screen readers and for anyone who
          needs the exact value rather than the shape. */}
      <details className="border-t border-line">
        <summary className="cursor-pointer px-5 py-3 text-[12px] font-semibold text-ink-mute hover:text-ink">
          Ver los datos en tabla
        </summary>
        <div className="thin-scroll max-h-[260px] overflow-y-auto border-t border-line">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-mute">
                  Dia
                </th>
                {SERIES.map((s) => (
                  <th
                    key={s.key}
                    className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-[0.07em] text-ink-mute"
                  >
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((d) => (
                <tr key={d.day}>
                  <td className="code-type px-5 py-1.5 text-[11.5px] text-ink">{d.day}</td>
                  <td className="code-type px-3 py-1.5 text-right text-[11.5px]">
                    {d.searches}
                  </td>
                  <td className="code-type px-3 py-1.5 text-right text-[11.5px]">{d.views}</td>
                  <td className="code-type px-3 py-1.5 text-right text-[11.5px]">
                    {d.cartAdds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
