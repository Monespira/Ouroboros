import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRUB | CIEE Rio",
  description: "Programa SCRUB para gestão Scrum, fórum interno e colaboração do CIEE Rio.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/scrub-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/scrub-icon-apple.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
