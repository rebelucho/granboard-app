import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Granboard App",
  description: "Application de jeu de fléchettes pour Granboard - Cricket, 01 et plus",
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  openGraph: {
    title: "Granboard App",
    description: "Application de jeu de fléchettes pour Granboard - Cricket, 01 et plus",
    images: ['/opengraph-image.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
