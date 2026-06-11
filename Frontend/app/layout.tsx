import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScrumHub Enterprise",
  description: "Gestao Scrum, projetos, forum interno e colaboracao corporativa.",
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
