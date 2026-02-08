import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Talk2SQL - Natural Language Database Queries",
  description: "Query your databases naturally using AI-powered natural language processing",
  icons: {
    icon: [
      {
        url: "/app_icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        url: "/app_icon.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/app_icon.png",
        sizes: "32x32", 
        type: "image/png",
      },
    ],
    shortcut: "/app_icon.png",
    apple: "/app_icon.png",
    other: [
      {
        rel: "icon",
        url: "/app_icon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
