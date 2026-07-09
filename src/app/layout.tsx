import type { Metadata } from "next";
import { Geist_Mono, Rajdhani, VT323 } from "next/font/google";

import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-readout",
  weight: "400",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-panel",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virtual CPU Simulator",
  description: "Step execution panel for a virtual CPU with 4-bit opcodes and 4-bit operands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} ${vt323.variable} ${rajdhani.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
