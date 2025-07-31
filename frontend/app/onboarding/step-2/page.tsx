"use client";

import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { Repository } from "@/types/repository";
import { redirect } from "next/navigation";

const repositories: Repository[] = [
    {
        external_id: 1024379966,
        name: "icchamoto-web",
        slug: "icchamoto-web",
        provider: "github",
        owner_name: "TeamChickenHQ",
        owner_avatar: "https://avatars.githubusercontent.com/u/165650485?v=4",
        avatar_url: null,
        created_at: "2025-07-22T15:54:03Z",
        updated_at: "2025-07-22T15:54:03Z",
    },
    {
        external_id: 780344021,
        name: "icchamoto",
        slug: "icchamoto",
        provider: "github",
        owner_name: "TeamChickenHQ",
        owner_avatar: "https://avatars.githubusercontent.com/u/165650485?v=4",
        avatar_url: null,
        created_at: "2024-04-01T09:18:10Z",
        updated_at: "2024-04-01T09:18:10Z",
    },
];

const Step2Page = () => {
    const [selectedRepo, setSelectedRepo] = useState<string>("");

    const onStepComplete = () => {
        if (!selectedRepo) return;
        // You can add your API call or navigation logic here

        redirect(`/onboarding/step-3`);
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

                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading repositories...
                            </p>
                        )}
                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading repositories. Please try again.
                            </p>
                        )}

                        {repositories.length > 0 && (
                            <SelectableList
                                items={repositories.map((repo) => ({
                                    id: String(repo.slug),
                                    title: repo.name,
                                    subtitle: repo.author,
                                    timestamp: repo.time,
                                    avatar: repo.avatar_url,
                                    updatedAt: repo.updated_at,
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
                // isLoading={isPending}
                // backButtonText="Back"
                onBackClick={() => redirect("/onboarding/step-1")}
            />
        </>
    );
};

export default Step2Page;
