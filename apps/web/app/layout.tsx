import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RentalAi",
  description: "AI-first property management system — Phase 0 scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <body
        className="antialiased"
        style={
          {
            ["--font-display" as string]: "var(--font-fraunces)",
            ["--font-body" as string]: "var(--font-source)",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
