"use client"; // <-- Add this

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";

export const columns: ColumnDef<Repository>[] = [
    {
        accessorKey: "isActive",
        cell: ({ row }) => {
            const active = row.getValue("isActive") as boolean;
            return <Switch checked={active} />;
        },
    },
    {
        accessorKey: "name",
        header: "Repository name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return (
                <span className="text-white hover:underline cursor-pointer">
                    {name}
                </span>
            );
        },
    },
    {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => {
            const author =
                (row.getValue("author") as {
                    avatarUrl?: string;
                    username?: string;
                }) || {};
            return (
                <Avatar
                    src={author?.avatarUrl || ""}
                    name={author?.username || "Unknown"}
                    size="sm"
                />
            );
        },
    },
    {
        accessorKey: "updatedOn",
        header: "Updated",
        cell: ({ row }) => {
            const updated = row.getValue("updatedOn") as string | undefined;
            return (
                <span className="text-gray-400">
                    {formatDate(updated || "")}
                </span> // fallback if empty
            );
        },
    },
];
