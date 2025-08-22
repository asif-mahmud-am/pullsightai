"use client";

import ContentCard from "@/components/reusable/ContentCard";
import { useState } from "react";

const DashboardPage = () => {
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="ml-auto flex gap-3">
                    <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                        <option value="all">Repositories: All</option>
                        <option value="repo1">Repo 1</option>
                    </select>
                    <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                        <option value="all">Period: Last 7 Days</option>
                        <option value="repo1">Repo 1</option>
                    </select>
                    <select className="border text-gray-300 rounded-md px-3 py-2 text-sm ">
                        <option value="all">Breakdown: Days</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-5">
                <ContentCard className="col-span-4">
                    <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                        <h3 className="text-muted font-semibold">PRs</h3>
                    </ContentCard.Header>
                    <ContentCard.Body>
                        <div className="flex">
                            <div className="flex-1">
                                <div className="opacity-50 text-xs">Opened</div>
                                <div className="">0</div>
                            </div>
                        </div>
                    </ContentCard.Body>
                </ContentCard>
                <ContentCard className="col-span-4">
                    <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                        <h3 className="font-medium text-lg">
                            Pull Requests Overview
                        </h3>
                    </ContentCard.Header>
                    <ContentCard.Body>
                        <p className="text-gray-500">
                            Overview of pull requests in the selected
                            repositories and time period.
                        </p>
                    </ContentCard.Body>
                </ContentCard>
                <ContentCard className="col-span-4">
                    <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                        <h3 className="font-medium text-lg">
                            Pull Requests Overview
                        </h3>
                    </ContentCard.Header>
                    <ContentCard.Body>
                        <p className="text-gray-500">
                            Overview of pull requests in the selected
                            repositories and time period.
                        </p>
                    </ContentCard.Body>
                </ContentCard>
            </div>
        </div>
    );
};

export default DashboardPage;
