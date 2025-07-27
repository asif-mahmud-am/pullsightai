import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <div className="flex flex-col h-screen">
                    <header className="bg-dark-900 shadow">
                        <div className="container mx-auto py-4">
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                        </div>
                    </header>
                    <main className="flex-1 container mx-auto py-4">
                        {children}
                    </main>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default DashboardLayout;
