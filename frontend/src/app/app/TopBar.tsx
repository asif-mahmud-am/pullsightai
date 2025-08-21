"use client";

import LogoutHandler from "@/components/auth/LogoutHandler";
import Dropdown from "@/components/reusable/Dropdown";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, LogOutIcon } from "lucide-react";
import Image from "next/image";
import { use } from "react";

const AppTopBar = () => {
    const user = useAuthStore((s) => s.user);

    const handleInstall = () => {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const baseUrl = `${apiUrl}/github/install`;
        // Redirect to the GitHub installation URL
        window.location.href = baseUrl;
    };

    return (
        <div className="h-[88px] flex items-center border-b gap-x-4 px-5 fixed top-0 left-0 right-0 z-50 bg-background">
            <Image
                src="/images/logo-icon.svg"
                alt="pull sight logo"
                width={23}
                height={37}
                className="h-auto w-auto"
            />
            <span className="text-base font-medium">
                Welcome back, Ralph 👋
            </span>

            <Dropdown>
                <Dropdown.Trigger>
                    <Button
                        variant="ghost"
                        className="ml-auto bg-[var(--box-800)] flex items-center !h-auto !px-4 rounded-2xl gap-5"
                    >
                        <div className="text-left">
                            <div>
                                {user?.currentWorkspace &&
                                    typeof user.currentWorkspace !== "string" &&
                                    user.currentWorkspace.name}
                            </div>
                            <div className="opacity-60 text-sm">
                                {user?.email || "n/a"}
                            </div>
                        </div>
                        <ChevronDown />
                    </Button>
                </Dropdown.Trigger>
                <Dropdown.Content className="py-3 px-2">
                    <div className="text-xs uppercase text-muted px-2">
                        Switch Organization
                    </div>
                    <div className="my-2">
                        <div className="py-3 px-2">
                            {user?.currentWorkspace &&
                            typeof user.currentWorkspace !== "string"
                                ? user.currentWorkspace.name
                                : null}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            className=""
                            size="sm"
                            onClick={handleInstall}
                        >
                            Add new organization
                        </Button>
                    </div>
                    <hr className="my-3" />
                    <LogoutHandler asChild>
                        <Button
                            variant="outline"
                            className="text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4 w-full"
                        >
                            <LogOutIcon />
                            Logout
                        </Button>
                    </LogoutHandler>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
};

export default AppTopBar;
