"use client";

import { useEffect, useState } from "react";
import { columns } from "./tableColumns";
import DataTable from "@/components/reusable/DataTable";
import { List, Grid, Info } from "lucide-react";
import { PullRequest } from "@/types/pullRequest";
import { Repository } from "@/types/repository";
import {
    useGetWorkspacePullRequestsQuery,
    useGetWorkspaceRepositoriesQuery,
} from "@/api/queries/workspace";
import usePagination from "@/hooks/usePagination";
import Tabs from "@/components/reusable/Tabs";
import Select from "@/components/reusable/Select";
import ContentCard from "@/components/reusable/ContentCard";

const PullRequestsPage = () => {
    const [tab, setTab] = useState<"all" | "activePrs" | "myPrs" | "">("all");
    const [prState, setPrState] = useState<string>("");
    const [repo, setRepo] = useState<string | null>(null);
    const [prUser, setPrUser] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isFetching } = useGetWorkspacePullRequestsQuery({
        isEnabled: true,
        prState,
        repo,
        prUser,
    });
    const { data: repoData } = useGetWorkspaceRepositoriesQuery({
        isEnabled: true,
        limit: 100,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [tab]);

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });

    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-semibold">Pull Requests</h2>
            </div>

            <ContentCard className="">
                <ContentCard.Header className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Pull Requests
                    </h2>
                    {/* <Info size={18} className="text-gray-400" /> */}
                </ContentCard.Header>
                <ContentCard.Body className="">
                    <div className="flex items-center justify-between mb-3">
                        {/* <Tabs
                            value={tab}
                            onValueChange={(value) =>
                                setTab(value as "all" | "activePrs" | "myPrs")
                            }
                        >
                            <Tabs.List>
                                <Tabs.Trigger value="all">All</Tabs.Trigger>
                                <Tabs.Trigger value="activePrs">
                                    Active PRs
                                </Tabs.Trigger>
                                <Tabs.Trigger value="myPrs">
                                    My PRs
                                </Tabs.Trigger>
                            </Tabs.List>
                        </Tabs> */}
                        <div></div>

                        <div className="flex items-center gap-6">
                            {/* Author filter */}
                            <Select
                                options={[
                                    { value: "", label: "Authors: All" },
                                    { value: "noelle", label: "Noelle Ruiz" },
                                    { value: "john", label: "John Doe" },
                                ]}
                                value={prUser || ""}
                                onChange={setPrUser}
                            />

                            {/* Repositories filter */}
                            <Select
                                options={[
                                    { value: "", label: "Repositories: All" },
                                    ...(repoData?.data?.docs.map(
                                        (repo: Repository) => ({
                                            value: repo.name,
                                            label: repo.name,
                                        })
                                    ) || []),
                                ]}
                                value={repo || ""}
                                onChange={setRepo}
                            />

                            {/* PR Status:: filter */}
                            <Select
                                options={[
                                    { value: "", label: "PR Status: All" },
                                    { value: "open", label: "PR Status: Open" },
                                    {
                                        value: "closed",
                                        label: "PR Status: Closed",
                                    },
                                ]}
                                className=""
                                value={prState}
                                onChange={setPrState}
                            />
                            {/* Authors: filter */}
                            {/* <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Period: Last 30 days</option>
                        </select> */}

                            {/* View toggle */}
                            {/* <div className="flex border border-gray-700 rounded-md overflow-hidden">
                            <button className="p-2  text-gray-300 hover:bg-gray-700">
                                <List size={18} />
                            </button>
                            <button className="p-2  text-gray-400 hover:bg-gray-700">
                                <Grid size={18} />
                            </button>
                        </div> */}
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={data?.data?.docs || []}
                        isLoading={isFetching}
                    />
                    <Pagination />
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};

export default PullRequestsPage;
