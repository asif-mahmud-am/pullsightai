"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { PullRequest } from "@/types/pullRequest";
import { redirect } from "next/navigation";

const pullRequests: PullRequest[] = [
    {
        external_id: 1,
        title: "Web app init",
        number: 1,
        state: "closed",
        merged: false,
        user: {
            login: "khairul111010",
            avatar_url: "https://avatars.githubusercontent.com/u/44225180?v=4",
        },
        html_url: "https://github.com/TeamChickenHQ/icchamoto/pull/1",
        created_at: "2024-04-01T09:45:51.000000Z",
        additions: 0,
        deletions: 0,
        changed_files: 0,
        provider: "github",
    },
];

const Step3Page = () => {
    const [selectedPR, setSelectedPR] = useState<string>("");

    const onStepComplete = () => {
        if (!selectedPR) return;
        // You can add your API call or navigation logic here

        redirect(`/onboarding/step-4`);
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
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            PRs list
                        </h3>

                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading pull requests...
                            </p>
                        )}
                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading pull requests. Please try again.
                            </p>
                        )}

                        {pullRequests.length > 0 && (
                            <SelectableList
                                items={pullRequests.map((pr) => ({
                                    id: String(pr.id),
                                    title: pr.title,
                                    timestamp: pr.time,
                                    avatar: pr.avatar_url,
                                    subtitle: pr.user.login,
                                    status: {
                                        label: pr.state,
                                        colorClass:
                                            pr.state === "closed"
                                                ? "bg-red-500 text-white"
                                                : "bg-green-500 text-white",
                                    },
                                    updatedAt: pr.updated_at,
                                }))}
                                selectedId={selectedPR}
                                onSelect={(id) => setSelectedPR(id)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText={false ? "Analyzing..." : "Analyze Pull Request"}
                isEnabled={Boolean(selectedPR) && !false}
                onClick={onStepComplete}
                onBackClick={() => redirect("/onboarding/step-2")}
                onSkipClick={() => redirect("/dashboard")}
            />
        </>
    );
};

export default Step3Page;
