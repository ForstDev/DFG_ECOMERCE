import Link from "next/link";
import { getStats } from "@/lib/stats";
import { StatCard } from "@/components/admin/StatCard";
import { RankList } from "@/components/admin/RankList";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { ResetEvents } from "@/components/admin/ResetEvents";

export const dynamic = "force-dynamic";

const pct = (n: number) => (n * 100).toFixed(1).replace(".", ",") + "%";

export default function AdminDashboard() {
  const s = getStats(30);
  const noActivity = s.totals.searches + s.totals.views + s.totals.cartAdds === 0;

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[28px] font-bold uppercase leading-none tracking-tight md:text-[38px]">
            Indicadores
          </h1>
          <p className="mt-2 text-[13px] text-ink-mute">
            Últimos {s.range.days} días, del {s.range.from} al {s.range.to}.
          </p>
        </div>
        <ResetEvents />
      </header>

      {noActivity && (
        <div className="mt-6 border border-line bg-paper px-5 py-4">
          <p className="text-[13.5px] font-semibold text-ink">Todavía no hay actividad</p>
          <p className="mt-1 max-w-[70ch] text-[12.5px] leading-relaxed text-ink-mute">
            Los indicadores se llenan solos con el uso de la tienda. Navega el{" "}
            <Link href="/catalogo" className="font-semibold text-red underline underline-offset-2">
              catálogo
            </Link>
            , busca un código y agrega algo a una cotización para verlos aparecer.
          </p>
        </div>
      )}

      <section className="mt-6 grid grid-cols-2 gap-px bg-line lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Búsquedas" value={s.totals.searches} />
        <StatCard label="Fichas vistas" value={s.totals.views} />
        <StatCard label="Agregados a cotizar" value={s.totals.cartAdds} />
        <StatCard label="Unidades agregadas" value={s.totals.cartUnits} />
        <StatCard label="Cotizaciones enviadas" value={s.totals.quotes} accent />
        <StatCard label="Unidades cotizadas" value={s.totals.quotedUnits} accent />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ActivityChart data={s.daily} />

        <div className="border border-line bg-paper">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">
              Tasas de conversión
            </h2>
          </div>
          <dl className="divide-y divide-line">
            <Rate
              term="Ficha vista que termina en cotización"
              value={pct(s.rates.viewToCart)}
              hint="Cuánto de lo que se mira se agrega a la lista."
            />
            <Rate
              term="Listas que se envían por WhatsApp"
              value={pct(s.rates.cartToQuote)}
              hint="Cotizaciones enviadas sobre ítems agregados."
            />
            <Rate
              term="Búsquedas sin resultados"
              value={pct(s.rates.zeroResultShare)}
              hint="Demanda que el catálogo no está cubriendo."
              warn={s.rates.zeroResultShare > 0.15}
            />
          </dl>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankList
          title="Búsquedas más frecuentes"
          subtitle="Lo que los clientes escriben en el buscador."
          items={s.topSearches}
          hrefFor={(i) => "/catalogo?q=" + encodeURIComponent(i.label)}
          empty="Sin búsquedas registradas todavía."
        />
        <RankList
          title="Búsquedas sin resultados"
          subtitle="Códigos y términos que el catálogo no cubre. La lista de compras."
          items={s.zeroSearches}
          tone="warn"
          empty="Ninguna búsqueda quedó sin resultados."
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankList
          title="Repuestos más vistos"
          subtitle="Fichas abiertas, por código."
          items={s.topViewed}
          hrefFor={(i) => "/producto/" + i.key}
          empty="Sin fichas vistas todavía."
        />
        <RankList
          title="Más agregados a cotización"
          subtitle="Ordenado por unidades, no por clics."
          items={s.topCarted}
          hrefFor={(i) => "/producto/" + i.key}
          unit="und"
          empty="Sin items agregados todavía."
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankList
          title="Familias más consultadas"
          items={s.topFamilies}
          hrefFor={(i) => "/catalogo?familia=" + encodeURIComponent(i.label)}
          empty="Sin datos de familias todavía."
        />
        <RankList
          title="Filtros más usados"
          subtitle="Qué facetas usan para llegar al repuesto."
          items={s.topFilters}
          empty="Sin filtros aplicados todavía."
        />
      </section>

      <section className="mt-6 border border-line bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">
            Salud del catálogo
          </h2>
          <p className="text-[11.5px] text-ink-mute">
            Importado el {s.health.generatedAt.slice(0, 10)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Repuestos" value={s.health.products} compact />
          <StatCard label="Con foto" value={s.health.withImage} compact />
          <StatCard
            label="Sin foto"
            value={s.health.withoutImage}
            compact
            warn={s.health.withoutImage > 0}
          />
          <StatCard label="Sin subfamilia" value={s.health.withoutSubfamily} compact warn />
          <StatCard label="Editados a mano" value={s.health.edited} compact />
          <StatCard label="Familias" value={s.health.families} compact />
          <StatCard label="Líneas" value={s.health.brands} compact />
        </div>

        <div className="border-t border-line px-5 py-4">
          <p className="max-w-[80ch] text-[12.5px] leading-relaxed text-ink-mute">
            {s.health.withoutImage} repuestos no traen fotografía en el excel y{" "}
            {s.health.withoutSubfamily} no tienen subfamilia asignada. Ambas cosas se
            corrigen desde{" "}
            <Link
              href="/admin/productos?estado=sin-foto"
              className="font-semibold text-red underline underline-offset-2"
            >
              Productos
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function Rate({
  term,
  value,
  hint,
  warn = false,
}: {
  term: string;
  value: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <dt className="text-[13px] font-semibold text-ink">{term}</dt>
        <dd className="mt-1 text-[12px] leading-snug text-ink-mute">{hint}</dd>
      </div>
      <span
        className={
          "code-type shrink-0 text-[20px] font-bold " + (warn ? "text-red" : "text-ink")
        }
      >
        {value}
      </span>
    </div>
  );
}
