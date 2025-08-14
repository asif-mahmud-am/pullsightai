"use client";

import { useState } from "react";
import { columns } from "@/components/dataTable/repositoriesDataTable";
import { DataTable } from "@/components/reusable/DataTable";
import { List, Grid, Info } from "lucide-react";

const data = [
    {
        active: true,
        title: "shared-libs",
        author: { name: "Noelle Ruiz", avatar: "/avatars/noelle.png" },
        updated: "2 hours ago",
    },
    {
        active: true,
        title: "frontend-dashboard",
        author: { name: "Noelle Ruiz", avatar: "/avatars/noelle.png" },
        updated: "5 hours ago",
    },
    {
        active: true,
        title: "backend-api-service",
        author: { name: "Noelle Ruiz", avatar: "/avatars/noelle.png" },
        updated: "Yesterday",
    },
    {
        active: true,
        title: "my-frontend-app",
        author: { name: "Noelle Ruiz", avatar: "/avatars/noelle.png" },
        updated: "Dec 15, 2024",
    },
    {
        active: true,
        title: "legacy-archive-do-not-touch",
        author: { name: "Noelle Ruiz", avatar: "/avatars/noelle.png" },
        updated: "Dec 13, 2024",
    },
    {
        active: false,
        title: "mobile-app-ios",
    },
    {
        active: false,
        title: "data-analytics-pipeline",
    },
    {
        active: false,
        title: "ml-recommendation-engine",
    },
];

const PullRequestsPage = () => {
    const [tab, setTab] = useState<"all" | "activePrs" | "myPrs" | "">("all");

    const filteredData =
        tab === "activePrs" ? data.filter((item) => item.active) : data;

    return (
        <div className="p-6 space-y-6 text-white">
            {/* Header */}
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Pull Requests</h2>
                <Info size={18} className="text-gray-400" />
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
                    <div className="flex gap-2 border  border-white rounded-md overflow-hidden">
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
                <DataTable columns={columns} data={filteredData} />
            </div>
        </div>
    );
};

export default PullRequestsPage;
