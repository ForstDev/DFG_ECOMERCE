import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="code-type text-[13px] font-bold text-red">404</p>
      <h1 className="mt-3 text-[30px] font-bold uppercase leading-none tracking-tight md:text-[42px]">
        No encontramos esa página
      </h1>
      <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-ink-mute">
        El repuesto puede haber cambiado de código. Busca por número de parte o
        por descripción en el catálogo.
      </p>
      <Link
        href="/catalogo"
        className="mt-8 bg-ink px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-red"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
