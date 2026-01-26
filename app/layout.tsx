import type { Metadata } from "next";
import { Inter, Raleway } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
});

export const metadata: Metadata = {
  title: "EcoLimpio - Limpieza Ecológica en Barcelona",
  description: "Servicios profesionales de limpieza ecológica para vehículos, entradas, ventanas y más en Barcelona. ¡Solicita tu presupuesto gratis!",
  keywords: "limpieza, ecológico, Barcelona, lavado de coches, limpieza de ventanas, limpieza de entradas",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    images: ['/logo_wide.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${raleway.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
