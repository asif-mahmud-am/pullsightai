"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";

interface RepositoryStatusSwitchProps {
    isActive: boolean;
    repositoryId: string;
}

const RepositoryStatusSwitch = ({
    isActive,
    repositoryId,
}: RepositoryStatusSwitchProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const updateRepository = useUpdateRepositoryMutation();

    const handleConfirm = async () => {
        try {
            await updateRepository.mutateAsync({
                id: repositoryId,
                data: { isActive: !isActive },
            });
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to update repository status:", error);
        }
    };

    return (
        <>
            <Switch
                checked={isActive}
                onCheckedChange={() => setShowConfirm(true)}
            />
            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title={
                    isActive ? "Deactivate Repository" : "Activate Repository"
                }
                description={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                } this repository?`}
                onConfirm={handleConfirm}
                confirmText={isActive ? "Deactivate" : "Activate"}
                variant={isActive ? "destructive" : "default"}
            />
        </>
    );
};

export const columns: ColumnDef<Repository>[] = [
    {
        accessorKey: "isActive",
        cell: ({ row }) => {
            const active = row.getValue("isActive") as boolean;
            const repositoryId = row.original._id;
            return (
                <RepositoryStatusSwitch
                    isActive={active}
                    repositoryId={repositoryId}
                />
            );
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
