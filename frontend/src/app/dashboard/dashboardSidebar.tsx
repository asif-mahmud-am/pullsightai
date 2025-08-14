import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import {
    ChartLine,
    GitPullRequestArrow,
    House,
    Layers,
    PanelsTopLeft,
    Plus,
    Settings,
} from "lucide-react";
import Link from "next/link";

const DashboardSidebar = () => {
    return (
        <div className="w-[260px] flex justify-center items-center  h-full">
            <SidebarMenu className="flex-1 ">
                <SidebarMenuItem>
                    <Link
                        className="flex font-semibold gap-4 text-[#FAFAFA] px-2 py-4 px-2 py-4"
                        href="/dashboard"
                    >
                        <PanelsTopLeft className="w-4 h-6 text-[#FAFAFA]" />
                        <span className="font-semibold text-[#FAFAFA]">
                            DashBoard
                        </span>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link
                        className="flex font-semibold gap-4 text-[#FAFAFA] px-2 py-4 "
                        href="/dashboard/repositories"
                    >
                        <Layers className="w-4 h-6 text-[#FAFAFA]" />
                        <span className="text-[#FAFAFA]">Repositories</span>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link
                        className="flex font-semibold gap-4 text-[#FAFAFA] px-2 py-4 "
                        href="/dashboard/pull-requests"
                    >
                        <GitPullRequestArrow className="w-4 h-6 text-[#FAFAFA]" />
                        <span className="text-[#FAFAFA]">Pull requests</span>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link
                        className="flex font-semibold gap-4 text-[#FAFAFA] px-2 py-4 "
                        href="/dashboard/team-activity"
                    >
                        <ChartLine className="w-4 h-6 text-[#FAFAFA]" />
                        <span className="text-[#FAFAFA]">Team activity</span>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link
                        className="flex font-semibold gap-4 text-[#FAFAFA] px-2 py-4 "
                        href="/dashboard/settings"
                    >
                        <Settings className="w-4 h-6 text-[#FAFAFA]" />
                        <span className="text-[#FAFAFA]">Settings</span>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    );
};
export default DashboardSidebar;
