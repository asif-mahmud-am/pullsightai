"use client";

import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { Repository } from "@/types/repository";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRepositoryQuery } from "@/api/queries/repository";
import { useUpdateUserMutation } from "@/api/queries/auth";
import { ROUTE_CONSTANTS } from "@/lib/constants";

const Step2Page = () => {
    const [selectedRepo, setSelectedRepo] = useState<string>("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github"; // Default to GitHub if not set
    const orgName = searchParams.get("name") as string;
    const installationId = searchParams.get("installationId") as string;

    // if (!orgName && !installationId) {
    //     redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
    // }

    const {
        data: repositories = [],
        isLoading,
        error,
    } = useRepositoryQuery({
        provider,
        orgName,
        ...(user?.provider === "github" ? { installationId } : {}),
    });

    const { mutateAsync: updateUser, isPending: isUpdatingUser } =
        useUpdateUserMutation();

    const onStepComplete = () => {
        if (!selectedRepo) return;
        // updateUser({
        //     onboardingStep: 4
        // }).then(() => {
        //     router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_4
        // }).catch((error) => {
        //     console.error("Error updating user:", error);
        // });
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Select Repositories for AI Analysis
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        Choose the repositories you&apos;d like PullSight to
                        monitor for Pull Requests. Our AI will automatically
                        analyze new or updated PRs in these repos to provide
                        instant feedback.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-6">
                    <div className="mb-4">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            Repositories list
                        </h3>

                        {isLoading && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading repositories...
                            </p>
                        )}
                        {error && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading repositories. Please try again.
                            </p>
                        )}

                        {repositories.length > 0 && (
                            <SelectableList
                                items={repositories.map((repo) => ({
                                    id: String(repo.id),
                                    title: repo.name,
                                    subtitle: repo.author?.name,
                                    timestamp: repo.pushedAt,
                                    avatar: repo.avatar_url,
                                }))}
                                selectedId={selectedRepo}
                                onSelect={(id) => setSelectedRepo(id)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Select Repository"
                isEnabled={Boolean(selectedRepo) && !false}
                onClick={onStepComplete}
                isLoading={isUpdatingUser || isLoading}
                onBackClick={() => redirect("/onboarding/step-1")}
            />
        </>
    );
};

export default Step2Page;
