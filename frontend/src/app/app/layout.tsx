import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";
import { ReactNode } from "react";
import AppSideBar from "./SideBar";
import AppTopBar from "./TopBar";

const AppLayout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <AppTopBar />
                <div className="flex min-h-[calc(100vh-88px)] pt-[88px] pl-[260px]">
                    <AppSideBar />
                    <main className="flex-1 py-5 px-5">{children}</main>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default AppLayout;
