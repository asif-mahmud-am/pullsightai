"use client";

import { useUpdateUserMutation } from "@/api/queries/auth";
import LogoutHandler from "@/components/auth/LogoutHandler";
import Dropdown from "@/components/reusable/Dropdown";
import { ProgressIcon } from "@/components/reusable/icons";
import { Button } from "@/components/ui/button";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { getRemainingDays } from "@/lib/dayjs";
import showToast from "@/lib/toast";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, LogOutIcon, Plus, Rocket, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Fragment, use } from "react";

const AppTopBar = () => {
    const { user, workspaces, selectedWorkspace, setSelectedWorkspace } =
        useAuthStore((s) => s);
    const { toggleSidebar, isSidebarOpen } = useAppStore();

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUserMutation();

    const onboardedWorkspaces = workspaces?.filter(
        (workspace) =>
            !workspace.onboardingStep || workspace.onboardingStep == 0
    );
    const isTrialPlan = selectedWorkspace?.currentPlan?.plan?.isDefault;

    // Custom 3x3 Grid Icon Component
    const GridIcon = () => (
        <div className="w-4 h-4 grid grid-cols-3 gap-[2px]">
            {Array.from({ length: 9 }).map((_, i) => (
                <div
                    key={i}
                    className="w-[3px] h-[3px] bg-current rounded-[1px]"
                />
            ))}
        </div>
    );

    const handleAddNewWorkspace = () => {
        updateUser({
            currentWorkspace: null,
        }).then(() => {
            redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
        });
    };

    const handleWorkspaceChange = async (workspaceId: string) => {
        if (selectedWorkspace?._id === workspaceId) {
            return;
        }

        await updateUser({
            currentWorkspace: workspaceId,
            updateState: false, // for not updating state of selectedWorkspace
        }).then(() => {
            window.location.reload();
            // showToast.success("Organization switched successfully!");
        });
    };

    return (
        <div className="xl:h-[88px] h-[60px] flex items-center border-b gap-x-4 xl:px-5 pr-3 pl-1 fixed top-0 left-0 right-0 z-40 bg-background">
            <Button
                variant="ghost"
                className="xl:hidden relative px-3"
                onClick={toggleSidebar}
            >
                <div className="relative w-4 h-4">
                    {/* Grid Icon */}
                    <div
                        className={`absolute inset-0 transition-all duration-300 ${
                            isSidebarOpen
                                ? "opacity-0 rotate-90 scale-75"
                                : "opacity-100 rotate-0 scale-100"
                        }`}
                    >
                        <GridIcon />
                    </div>

                    {/* Cross Icon */}
                    <div
                        className={`absolute -left-0.5 -top-0.5 transition-all duration-300 ${
                            isSidebarOpen
                                ? "opacity-100 rotate-0 scale-100"
                                : "opacity-0 rotate-90 scale-75"
                        }`}
                    >
                        <X className="!h-5 !w-5" />
                    </div>
                </div>
            </Button>
            <Image
                src="/images/logo-icon.svg"
                alt="pull sight logo"
                width={23}
                height={37}
                className="xl:h-auto w-auto h-[30px]"
            />
            <span className="text-base font-medium mr-auto hidden md:inline">
                Welcome back, {user?.displayName} 👋
            </span>

            {isTrialPlan && (
                <div className="text-sm text-gray-400 bg-yellow-400/20 rounded-xl py-2 px-3 mx-auto  hidden lg:inline-flex items-center gap-5">
                    <ProgressIcon className="animate-spin" />
                    <div>
                        <div className="text-white font-semibold">
                            {getRemainingDays(
                                selectedWorkspace?.currentPlan?.periodEnd || ""
                            )}{" "}
                            day(s) left in your free trial
                        </div>
                        <div>7/10 code reviews used</div>
                    </div>
                    <Link
                        className="gap-1 flex items-center bg-yellow-400 text-neutral-900 rounded-md px-2 py-1.5 text-sm font-medium"
                        href={ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS}
                    >
                        Upgrade Now
                        <Rocket className="h-4 w-auto" />
                    </Link>
                </div>
            )}

            <Dropdown>
                <Dropdown.Trigger>
                    <Button
                        variant="ghost"
                        className="justify-between ml-auto bg-[var(--box-800)] flex items-center !h-auto !px-3 rounded-2xl gap-3 xl:gap-5 w-[150px] xl:w-[214px]"
                    >
                        <div className="text-left flex-shrink-0 min-w-0 flex-1">
                            <div className="truncate">
                                {selectedWorkspace?.name}
                            </div>
                            <div className="opacity-60 text-xs truncate">
                                {user?.email || "n/a"}
                            </div>
                        </div>
                        <ChevronDown className="flex-shrink-0" />
                    </Button>
                </Dropdown.Trigger>
                <Dropdown.Content className="py-3 px-1 w-[214px] flex flex-col">
                    <div className="text-xs uppercase text-muted px-2">
                        Switch Organization
                    </div>
                    <div className="mt-3 mb-3 space-y-1">
                        {onboardedWorkspaces?.map((ws) => {
                            if (typeof ws === "string")
                                return <Fragment key={ws} />;
                            return (
                                <div
                                    key={ws._id}
                                    className={`py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors ${
                                        selectedWorkspace?._id === ws._id
                                            ? "bg-neutral-800"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleWorkspaceChange(ws._id)
                                    }
                                >
                                    {ws.name}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center">
                        <Button
                            variant="outline"
                            className="!border-primary text-primary"
                            size="xs"
                            onClick={handleAddNewWorkspace}
                        >
                            <Plus />
                            Add new organization
                        </Button>
                    </div>
                    <hr className="my-4 mx-2" />
                    <LogoutHandler asChild>
                        <Button
                            variant="outline"
                            className="mx-2 text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4 "
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
