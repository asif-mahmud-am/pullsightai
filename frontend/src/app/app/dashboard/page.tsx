"use client";

import ContentCard from "@/components/reusable/ContentCard";
import { useState } from "react";
import PrAnalysisCard from "./prAnalysisCars";
import { subtractDays } from "@/lib/dayjs";

const DashboardPage = () => {
    const [fromDate, setFromDate] = useState<string | null>(
        subtractDays(new Date(), 6).toISOString()
    );
    const [toDate, setToDate] = useState<string | null>(
        new Date().toISOString()
    );

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
                <PrAnalysisCard
                    className="col-span-4"
                    fromDate={fromDate}
                    toDate={toDate}
                />
                <ContentCard className="col-span-4">
                    <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                        <h3 className="text-muted font-semibold">Issues</h3>
                    </ContentCard.Header>
                    <ContentCard.Body>
                        <div className="flex divide-x gap-9 pt-5">
                            <div className="pr-9">
                                <div className="opacity-50 text-xs mb-1">
                                    Total
                                </div>
                                <div className="text-3xl">0</div>
                            </div>
                            <div className="pr-9">
                                <div className="opacity-50 text-xs mb-1">
                                    Completion Rate
                                </div>
                                <div className="text-3xl">0%</div>
                            </div>
                        </div>
                    </ContentCard.Body>
                </ContentCard>
                <ContentCard className="col-span-4">
                    <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                        <h3 className="text-muted font-semibold">
                            Time & Money Saved
                        </h3>
                    </ContentCard.Header>
                    <ContentCard.Body>
                        <div className="flex divide-x gap-9 pt-5">
                            <div className="pr-9">
                                <div className="opacity-50 text-xs mb-1">
                                    Hours
                                </div>
                                <div className="text-3xl">0</div>
                            </div>
                            <div className="pr-9">
                                <div className="opacity-50 text-xs mb-1">
                                    Money Saved
                                </div>
                                <div className="text-3xl">$500</div>
                            </div>
                            <div className="pr-9">
                                <div className="opacity-50 text-xs mb-1">
                                    ROI
                                </div>
                                <div className="text-3xl">3.2x</div>
                            </div>
                        </div>
                    </ContentCard.Body>
                </ContentCard>
            </div>
        </div>
    );
};

export default DashboardPage;
