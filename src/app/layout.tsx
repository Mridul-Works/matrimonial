import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sain Smajh Matrimonial — Indian Matrimonial Profiles",
  description: "Browse verified matrimonial profiles. Login required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-hidden bg-linear-to-b from-pink-50 via-rose-50/50 to-white dark:from-zinc-950 dark:via-black dark:to-black">
        <SiteHeader />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
