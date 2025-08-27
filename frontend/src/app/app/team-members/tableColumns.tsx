"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";

export const columns: ColumnDef<Repository>[] = [
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
