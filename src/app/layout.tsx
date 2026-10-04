import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

// Lexend: diseñada para facilitar la lectura; números claros y cero sin barra
// (Atkinson Hyperlegible tacha el cero y confundía los montos).
const appFont = Lexend({
  subsets: ["latin"],
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: "FUNMIAVEN · Gestión de donaciones",
  description:
    "Sistema web interno de control de donaciones para FUNMIAVEN (Next.js + Supabase).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${appFont.variable} h-full antialiased`}>
      <body
        className={`${appFont.className} flex min-h-full flex-col bg-page text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
