"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationQuery } from "@/api/queries/organization";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateUserMutation } from "@/api/queries/auth";

const Step1Page = () => {
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github"; // Default to GitHub if not set

    const router = useRouter();

    const {
        data: organizations,
        isLoading,
        error,
    } = useOrganizationQuery({ provider });

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUserMutation();

    const onStepComplete = async () => {
        if (!selectedOrg) return;

        updateUser({
            currentWorkspace: selectedOrg._id,
        })
            .then(() => {
                // Redirect to the next step after updating user
                router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                // Handle error (e.g., show a notification)
            });

        // if (
        //     provider === "github" &&
        //     user?.currentWorkspace?.id !== selectedOrg.id
        // ) {
        //     router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
        // } else {
        //     router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
        // }
    };

    const handleInstall = () => {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const baseUrl = `${apiUrl}/github/install`;
        // Redirect to the GitHub installation URL
        window.location.href = baseUrl;
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
                    <div className="mb-4 bg-[var(--body-900)] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                Organizations list
                            </h3>
                            {/* add another organization button here */}
                            <Button
                                variant="outline"
                                className=""
                                onClick={handleInstall}
                            >
                                <Plus className="inline mr-1" />
                                <span>Add New Organization</span>
                            </Button>
                        </div>
                        <div className="border border-dashed py-5 px-5 rounded-xl">
                            {isLoading && (
                                <p className="text-[var(--subtitle-400)]">
                                    Loading organizations...
                                </p>
                            )}
                            {error && (
                                <p className="text-[var(--subtitle-400)]">
                                    Error loading organizations. Please try
                                    again.
                                </p>
                            )}

                            {organizations && organizations?.length > 0 && (
                                <SelectableList
                                    items={organizations?.map(
                                        (org: Organization) => ({
                                            id: String(org.id || org.name),
                                            title: org.name,
                                            subtitle: org.name,
                                            avatar: org.avatarUrl,
                                        })
                                    )}
                                    selectedId={selectedOrg?.id}
                                    onSelect={(id) =>
                                        setSelectedOrg(
                                            organizations.find(
                                                (org) =>
                                                    org.id === id ||
                                                    org.name === id
                                            ) || null
                                        )
                                    }
                                />
                            )}

                            {organizations && organizations?.length === 0 && (
                                <p className="text-[var(--subtitle-400)]">
                                    No organizations found. Please add an
                                    organization to continue.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Connect Organization"
                isEnabled={
                    Boolean(selectedOrg) && !isLoading && !isUpdatingUser
                }
                isLoading={isLoading || isUpdatingUser}
                onClick={onStepComplete}
            />
        </>
    );
};

export default Step1Page;
