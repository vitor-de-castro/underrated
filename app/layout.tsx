import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Underrated - Find Hidden Gems on Sorare",
  description: "Discover undervalued football players with AI-powered analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
