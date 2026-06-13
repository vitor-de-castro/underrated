import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Underrated - Find Hidden Gems on Sorare",
  description: "Discover undervalued football players with AI-powered analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23000000%22/><text x=%2250%22 y=%2275%22 font-size=%2270%22 fill=%22%23BDBDBD%22 font-family=%22sans-serif%22 font-weight=%22bold%22 text-anchor=%22middle%22>U</text></svg>",
  },
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
