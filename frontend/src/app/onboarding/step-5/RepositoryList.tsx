import { useRepositoryQuery } from "@/api/queries/repository";
import ContentCard from "@/components/reusable/ContentCard";
import DataTable from "@/components/reusable/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchable } from "@/hooks/use-searchable";
import { formatDate } from "@/lib/dayjs";
import { useAuthStore } from "@/store/authStore";
import { Repository } from "@/types/repository";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
    onSelectionChange?: (selectedRepos: Repository[]) => void;
}

export const columns: ColumnDef<Repository>[] = [
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return <div className=" font-medium">{row.getValue("name")}</div>;
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            if (
                typeof cellValue === "string" &&
                typeof filterValue === "string"
            ) {
                return cellValue
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            }
            return false;
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
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--subtitle-500)] flex items-center justify-center mr-2 flex-shrink-0">
                        {author?.avatarUrl ? (
                            <Image
                                src={author?.avatarUrl}
                                alt={author.username || ""}
                                className="w-full h-full object-cover"
                                width={32}
                                height={32}
                            />
                        ) : (
                            <span className="text-[var(--title-50)] text-sm">
                                {author.username?.charAt(0) || "?"}
                            </span>
                        )}
                    </div>{" "}
                    <p className="text-[var(--subtitle-500)] text-sm">
                        {author.username || "Unknown"}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "createdOn",
        header: "Created at",
        cell: ({ row }) => {
            return (
                <div className=" font-medium">
                    {formatDate(row.getValue("createdOn"))}
                </div>
            );
        },
    },
    {
        accessorKey: "updatedOn",
        header: "Updated at",
        cell: ({ row }) => (
            <div className="">{formatDate(row.getValue("updatedOn"))}</div>
        ),
    },
];

const RepositoryList = ({ onSelectionChange }: Props) => {
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";
    const repoId = searchParams.get("repoId") as string;

    const [columnFilters, setColumnFilters] = useState<
        { id: string; value: unknown }[]
    >([]);

    // Function to determine if a member should be initially selected
    const shouldSelectMember = (repo: Repository) => {
        return repo.slug === repoId;
    };

    const { data: repositories = [], isFetching } = useRepositoryQuery({
        provider,
    });
    const selectedRepo = repositories?.filter(shouldSelectMember);
    const otherRepos = repositories?.filter(
        (repo) => !shouldSelectMember(repo)
    );

    return (
        <ContentCard className="mb-4 gap-2">
            <ContentCard.Header>
                <h3 className="font-medium text-lg">
                    Repositories list{" "}
                    <span className="text-muted">({repositories?.length})</span>
                </h3>
                {/* <input
                    value={
                        (columnFilters.find((f) => f.id === "name")
                            ?.value as string) ?? ""
                    }
                    onChange={(e) => {
                        const value = e.target.value;
                        setColumnFilters((prev) => {
                            // Remove the filter if value is empty, else update/add
                            const otherFilters = prev.filter(
                                (f) => f.id !== "name"
                            );
                            return value
                                ? [...otherFilters, { id: "name", value }]
                                : otherFilters;
                        });
                    }}
                    placeholder="Search repositories…"
                    className="border rounded px-2 py-1 mb-2"
                /> */}
            </ContentCard.Header>
            <ContentCard.Body className="xl:max-h-[calc(100vh-650px)]">
                <DataTable<Repository>
                    className="min-w-full"
                    isLoading={isFetching}
                    columns={columns}
                    data={[...selectedRepo, ...otherRepos]}
                    initialSelection={shouldSelectMember}
                    onSelectionChange={(selectedRows) =>
                        onSelectionChange?.(selectedRows)
                    }
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                />
                <div className="text-muted text-sm mt-3">
                    You can add or remove repositories at any time
                </div>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default RepositoryList;
