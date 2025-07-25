"use client";

import {
    CheckedIcon,
    CircleIcon,
    StepOnProgressIcon,
} from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { ReactNode } from "react";
import ProgressSteps from "./ProgressSteps";
import Image from "next/image";
import { usePathname } from "next/navigation";

const stepsData = [
    {
        index: 0,
        id: "git",
        label: "Git connected",
    },
    {
        index: 1,
        id: "org",
        label: "Connect Organization",
    },
    {
        index: 2,
        id: "repos",
        label: "Choose Repositories",
    },
    {
        index: 3,
        id: "prs",
        label: "Choose Pull Requests",
    },
    {
        index: 4,
        id: "ai",
        label: "Generate AI Analysis on PR",
    },
    {
        index: 5,
        id: "invite",
        label: "Invite Team Members",
    },
];

const OnboardingLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    // step number from pathname
    const stepMatch = pathname.match(/step-(\d+)/);
    const currentStep = stepMatch ? parseInt(stepMatch[1]) : 1;

    const steps = stepsData.map((step) => ({
        ...step,
        status:
            step.index < currentStep
                ? "complete"
                : step.index === currentStep
                ? "current"
                : "incomplete",
    })) as Array<{
        index: number;
        id: string;
        label: string;
        status: "complete" | "current" | "incomplete";
    }>;

    async function handleLogout(event: React.MouseEvent) {
        // try {
        //   await Api.post('/api/logout')
        //   window.location.reload()
        // } catch (error) {
        //   console.error('Logout failed:', error)
        // }
    }

    return (
        <div
            className="py-12 min-h-screen bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: "url('/images/gradient-bg.svg')" }}
        >
            <div className="container">
                <div className="mb-12">
                    <div className="flex justify-between">
                        <Image
                            src="/images/logo.svg"
                            alt="pullsight logo"
                            width={112}
                            height={40}
                            className=""
                        />
                        <Button
                            variant="outline"
                            className="text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4"
                            onClick={handleLogout}
                        >
                            <LogOutIcon />
                            Logout
                        </Button>
                    </div>

                    {!false && (
                        <ProgressSteps
                            steps={steps}
                            icons={{
                                complete: (
                                    <CheckedIcon
                                        size={15}
                                        className="fill-primary"
                                    />
                                ),
                                current: (
                                    <CircleIcon
                                        size={15}
                                        className="fill-[var(--title-50)]"
                                    />
                                ),
                                incomplete: (
                                    <CircleIcon
                                        size={15}
                                        className="fill-[var(--overbox-600)]"
                                    />
                                ),
                                progressBar: <StepOnProgressIcon />, // only used on current
                            }}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-5 mx-auto justify-between mt-[64px] min-h-[calc(100vh-300px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
