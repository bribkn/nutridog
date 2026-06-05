import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriDog - Dispensador Inteligente y Nutrición Personalizada",
  description: "Monitorea la alimentación de tu mascota, calcula sus necesidades energéticas diarias (Kcal) y controla el dispensador inteligente NutriDog para prevenir y tratar la obesidad.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriDog",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981", // Emerald 500
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}

