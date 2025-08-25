"use client";

import { useState } from "react";
import { columns } from "./tableColumns";
import DataTable from "@/components/reusable/DataTable";
import { List, Grid, Info } from "lucide-react";
import { PullRequest } from "@/types/pullRequest";
import { Repository } from "@/types/repository";
import { useGetPullRequestsQuery } from "@/api/queries/workspace";

const PullRequestsPage = () => {
    const [tab, setTab] = useState<"all" | "activePrs" | "myPrs" | "">("all");

    const { data, isFetching } = useGetPullRequestsQuery();

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-semibold">Review Pull Requests</h2>
            </div>

            {/* Table */}
            <div className="bg-[#1D1D20] p-4 space-y-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Pull Requests
                    </h2>
                    <Info size={18} className="text-gray-400" />
                </div>
                {/* Filters Row */}
                <div className="flex items-center justify-between">
                    {/* Tabs */}
                    <div className="flex gap-2 border rounded-md overflow-hidden">
                        <button
                            onClick={() => setTab("all")}
                            className={`px-3 py-2  rounded-md text-xs font-light ${
                                tab === "all"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTab("activePrs")}
                            className={`px-3 py-2  rounded-md text-xs font-light ${
                                tab === "activePrs"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400"
                            }`}
                        >
                            Active PRs
                        </button>
                        <button
                            onClick={() => setTab("myPrs")}
                            className={`px-3 py-2  rounded-md text-xs font-light ${
                                tab === "myPrs"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400"
                            }`}
                        >
                            My PRs
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Author filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Authors: All</option>
                            <option value="noelle">Noelle Ruiz</option>
                            <option value="john">John Doe</option>
                        </select>

                        {/* Repositories filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Repositories: All</option>
                        </select>

                        {/* Authors: filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Authors: All</option>
                        </select>

                        {/* PR Status:: filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">PR Status: All</option>
                        </select>
                        {/* Authors: filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Period: Last 30 days</option>
                        </select>

                        {/* View toggle */}
                        <div className="flex border border-gray-700 rounded-md overflow-hidden">
                            <button className="p-2  text-gray-300 hover:bg-gray-700">
                                <List size={18} />
                            </button>
                            <button className="p-2  text-gray-400 hover:bg-gray-700">
                                <Grid size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    isLoading={isFetching}
                />
            </div>
        </div>
    );
};

export default PullRequestsPage;
