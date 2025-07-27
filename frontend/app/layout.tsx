import type { Metadata } from "next";
import "../styles/globals.css";

import { Plus_Jakarta_Sans } from "next/font/google";
import { TanstackProvider } from "@/providers/TanstackProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PullSight - Developer Performance Dashboard",
    description: "AI-powered code insights for your pull requests.",
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className={`${plusJakartaSans.className} dark`}>
            <body className={`antialiased `}>
                <AuthInitializer>
                    <TanstackProvider>
                        <div className="bg-[var(--body-900)] min-h-screen text-white">
                            {children}
                        </div>
                    </TanstackProvider>
                </AuthInitializer>
            </body>
        </html>
    );
};

export default RootLayout;
