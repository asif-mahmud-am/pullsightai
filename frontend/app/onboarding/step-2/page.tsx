"use client";

import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRepositoryQuery } from "@/api/queries/repository";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Step2Page = () => {
    const [selectedRepo, setSelectedRepo] = useState<string>("");

    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";

    // if (!orgName && !installationId) {
    //     redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
    // }

    const {
        data: repositories = [],
        refetch: refetchRepositories,
        isFetching,
        error,
    } = useRepositoryQuery({
        provider,
    });

    const onStepComplete = () => {
        if (!selectedRepo) return;
        router.push(
            ROUTE_CONSTANTS.ONBOARDING_STEP_3 + `?repoId=${selectedRepo}`
        );
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                Repositories List{" "}
                            </h3>
                            {/* add another organization button here */}
                            <Button
                                variant="outline"
                                size="icon"
                                className=""
                                onClick={() => refetchRepositories()}
                            >
                                <RefreshCw className="inline mr-1" />
                            </Button>
                        </div>
                        {isFetching && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading repositories...
                            </p>
                        )}
                        {error && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading repositories. Please try again.
                            </p>
                        )}

                        {!isFetching && repositories.length > 0 && (
                            <SelectableList
                                items={repositories.map((repo) => ({
                                    id: String(repo.name),
                                    title: repo.name,
                                    subtitle: repo.author?.name,
                                    avatar: repo.author?.avatarUrl,
                                    timestamp: repo.createdAt,
                                    updatedAt: repo.updatedAt,
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
                isEnabled={Boolean(selectedRepo) && !isFetching}
                onClick={onStepComplete}
                isLoading={isFetching}
                onBackClick={() => redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1)}
            />
        </>
    );
};

export default Step2Page;
