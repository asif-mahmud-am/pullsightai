"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";
import { TeamMember } from "@/types/user";

export const columns: ColumnDef<TeamMember>[] = [
    {
        accessorKey: "username",
        header: "Author",
        cell: ({ row }) => {
            const username = row.original?.username as string | undefined;
            const avatarUrl = row.original?.avatarUrl as string | undefined;
            return (
                <Avatar
                    src={avatarUrl || ""}
                    name={username || "Unknown"}
                    size="sm"
                />
            );
        },
    },
    {
        accessorKey: "invitedAt",
        header: "Invited",
        cell: ({ row }) => {
            const invitedAt = row.getValue("invitedAt") as string | undefined;
            return (
                <span className="text-gray-400">
                    {formatDate(invitedAt || "")}
                </span> // fallback if empty
            );
        },
    },
];
