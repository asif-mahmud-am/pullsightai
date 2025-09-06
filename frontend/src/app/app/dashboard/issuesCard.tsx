import { useDashboardIssuesQuery } from "@/api/queries/dashboard";
import { useGetWorkspaceTeamMembersQuery } from "@/api/queries/workspace";
import Avatar from "@/components/reusable/Avatar";
import Badge from "@/components/reusable/Badge";
import ContentCard from "@/components/reusable/ContentCard";
import DataTable from "@/components/reusable/DataTable";
import PrStateBadge from "@/components/reusable/PrStateBadge";
import Select from "@/components/reusable/Select";
import SeverityBadge from "@/components/reusable/SeverityBadge";
import Tabs from "@/components/reusable/Tabs";
import usePagination from "@/hooks/usePagination";
import { formatDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/issue";
import { TeamMember } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
}

const columns: ColumnDef<Issue>[] = [
    {
        accessorKey: "category",
        header: "Issue",
        meta: {
            headerClassName: "min-w-64 flex-1",
            cellClassName: "min-w-64 flex-1",
        },
        cell: ({ row }) => (
            <div>
                <span className="text-white mb-1 text-base">
                    {row.getValue("category")}
                </span>
                <div className="opacity-50 truncate">
                    {row.original?.filePath}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "pr",
        header: "PR",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <span className="text-white mb-1 text-md">
                    {row.getValue("pr")}
                </span>
                <a
                    className="opacity-50"
                    href={row.original?.prUrl}
                    target="_blank"
                >
                    <ExternalLink className="w-auto h-4" />
                </a>
            </div>
        ),
    },
    {
        accessorKey: "prUser",
        header: "Author",
        cell: ({ row }) => (
            <Avatar src={""} name={row.original?.prUser} className="" />
        ),
    },
    {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original?.severity} />,
    },
    {
        accessorKey: "prState",
        header: "Status",
        cell: ({ row }) => <PrStateBadge state={row.original?.prState} />,
    },
    {
        accessorKey: "daysOpen",
        header: "Days open",
        cell: ({ row }) => (
            <span className="bg-white/5 text-gray-400 rounded-full px-2 py-1 inline-block">
                {row.original?.daysOpen || 0}
            </span>
        ),
    },
    {
        accessorKey: "updated",
        header: "Updated",
        cell: ({ row }) => (
            <span>{formatDate(row.original?.updated || "")}</span>
        ),
    },
];

const IssuesCard = ({ className, fromDate, toDate, repo }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [prUser, setPrUser] = useState<string | null>(null);
    const [prState, setPrState] = useState<string | null>(null);
    const [severity, setSeverity] = useState<string | null>(null);

    // Store the last known counts to prevent showing 0 during loading
    const lastCountsRef = useRef<any>(null);

    const { data: teamMembersData } = useGetWorkspaceTeamMembersQuery({
        isEnabled: true,
        limit: 100,
    });

    const { data, isFetching } = useDashboardIssuesQuery({
        page: currentPage,
        limit: 10,
        from: fromDate,
        to: toDate,
        repo,
        prUser,
        prState,
        severity: severity ? severity : undefined,
    });

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });

    // Update the stored counts when new data arrives
    useEffect(() => {
        if (data?.data?.totalCount && !isFetching) {
            lastCountsRef.current = data.data.totalCount;
        }
    }, [data, isFetching]);

    // Use current data if available, otherwise fall back to last known counts
    const displayCounts = data?.data?.totalCount ||
        lastCountsRef.current || {
            total: 0,
            Blocker: 0,
            Critical: 0,
            Major: 0,
            Minor: 0,
            Info: 0,
        };

    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">Issues</h3>
            </ContentCard.Header>
            <ContentCard.Body className="flex flex-col flex-1">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-2">
                    <Tabs
                        value={severity || ""}
                        onValueChange={(value) => setSeverity(value)}
                    >
                        <Tabs.List>
                            <Tabs.Trigger value="">
                                All ({displayCounts.total})
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Blocker">
                                Blocker ({displayCounts.Blocker})
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Critical">
                                Critical ({displayCounts.Critical})
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Major">
                                Major ({displayCounts.Major})
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Minor">
                                Minor ({displayCounts.Minor})
                            </Tabs.Trigger>
                            <Tabs.Trigger value="Info">
                                Info ({displayCounts.Info})
                            </Tabs.Trigger>
                        </Tabs.List>
                    </Tabs>
                    {/* Author filter */}
                    <Select
                        options={[
                            { value: "", label: "Authors: All" },
                            ...(teamMembersData?.data?.docs.map(
                                (member: TeamMember) => ({
                                    value: member.username,
                                    label: member.username,
                                })
                            ) || []),
                        ]}
                        value={prUser || ""}
                        onChange={setPrUser}
                    />
                    <Select
                        options={[
                            { value: "", label: "PR Status: All" },
                            { value: "open", label: "PR Status: Open" },
                            {
                                value: "merged",
                                label: "PR Status: Merged",
                            },
                            {
                                value: "declined",
                                label: "PR Status: Declined",
                            },
                        ]}
                        className=""
                        value={prState || ""}
                        onChange={setPrState}
                    />
                </div>
                <DataTable
                    columns={columns}
                    isLoading={isFetching}
                    data={data?.data?.issueCardData || []}
                />
                <Pagination />
            </ContentCard.Body>
        </ContentCard>
    );
};

export default IssuesCard;
