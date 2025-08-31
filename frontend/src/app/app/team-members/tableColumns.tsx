"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateTeamMemberMutation } from "@/api/queries/workspace";
import { TeamMember } from "@/types/user";

interface TeamMemberStatusSwitchProps {
    isActive: boolean;
    memberId: string;
    memberName: string;
}

const TeamMemberStatusSwitch = ({
    isActive,
    memberId,
    memberName,
}: TeamMemberStatusSwitchProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const updateTeamMember = useUpdateTeamMemberMutation();

    const handleConfirm = async () => {
        try {
            await updateTeamMember.mutateAsync({
                id: memberId,
                data: { isActive: !isActive },
            });
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to update team member status:", error);
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
                    isActive ? "Deactivate Team Member" : "Activate Team Member"
                }
                description={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                } ${memberName}?`}
                onConfirm={handleConfirm}
                confirmText={isActive ? "Deactivate" : "Activate"}
                variant={isActive ? "destructive" : "default"}
            />
        </>
    );
};

export const columns: ColumnDef<TeamMember>[] = [
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const active = row.getValue("isActive") as boolean;
            const memberId = row.original._id || row.original.providerId; // Fallback to providerId if _id not available
            const memberName =
                row.original.displayName || row.original.username;
            return (
                <TeamMemberStatusSwitch
                    isActive={active ?? true} // Default to active if not specified
                    memberId={memberId}
                    memberName={memberName}
                />
            );
        },
    },
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
                </span>
            );
        },
    },
];
