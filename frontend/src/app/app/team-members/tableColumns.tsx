"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateTeamMemberMutation } from "@/api/queries/workspace";
import { TeamMember } from "@/types/user";
import AdminGuard from "@/components/auth/AdminGuard";
import UpgradePlanDialog from "@/components/reusable/UpgradePlanDialog";
import { useUpgradePlanDialog } from "@/hooks/useUpgradePlanDialog";
import { useAuthStore } from "@/store/authStore";

interface TeamMemberStatusSwitchProps {
    isActive: boolean;
    member: TeamMember;
    memberName: string;
}

const TeamMemberStatusSwitch = ({
    isActive,
    member,
    memberName,
}: TeamMemberStatusSwitchProps) => {
    const { selectedWorkspace } = useAuthStore();

    const { dialogRef, showUpgradeDialog } = useUpgradePlanDialog();
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutateAsync } = useUpdateTeamMemberMutation();

    const handleConfirm = async () => {
        try {
            await mutateAsync({
                members: [{ ...member, isActive: !isActive }],
            });
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to update team member status:", error);
        }
    };

    const handleSwitchChange = () => {
        const isTrialPlan = selectedWorkspace?.currentPlan?.isDefault;
        const isFreePlan =
            !isTrialPlan && selectedWorkspace?.currentPlan?.isFree;
        const isPaidPlan = !isTrialPlan && !isFreePlan;

        if ((isTrialPlan && !member?.isActive) || isFreePlan) {
            showUpgradeDialog();
        } else if (
            isPaidPlan &&
            !member?.isActive &&
            (selectedWorkspace?.noOfActiveMembers ?? 0) >=
                (selectedWorkspace?.currentPlan?.numOfSeat ?? 0)
        ) {
            showUpgradeDialog({
                featureName: "Increase Seats",
                description:
                    "Your team has reached the maximum number of seats. Please increase your seat count to activate this member.",
                featureDescription:
                    "Increase the number of seats in your plan to add this member.",
            });
        } else {
            setShowConfirm(true);
        }
    };

    return (
        <>
            <AdminGuard>
                <Switch
                    checked={isActive}
                    onCheckedChange={handleSwitchChange}
                    disabled={member?.role == "owner"}
                />
                <ConfirmDialog
                    open={showConfirm}
                    onOpenChange={setShowConfirm}
                    title={
                        isActive
                            ? "Deactivate Team Member"
                            : "Activate Team Member"
                    }
                    description={`Are you sure you want to ${
                        isActive ? "deactivate" : "activate"
                    } ${memberName}?`}
                    onConfirm={handleConfirm}
                    confirmText={isActive ? "Deactivate" : "Activate"}
                    variant={isActive ? "destructive" : "default"}
                />
                <UpgradePlanDialog ref={dialogRef} />
            </AdminGuard>
        </>
    );
};

export const columns: ColumnDef<TeamMember>[] = [
    {
        accessorKey: "isActive",
        header: "",
        meta: {
            cellClassName: "w-16",
            headerClassName: "w-16",
        },
        cell: ({ row }) => {
            const active = row.getValue("isActive") as boolean;
            const memberName =
                row.original.displayName || row.original.username;
            return (
                <TeamMemberStatusSwitch
                    isActive={active ?? true} // Default to active if not specified
                    member={row.original}
                    memberName={memberName}
                />
            );
        },
    },
    {
        accessorKey: "username",
        header: "Author",
        meta: {
            cellClassName: "min-w-48 flex-1",
            headerClassName: "min-w-48 flex-1",
        },
        cell: ({ row }) => {
            const username = row.original?.username as string | undefined;
            const displayName = row.original?.displayName as string | undefined;
            const avatarUrl = row.original?.avatarUrl as string | undefined;
            return (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={avatarUrl || ""}
                        name={displayName || username || "Unknown"}
                        size="sm"
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "joinedAt",
        header: "Joined",
        meta: {
            cellClassName: "w-28",
            headerClassName: "w-28",
        },
        cell: ({ row }) => {
            const joinedAt = row.getValue("joinedAt") as string | undefined;
            return (
                <span className="text-gray-400">
                    {joinedAt ? formatDate(joinedAt || "") : "N/A"}
                </span>
            );
        },
    },
];
