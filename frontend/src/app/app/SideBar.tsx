"use client";
import { NavLink } from "@/components/reusable/NavLink";
import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import {
    ChartLine,
    GitPullRequestArrow,
    House,
    Layers,
    PanelsTopLeft,
    Plus,
    Settings,
    Users,
} from "lucide-react";

const AppSideBar = () => {
    return (
        <header className="w-[260px] p-5 fixed h-[calc(100vh-88px)] left-0 bottom-0 top-[88px]">
            <SidebarMenu>
                <SidebarMenuItem>
                    <NavLink
                        className="inline-flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl"
                        activeClassName="bg-white text-gray-800"
                        href={ROUTE_CONSTANTS.APP_DASHBOARD}
                    >
                        <PanelsTopLeft className="h-4 w-4" />
                        <span className="text-base">Dashboard</span>
                    </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavLink
                        className="inline-flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl"
                        activeClassName="bg-white text-gray-800"
                        href={ROUTE_CONSTANTS.APP_REPOSITORIES}
                        prefetch
                    >
                        <Layers className="h-4 w-4" />
                        <span className="text-base">Repositories</span>
                    </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavLink
                        className="inline-flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl"
                        activeClassName="bg-white text-gray-800"
                        href={ROUTE_CONSTANTS.APP_PULL_REQUESTS}
                        prefetch
                    >
                        <GitPullRequestArrow className="h-4 w-4" />
                        <span className="text-base">Pull requests</span>
                    </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavLink
                        className="inline-flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl"
                        activeClassName="bg-white text-gray-800"
                        href={ROUTE_CONSTANTS.APP_TEAM_MEMBERS}
                        prefetch
                    >
                        <Users className="h-4 w-4" />
                        <span className="text-base">Team members</span>
                    </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavLink
                        className="inline-flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl"
                        activeClassName="bg-white text-gray-800"
                        href={ROUTE_CONSTANTS.APP_SETTINGS}
                        prefetch
                    >
                        <Settings className="h-4 w-4" />
                        <span className="text-base">Settings</span>
                    </NavLink>
                </SidebarMenuItem>
            </SidebarMenu>
        </header>
    );
};
export default AppSideBar;
