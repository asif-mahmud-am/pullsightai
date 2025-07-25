const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-screen">
            <header className="bg-dark-900 shadow">
                <div className="container mx-auto py-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
            </header>
            <main className="flex-1 container mx-auto py-4">{children}</main>
        </div>
    );
};

export default DashboardLayout;
