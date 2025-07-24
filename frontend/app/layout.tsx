import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PullSight - Developer Performance Dashboard",
    description: "AI-powered code insights for your pull requests.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.className} dark`}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased `}
            >
                <div className="bg-[var(--body-900)] min-h-screen text-white">
                    {children}
                </div>
            </body>
        </html>
    );
}
