import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Underrated - Find Hidden Gems on Sorare",
  description: "Discover undervalued football players with AI-powered analysis",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
