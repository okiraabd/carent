import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Carent — Sewa Action Camera Premium",
    template: "%s | Carent",
  },
  description:
    "Sewa action camera GoPro, DJI, dan Insta360 untuk petualangan outdoor, touring, dan konten kreator. Harga terjangkau, unit premium, proses mudah.",
  keywords: [
    "sewa action camera",
    "rental GoPro",
    "sewa kamera",
    "action camera rental",
    "DJI rental",
    "Insta360 sewa",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark", "font-sans", geist.variable)}>
      <body className="min-h-screen bg-surface-0 text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
