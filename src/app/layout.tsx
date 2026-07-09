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
  title: "仮想計算機シミュレータ",
  description: "4bit opcode / 4bit*3 operand の仮想CPUをステップ実行するパネル",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistMono.variable} ${vt323.variable} ${rajdhani.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
