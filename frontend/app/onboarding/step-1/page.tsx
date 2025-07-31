"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationQuery } from "@/api/queries/organization";
import { useUpdateUserMutation } from "@/api/queries/auth";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const organizations: Organization[] = [
    {
        "name": "sroy-dev",
        "id": "44993145",
        "nodeId": "MDQ6VXNlcjQ0OTkzMTQ1",
        "url": "https://api.github.com/users/sroy-dev",
        "reposUrl": "https://api.github.com/users/sroy-dev/repos",
        "avatarUrl": "https://avatars.githubusercontent.com/u/44993145?v=4",
        "type": "User"
    },
    {
        "id": "165650485",
        "name": "TeamChickenHQ",
        "nodeId": "O_kgDOCd-gNQ",
        "url": "https://api.github.com/orgs/TeamChickenHQ",
        "reposUrl": "https://api.github.com/orgs/TeamChickenHQ/repos",
        "avatarUrl": "https://avatars.githubusercontent.com/u/165650485?v=4",
        "type": "Organization"
    }
]

const Step1Page = () => {
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github"; // Default to GitHub if not set
    
    const router = useRouter();

    const {
        data: organizations = [],
        isLoading
    } = useOrganizationQuery({ provider });

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser
    } = useUpdateUserMutation();

    const onStepComplete = async () => {
        if (!selectedOrg) return;
        updateUser({
            currentWorkspace: selectedOrg,
            onboardingStep: 2
        }).then(() => {
            router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
        }).catch((error) => {
            console.error("Error updating user:", error);
        });
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

                        {organizations?.length > 0 && (
                            <SelectableList
                                items={organizations?.map((org : Organization) => ({
                                    id: String(org.id),
                                    title: org.name,
                                    subtitle: org.name,
                                    avatar: org.avatarUrl,
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
                isLoading={isLoading || isUpdatingUser}
                onClick={onStepComplete}
            />
        </>
    );
};

export default Step1Page;
