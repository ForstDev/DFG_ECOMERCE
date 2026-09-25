import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// The real DFG typeface, self-hosted the same way dfgtruckparts.com serves it:
// a commercial "Now" family, nine weights, renamed "DFG Now 2022" in their own
// CSS. Files were pulled from their own wp-content/uploads (fonts/dfg-now/),
// so the proposal reads as the brand rather than as a look-alike.
const dfgNow = localFont({
  variable: "--font-now",
  display: "swap",
  src: [
    { path: "../public/fonts/dfg-now/Now-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/dfg-now/Now-Black.woff2", weight: "900", style: "normal" },
  ],
});

// Reserved for part numbers, which are data and want tabular figures.
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
    <html lang="es" className={dfgNow.variable + " " + jetbrains.variable}>
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
