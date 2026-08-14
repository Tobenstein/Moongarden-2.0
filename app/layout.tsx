import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moon Garden — A place to grow",
  description: "A gentle space where small acts of care help your personal world grow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
