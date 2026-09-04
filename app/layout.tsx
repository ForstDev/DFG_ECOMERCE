import type { Metadata, Viewport } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Montserrat is the typeface dfgtruckparts.com already runs on. The mono face
// is reserved for part numbers, which are data and want tabular figures.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "DFG Truck Parts | Repuestos para buses y camiones pesados",
    template: "%s | DFG Truck Parts",
  },
  description:
    "Catálogo de repuestos alternativos para buses y camiones pesados. Más de 1.800 items para Volvo, Scania, Mercedes Benz, USA y otras líneas.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={montserrat.variable + " " + jetbrains.variable}>
      <head>
        {/*
          Motion renders its `initial` values as inline styles on the server, so
          without JavaScript every scroll reveal would stay at opacity 0 and the
          page would look empty. This resets them so the content is readable
          even when the bundle never arrives.
        */}
        <noscript>
          <style>{"[style*='opacity:0'],[style*='opacity: 0']{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
