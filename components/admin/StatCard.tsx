export function StatCard({
  label,
  value,
  accent = false,
  compact = false,
  warn = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
  compact?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={"bg-paper " + (compact ? "px-4 py-4" : "px-5 py-6")}>
      <p
        className={
          "code-type font-bold leading-none tracking-tight " +
          (compact ? "text-[22px]" : "text-[32px]") +
          " " +
          (accent ? "text-red" : warn && value > 0 ? "text-ink-soft" : "text-ink")
        }
      >
        {value.toLocaleString("es")}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase leading-tight tracking-[0.07em] text-ink-mute">
        {label}
      </p>
    </div>
  );
}
