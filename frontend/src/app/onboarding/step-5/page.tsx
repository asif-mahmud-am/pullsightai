"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { StarBullet } from "@/components/reusable/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import RepositoryList from "./RepositoryList";
import MemberList from "./MemberList";
import { useOrganizationMembersQuery } from "@/api/queries/member";
import { useAuthStore } from "@/store/authStore";

const Step5Page = () => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
        []
    );

    const searchParams = useSearchParams();

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    const onStepComplete = () => {
        // You can add your API call or navigation logic here
        // redirect(`/dashboard`);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-12 flex items-center flex-col lg:flex-row lg:gap-x-10 divide-y lg:divide-y-0 lg:divide-x mb-4">
                    <div className="max-w-[690px] lg:pr-16">
                        <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                            Set Up Your Repositories & Team
                        </h2>
                        <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                            You can view pull requests based on your selected
                            team members and repositories. Adjust your
                            selections to see the most relevant PRs for your
                            workflow.
                        </p>
                    </div>
                    <div className="">
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>
                                    Create unlimited code reviews on your PRs
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>
                                    You can add or remove repositories and team
                                    members at any time
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>Explore all dashboards and insights</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* left column */}
                <div className="col-span-6">
                    <RepositoryList
                        onSelectionChange={(selectedRepos) =>
                            setSelectedRepositories(selectedRepos)
                        }
                    />
                </div>
                {/* Right column */}
                <div className="col-span-6">
                    <MemberList
                        onSelectionChange={(selectedMembers) =>
                            setSelectedMembers(selectedMembers)
                        }
                    />
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                confirmButtonClassname="!bg-primary hover:!bg-gray-200"
                buttonText="Start 14-Days Free Trial"
                isEnabled={
                    selectedMembers.length > 0 &&
                    selectedRepositories.length > 0
                }
                onClick={onStepComplete}
                onBackClick={() =>
                    redirect(
                        ROUTE_CONSTANTS.ONBOARDING_STEP_4 +
                            "?repoId=" +
                            repoId +
                            "&prId=" +
                            prId
                    )
                }
                confirmButtonSubtitle="Invitations will be sent automatically."
            />
        </>
    );
};

export default Step5Page;
