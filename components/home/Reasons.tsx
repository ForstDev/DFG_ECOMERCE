import { Reveal } from "@/components/ui/Reveal";

/**
 * The brand argument, taken from the copy DFG already publishes. Laid out as
 * one lead block plus two supporting ones rather than three identical cards,
 * so the hierarchy says which claim carries the most weight.
 */
const REASONS = [
  {
    title: "Más de 10 años de experiencia",
    body: "Proveedores y clientes en todo el mundo respaldan el know-how de DFG, y hacen de la marca un socio confiable y rentable para la red de negocio del mercado automotor.",
  },
  {
    title: "Calidad comprobada",
    body: "Los procesos de calidad y performance se revisan de forma constante, bajo los estándares más altos del mundo automotriz.",
  },
  {
    title: "Socio estratégico",
    body: "Productos competitivos en performance a un precio accesible para toda la cadena comercial. El cliente final obtiene un producto de alta calidad a precio justo.",
  },
];

export function Reasons() {
  return (
    <section className="shell pb-20 md:pb-28">
      <div className="grid gap-px border border-line bg-line md:grid-cols-12">
        <Reveal className="bg-paper p-8 md:col-span-7 md:p-12">
          <h2 className="max-w-[15ch] text-[28px] font-bold uppercase leading-[0.98] tracking-tight md:text-[42px]">
            {REASONS[0].title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[14px] leading-relaxed text-ink-mute md:text-[15px]">
            {REASONS[0].body}
          </p>
          <p className="mt-8 max-w-[52ch] border-t border-line pt-6 text-[13.5px] leading-relaxed text-ink-soft">
            Calidad y experiencia. Esas dos cosas nos hacen la mejor opción
            disponible en el mercado.
          </p>
        </Reveal>

        <div className="grid gap-px bg-line md:col-span-5">
          {REASONS.slice(1).map((r, i) => (
            <Reveal
              key={r.title}
              delay={0.08 + i * 0.08}
              className="bg-paper p-8 md:p-10"
            >
              <h3 className="text-[19px] font-bold uppercase leading-[1.05] tracking-tight md:text-[23px]">
                {r.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-mute">
                {r.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
