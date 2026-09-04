import type { Metadata } from "next";
import { readSettings } from "@/lib/store";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <header className="border-b border-line pb-6">
        <h1 className="text-[28px] font-bold uppercase leading-none tracking-tight md:text-[38px]">
          Ajustes
        </h1>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-ink-mute">
          Datos de contacto y el mensaje con el que sale cada cotización por
          WhatsApp.
        </p>
      </header>

      <SettingsForm settings={readSettings()} />
    </div>
  );
}
