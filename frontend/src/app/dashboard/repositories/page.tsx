"use client";

import { useState } from "react";
import { columns } from "@/components/dataTable/repositoriesDataTable";
import { DataTable } from "@/components/reusable/DataTable";
import { List, Grid, Info } from "lucide-react";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const data:any = [
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

const RepositoriesPage = () => {
    const [tab, setTab] = useState<"all" | "active">("all");

    const filteredData =
        tab === "active" ? data.filter((item:any) => item.active) : data;

    return (
        <div className="p-6 space-y-6 text-white">
            {/* Header */}
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Repositories</h2>
                <Info size={18} className="text-gray-400" />
            </div>

            {/* Table */}
            <div className="bg-[#1D1D20] p-4 space-y-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Repositories
                    </h2>
                    <Info size={18} className="text-gray-400" />
                </div>
                {/* Filters Row */}
                <div className="flex items-center justify-between">
                    {/* Tabs */}
                    <div className="flex gap-2 border  border-white rounded-md overflow-hidden">
                        <button
                            onClick={() => setTab("all")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                tab === "all"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTab("active")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                tab === "active"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400"
                            }`}
                        >
                            Active
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Author filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Authors: All</option>
                            <option value="noelle">Noelle Ruiz</option>
                            <option value="john">John Doe</option>
                        </select>

                        {/* Date filter */}
                        <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                            <option value="all">Date: All</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
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
export default RepositoriesPage;
