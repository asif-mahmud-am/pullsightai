"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { PullRequest } from "@/types/pullRequest";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { usePullRequestQuery } from "@/api/queries/pullRequest";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Step3Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    if (!repoId) {
        redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
    }

    const [selectedPR, setSelectedPR] = useState<string>(prId || "");

    const {
        data: pullRequests,
        refetch: refetchPullRequests,
        isFetching,
        error,
    } = usePullRequestQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        repoId,
    });

    const onStepComplete = () => {
        if (!selectedPR) return;
        // You can add your API call or navigation logic here

        redirect(
            ROUTE_CONSTANTS.ONBOARDING_STEP_4 +
                `?prId=${selectedPR}&repoId=${repoId}`
        );
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Let&apos;s See the AI in Action on Your Code
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        We&apos;ve identified active Pull Requests in your
                        selected repositories. Choose one to generate your very
                        first AI-powered analysis right now!
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-8">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                PRs list
                            </h3>
                            {/* add another organization button here */}
                            <Button
                                variant="outline"
                                size="icon"
                                className=""
                                onClick={() => refetchPullRequests()}
                            >
                                <RefreshCw className="inline mr-1" />
                            </Button>
                        </div>
                        {isFetching && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading pull requests...
                            </p>
                        )}
                        {error && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading pull requests. Please try again.
                            </p>
                        )}

                        {!isFetching &&
                            pullRequests &&
                            pullRequests?.length > 0 && (
                                <SelectableList
                                    items={
                                        pullRequests?.map((pr) => ({
                                            id: String(pr.prNumber),
                                            title: pr.title,
                                            avatar:
                                                pr.user?.avatarUrl ||
                                                pr.author?.avatarUrl,
                                            subtitle:
                                                pr.user?.username ||
                                                pr?.author?.username,
                                            status: {
                                                label: pr.status,
                                                colorClass:
                                                    pr.status === "closed" ||
                                                    pr.status === "merged"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-green-500 text-white",
                                            },
                                            timestamp: pr.createdOn,
                                            updatedAt: pr.updatedOn,
                                        })) || []
                                    }
                                    selectedId={selectedPR}
                                    onSelect={(id) => setSelectedPR(id)}
                                />
                            )}
                        {!isFetching &&
                            pullRequests &&
                            pullRequests?.length === 0 && (
                                <p className="text-[var(--subtitle-400)]">
                                    No pull requests found for this repository.
                                </p>
                            )}
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText={false ? "Analyzing..." : "Analyze Pull Request"}
                isEnabled={Boolean(selectedPR) && !isFetching}
                isLoading={isFetching}
                onClick={onStepComplete}
                onBackClick={() => redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2)}
            />
        </>
    );
};

export default Step3Page;
