import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ouroboros",
  description: "Ouroboros: gestão de projetos, fórum interno e colaboração em equipe.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/ouroboros-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/ouroboros-icon-apple.png", sizes: "180x180" }],
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
