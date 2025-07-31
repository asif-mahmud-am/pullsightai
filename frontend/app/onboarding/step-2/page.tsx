"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const Step2Page = () => {
    const user = useAuthStore((s) => s.user);

    const handleInstall = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const baseUrl = `${apiUrl}/github/install?target_id=${user?.currentWorkspace}`;
        // Redirect to the GitHub installation URL
        window.location.href = baseUrl;
    };
    

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Install PullSight to Select Repositories
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        To analyze your Pull Requests and provide smart
                        feedback, PullSight needs access to your repositories.
                        This is a secure, standard connection via OAuth.
                    </p>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        You can select all repositories or specific ones during the installation process.
                    </p>
                    <Button className="!bg-white !text-black hover:!bg-gray-200 cursor-pointer" size={"xl"}  onClick={handleInstall}>
                        Install PullSight
                    </Button>
                </div>

                {/* Right column */}
                <div className="col-span-6">
                    <div className="mb-4">
                        
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            {/* <ActionFooter
                buttonText="Select Repository"
                isEnabled={Boolean(selectedRepo) && !false}
                onClick={onStepComplete}
                // isLoading={isPending}
                // backButtonText="Back"
                onBackClick={() => redirect("/onboarding/step-1")}
            /> */}
        </>
    );
};

export default Step2Page;
