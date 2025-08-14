import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";
import { ReactNode } from "react";
import DashboardPage from "./page";
import DashboardSidebar from "./dashboardSidebar";
import DashboardNavbar from "./dashboardNavbar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <div>
                    <DashboardNavbar />
                    <div className="flex h-screen">
                        <header className="bg-dark-900 shadow">
                            <div className="container mx-auto py-4">
                                <DashboardSidebar />
                            </div>
                        </header>
                        <main className="flex-1 container mx-auto py-4">
                            {children}
                        </main>
                    </div>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default DashboardLayout;
