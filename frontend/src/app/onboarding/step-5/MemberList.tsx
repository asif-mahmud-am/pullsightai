import { useOrganizationMembersQuery } from "@/api/queries/member";
import Avatar from "@/components/reusable/Avatar";
import ContentCard from "@/components/reusable/ContentCard";
import DataTable from "@/components/reusable/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { TeamMember } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";

interface Props {
    onSelectionChange?: (selectedRepos: TeamMember[]) => void;
}

export const columns: ColumnDef<TeamMember>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                disabled={row.original?.role == "owner"}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "username",
        header: "Team member",
        cell: ({ row }) => {
            return (
                <Avatar
                    src={row.original?.avatarUrl}
                    name={row.original?.username || "Unknown"}
                    className=""
                />
            );
        },
    },
    {
        accessorKey: "displayName",
        header: "Name",
        cell: ({ row }) => <div className="">{row.original?.displayName}</div>,
    },
];

const MemberList = ({ onSelectionChange }: Props) => {
    const [columnFilters, setColumnFilters] = useState<
        { id: string; value: unknown }[]
    >([]);

    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";
    const {
        data: members = [],
        isFetching,
        error,
    } = useOrganizationMembersQuery({
        provider,
    });

    // Function to determine if a member should be initially selected
    const shouldSelectMember = (member: TeamMember) => {
        return (
            member.providerId === user?.providerId || member?.role == "owner"
        );
    };

    const otherMembers = members?.filter(
        (member) => !shouldSelectMember(member)
    );
    const selectedMember = members.filter(shouldSelectMember);

    return (
        <ContentCard className="mb-4">
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                <h3 className="font-medium text-lg">
                    Team members list{" "}
                    <span className="text-muted">({members?.length})</span>
                </h3>
                <input
                    value={
                        (columnFilters.find((f) => f.id === "username")
                            ?.value as string) ?? ""
                    }
                    onChange={(e) => {
                        const value = e.target.value;
                        setColumnFilters((prev) => {
                            // Remove the filter if value is empty, else update/add
                            const otherFilters = prev.filter(
                                (f) => f.id !== "username"
                            );
                            return value
                                ? [...otherFilters, { id: "username", value }]
                                : otherFilters;
                        });
                    }}
                    placeholder="Search team members…"
                    className="w-full sm:w-auto border rounded-md p-2 text-sm"
                />
            </ContentCard.Header>
            <ContentCard.Body
                className="xl:max-h-[calc(100vh-650px)]"
                hasError={!!error}
                isLoading={isFetching}
                errorLabel={
                    error
                        ? "Error loading team members. Please try again."
                        : undefined
                }
                noContentLabel={
                    members && members?.length === 0
                        ? "No team members found. Please add a team member to continue."
                        : undefined
                }
            >
                <DataTable<TeamMember>
                    className="min-w-full"
                    isLoading={isFetching}
                    columns={columns}
                    data={[...selectedMember, ...otherMembers]}
                    initialSelection={shouldSelectMember}
                    onSelectionChange={(selectedRows) =>
                        onSelectionChange?.(selectedRows)
                    }
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                />
                <div className="text-muted text-sm mt-3">
                    You can add or remove team members at any time
                </div>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default MemberList;
