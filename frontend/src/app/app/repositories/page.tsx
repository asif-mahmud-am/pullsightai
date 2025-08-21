"use client";

import { useState } from "react";
import { columns } from "./tableColumns";
import DataTable from "@/components/reusable/DataTable";
import { List, Grid, Info } from "lucide-react";
import { useGetRepositoriesQuery } from "@/api/queries/workspace";

const RepositoriesPage = () => {
    const [tab, setTab] = useState<"all" | "active">("all");

    const { data, isFetching } = useGetRepositoriesQuery();

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-semibold">Repositories</h2>
            </div>

            {/* Table */}
            <div className="bg-[#1D1D20] p-4 space-y-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Repositories
                    </h2>
                </div>
                {/* Filters Row */}
                <div className="flex items-center justify-between ">
                    {/* Tabs */}
                    <div className="flex gap-2 border  rounded-md overflow-hidden">
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
                <DataTable
                    columns={columns}
                    isLoading={isFetching}
                    data={data?.data || []}
                />
            </div>
        </div>
    );
};
export default RepositoriesPage;
