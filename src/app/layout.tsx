import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeAgent-DCR | Deterministic Checkpoint Reconciliation",
  description: "Preventing duplicate external actions when AI agent state rolls back",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#080c14] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 tech-grid">
        {children}
      </body>
    </html>
  );
}
