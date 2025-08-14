import { useOrganizationMembersQuery } from "@/api/queries/member";
import { DataTable } from "@/components/reusable/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { TeamMember } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

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
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--subtitle-500)] flex items-center justify-center mr-2 flex-shrink-0">
                        {row.original?.avatarUrl ? (
                            <Image
                                src={row.original?.avatarUrl}
                                alt={row.original?.username || ""}
                                className="w-full h-full object-cover"
                                width={32}
                                height={32}
                            />
                        ) : (
                            <span className="text-[var(--title-50)] text-sm">
                                {row.original?.username?.charAt(0) || "?"}
                            </span>
                        )}
                    </div>{" "}
                    <p className="text-[var(--subtitle-500)] text-sm">
                        {row.original?.username || "Unknown"}
                    </p>
                </div>
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
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";
    const { data: members = [], isFetching } = useOrganizationMembersQuery({
        provider,
    });

    // Function to determine if a member should be initially selected
    const shouldSelectMember = (member: TeamMember) => {
        return member.username === user?.username;
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="font-medium text-lg">
                    Team members list{" "}
                    <span className="text-muted">({members?.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    className="min-w-full"
                    isLoading={isFetching}
                    columns={columns}
                    data={members}
                    initialSelection={shouldSelectMember}
                    onSelectionChange={(selectedRows) =>
                        onSelectionChange?.(selectedRows)
                    }
                />
                <div className="text-muted text-sm mt-3">
                    You can add or remove team members at any time
                </div>
            </CardContent>
        </Card>
    );
};

export default MemberList;
