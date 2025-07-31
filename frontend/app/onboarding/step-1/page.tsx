"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect } from "next/navigation";

const organizations: Organization[] = [
    {
        id: 44993145,
        name: "sroy-dev",
        slug: "sroy-dev",
        provider: "github",
        avatar_url: "https://avatars.githubusercontent.com/u/44993145?v=4",
        created_at: "2018-11-13T05:37:17Z",
        updated_at: "2025-07-24T03:25:52Z",
    },
    {
        id: 165650485,
        name: "TeamChickenHQ",
        slug: "TeamChickenHQ",
        provider: "github",
        avatar_url: "https://avatars.githubusercontent.com/u/165650485?v=4",
        created_at: "2024-04-01T08:49:11Z",
        updated_at: "2024-04-01T09:36:02Z",
    },
];

const Step1Page = () => {
    const [selectedOrg, setSelectedOrg] = useState<string>("");

    const onStepComplete = () => {
        if (!selectedOrg) return;
        // You can add your API call or navigation logic here

        redirect(`/onboarding/step-2`);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Connect Your Organization
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        To analyze your Pull Requests and provide smart
                        feedback, PullSight needs access to your
                        organization&apos;s repositories. This is a secure,
                        standard connection via OAuth.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-6">
                    <div className="mb-4">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            Organizations list
                        </h3>

                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Loading organizations...
                            </p>
                        )}
                        {false && (
                            <p className="text-[var(--subtitle-400)]">
                                Error loading organizations. Please try again.
                            </p>
                        )}

                        {organizations.length > 0 && (
                            <SelectableList
                                items={organizations.map((org) => ({
                                    id: String(org.slug),
                                    title: org.name,
                                    subtitle: org.author,
                                    timestamp: org.time,
                                    avatar: org.avatar_url,
                                    updatedAt: org.updated_at,
                                }))}
                                selectedId={selectedOrg}
                                onSelect={(id) => setSelectedOrg(id)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Connect Organization"
                isEnabled={Boolean(selectedOrg) && !false}
                // isLoading={isPending}
                onClick={onStepComplete}
            />
        </>
    );
};

export default Step1Page;
