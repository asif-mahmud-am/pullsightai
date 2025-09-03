"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import { PullRequest } from "@/types/pullRequest";
import Avatar from "@/components/reusable/Avatar";
import Badge from "@/components/reusable/Badge";
import { formatDate } from "@/lib/dayjs";

export const columns: ColumnDef<PullRequest>[] = [
    {
        accessorKey: "prTitle",
        header: "PR Title",
        meta: {
            headerClassName: "min-w-64 flex-1",
            cellClassName: "min-w-64 flex-1",
        },
        cell: ({ row }) => (
            <div>
                <span className="text-white mb-1 text-base">
                    {row.getValue("prTitle")}
                </span>
                <div className="opacity-50">{row.original?.repo}</div>
            </div>
        ),
    },
    {
        accessorKey: "prUser",
        header: "Author",
        meta: {
            headerClassName: "w-32",
            cellClassName: "w-32",
        },
        cell: ({ row }) => {
            return (
                <Avatar
                    src={row.original?.prUserAvatar || ""}
                    name={row.getValue("prUser") || "Unknown"}
                    size="sm"
                />
            );
        },
    },
    {
        accessorKey: "prState",
        header: "PR Status",
        meta: {
            headerClassName: "w-28",
            cellClassName: "w-28",
        },
        cell: ({ row }) => {
            const status = row.getValue("prState") as string;
            return (
                <Badge
                    variant={
                        status === "merged" || status === "closed"
                            ? "success"
                            : status === "rejected"
                            ? "destructive"
                            : "default"
                    }
                    type="faded"
                >
                    {status}
                </Badge>
            );
        },
    },

    {
        accessorKey: "prUpdatedAt",
        header: "Updated",
        meta: {
            headerClassName: "w-28",
            cellClassName: "w-28",
        },
        cell: ({ row }) => {
            const updated = row.getValue("prUpdatedAt") as string | undefined;
            return (
                <span className="text-gray-400">
                    {formatDate(updated || "")}
                </span>
            );
        },
    },
];
