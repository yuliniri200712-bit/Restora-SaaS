import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restora | Gestión para restaurantes",
  description:
    "Organiza la operación de tu restaurante con Restora, la plataforma creada para crecer con claridad.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
