import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PullSight - Developer Performance Dashboard",
    description: "AI-powered code insights for your pull requests.",
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className={`${plusJakartaSans.className} dark`}>
            <body className={`antialiased `}>
                <div className="bg-[var(--body-900)] min-h-screen text-white">
                    {children}
                </div>
            </body>
        </html>
    );
};

export default RootLayout;
