"use client";

import ContentCard from "@/components/reusable/ContentCard";
import { useState, useEffect } from "react";
import PrAnalysisCard from "./prAnalysisCard";
import { subtractDays } from "@/lib/dayjs";
import IssueAnalysisCard from "./issueAnalysisCard";
import TimeMoneySavedCard from "./timeMoneySavedCard";
import { useGetWorkspaceRepositoriesQuery } from "@/api/queries/workspace";
import Select from "@/components/reusable/Select";
import { Repository } from "@/types/repository";

const DashboardPage = () => {
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [repo, setRepo] = useState<string | null>(null);
    const [breakdown, setBreakdown] = useState<string>("day");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("7");

    const { data: repoData } = useGetWorkspaceRepositoriesQuery({
        isEnabled: true,
        limit: 100,
    });

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
        const days = parseInt(value);
        const newToDate = new Date().toISOString();
        const newFromDate = subtractDays(new Date(), days - 1).toISOString();
        setFromDate(newFromDate);
        setToDate(newToDate);
    };

    // Set initial dates on component mount
    useEffect(() => {
        if (!fromDate || !toDate) {
            handlePeriodChange(selectedPeriod);
        }
    }, [fromDate, toDate, selectedPeriod]);

    const handleRepoChange = (value: string) => {
        setRepo(value || null);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 sticky top-0 bg-background pt-3 pb-2 z-10">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="ml-auto flex gap-3">
                    <Select
                        className="bg-background"
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
                        onChange={handleRepoChange}
                    />
                    <Select
                        className="bg-background"
                        options={[
                            { value: "7", label: "Period: Last 7 Days" },
                            { value: "15", label: "Period: Last 15 Days" },
                            { value: "30", label: "Period: Last 30 Days" },
                            { value: "60", label: "Period: Last 60 Days" },
                            { value: "90", label: "Period: Last 90 Days" },
                            { value: "180", label: "Period: Last 180 Days" },
                            { value: "365", label: "Period: Last 365 Days" },
                        ]}
                        value={selectedPeriod}
                        onChange={handlePeriodChange}
                    />
                    <Select
                        className="bg-background"
                        options={[
                            { value: "day", label: "Breakdown: Days" },
                            // { value: "week", label: "Breakdown: Weeks" },
                            { value: "month", label: "Breakdown: Months" },
                            { value: "year", label: "Breakdown: Years" },
                        ]}
                        value={breakdown}
                        onChange={setBreakdown}
                    />
                </div>
            </div>
            <div className="grid grid-cols-12 gap-5">
                <PrAnalysisCard
                    className="col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
                <IssueAnalysisCard
                    className="col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
                <TimeMoneySavedCard
                    className="col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
            </div>
        </div>
    );
};

export default DashboardPage;
