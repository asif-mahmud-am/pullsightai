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
import { Repository } from "@/types/repository";
import ContentCard from "@/components/reusable/ContentCard";
import Avatar from "@/components/reusable/Avatar";
import { formatDate, humanizeDate } from "@/lib/dayjs";
import { useSearchable } from "@/hooks/use-searchable";

const Step2Page = () => {
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";

    const {
        data: repositories = [],
        refetch: refetchRepositories,
        isFetching,
        error,
    } = useRepositoryQuery({
        provider,
    });

    const { searchInput, filteredData } = useSearchable({
        data: repositories,
        searchFn: (item, search) =>
            search.trim()
                ? item.name.toLowerCase().includes(search.toLowerCase())
                : true,
        inputProps: {
            className: "ml-auto",
        },
    });

    const onStepComplete = () => {
        if (!selectedRepo) return;
        router.push(
            ROUTE_CONSTANTS.ONBOARDING_STEP_3 + `?repoId=${selectedRepo.slug}`
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
                    <ContentCard>
                        <ContentCard.Header>
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                Repositories List
                            </h3>
                            {searchInput}
                            <Button
                                variant="outline"
                                size="icon"
                                className=""
                                onClick={() => refetchRepositories()}
                            >
                                <RefreshCw className="inline mr-1" />
                            </Button>
                        </ContentCard.Header>
                        <ContentCard.Body
                            className="max-h-[calc(100vh-450px)]"
                            hasError={!!error}
                            isLoading={isFetching}
                            errorLabel={
                                error
                                    ? "Error loading organizations. Please try again."
                                    : undefined
                            }
                            noContentLabel={
                                repositories && repositories?.length === 0
                                    ? "No repositories found. Please add a repository to continue."
                                    : undefined
                            }
                        >
                            <SelectableList
                                items={filteredData || []}
                                selectedId={selectedRepo?.name}
                                onSelect={(name) =>
                                    setSelectedRepo(
                                        repositories?.find(
                                            (repo) => repo.name === name
                                        ) || null
                                    )
                                }
                                getKey={(item) => String(item.name)}
                                renderItem={(item) => (
                                    <div className="grid grid-cols-5 items-center gap-4 flex-grow-1 text-sm">
                                        <h4 className="col-span-2">
                                            {item.name}
                                        </h4>
                                        <Avatar
                                            className="col-span-2"
                                            src={item.author?.avatarUrl || ""}
                                            name={item.name}
                                        />
                                        <div className="col-span-1 text-right text-[var(--subtitle-500)] text-sm whitespace-nowrap">
                                            {formatDate(item.createdOn || "")}
                                        </div>
                                    </div>
                                )}
                                renderHeader={() => (
                                    <div className="ml-9 grid grid-cols-5 gap-4 py-2 px-4 text-[var(--subtitle-400)] text-xs">
                                        <div className="col-span-2">Title</div>
                                        <div className="col-span-2">Author</div>
                                        <div className="col-span-1 text-right">
                                            Created at
                                        </div>
                                    </div>
                                )}
                            />
                        </ContentCard.Body>
                    </ContentCard>
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
