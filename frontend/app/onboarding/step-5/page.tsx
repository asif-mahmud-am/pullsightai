"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect } from "next/navigation";
import { ROUTE_CONSTANTS } from "@/lib/constants";

const organizations: Organization[] = [
    {
        name: "sroy-dev",
        id: "44993145",
        nodeId: "MDQ6VXNlcjQ0OTkzMTQ1",
        url: "https://api.github.com/users/sroy-dev",
        reposUrl: "https://api.github.com/users/sroy-dev/repos",
        avatarUrl: "https://avatars.githubusercontent.com/u/44993145?v=4",
        type: "User",
    },
    {
        id: "165650485",
        name: "TeamChickenHQ",
        nodeId: "O_kgDOCd-gNQ",
        url: "https://api.github.com/orgs/TeamChickenHQ",
        reposUrl: "https://api.github.com/orgs/TeamChickenHQ/repos",
        avatarUrl: "https://avatars.githubusercontent.com/u/165650485?v=4",
        type: "Organization",
    },
];

const Step5Page = () => {
    const [selectedOrg, setSelectedOrg] = useState<string>("");

    const onStepComplete = () => {
        // You can add your API call or navigation logic here

        redirect(`/dashboard`);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Collaborate & Scale Your Code Quality
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        You&apos;ve seen the power of AI-driven feedback! Now,
                        invite your team members to experience faster reviews
                        and higher code quality together. The more, the merrier
                        (and smarter!).
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-6">
                    <div className="mb-4">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            Team members lists
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
                                    id: String(org.id),
                                    title: org.name,
                                    subtitle: org.author,
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
                buttonText="Send invites & go to Dashboard"
                isEnabled={true}
                // isLoading={isPending}
                onClick={onStepComplete}
                onBackClick={() => redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_5)}
            />
        </>
    );
};

export default Step5Page;
