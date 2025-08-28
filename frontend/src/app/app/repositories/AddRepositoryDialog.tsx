"use client";

import { useState } from "react";
import { Search, GitBranch } from "lucide-react";
import {
    useOtherRepositoryQuery,
    useAddRepositoryMutation,
} from "@/api/queries/repository";
import Dialog from "@/components/reusable/Dialog";
import Input from "@/components/reusable/Input";
import DataTable from "@/components/reusable/DataTable";
import { Repository } from "@/types/repository";
import { showToast } from "@/lib/toast";
import usePagination from "@/hooks/usePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface AddRepositoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Define columns for the repository table
const createColumns = (
    selectedRepos: Repository[],
    onRepoToggle: (repo: Repository) => void
): ColumnDef<Repository>[] => [
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
        cell: ({ row }) => {
            const isSelected = selectedRepos.some(
                (r) => r.id === row.original.id
            );
            return (
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onRepoToggle(row.original)}
                    aria-label="Select repository"
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Repository Name",
        cell: ({ row }) => {
            const repo = row.original;
            return (
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                    <div>
                        <div className="font-medium text-sm">{repo.name}</div>
                        <div className="text-xs text-gray-500">
                            {repo.slug || repo.name}
                        </div>
                    </div>
                </div>
            );
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
            const repo = row.original;
            const searchText = filterValue?.toLowerCase() || "";
            return (
                repo.name.toLowerCase().includes(searchText) ||
                repo.slug?.toLowerCase().includes(searchText) ||
                false
            );
        },
    },
    {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => {
            const provider = row.getValue("provider") as string;
            return provider ? (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full capitalize">
                    {provider}
                </span>
            ) : null;
        },
    },
    {
        accessorKey: "createdOn",
        header: "Created",
        cell: ({ row }) => {
            const date = row.getValue("createdOn") as
                | string
                | number
                | Date
                | null
                | undefined;
            return date ? (
                <div className="text-sm text-gray-600">{formatDate(date)}</div>
            ) : (
                <div className="text-sm text-gray-400">-</div>
            );
        },
    },
];

const AddRepositoryDialog = ({
    open,
    onOpenChange,
}: AddRepositoryDialogProps) => {
    const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [columnFilters, setColumnFilters] = useState<
        { id: string; value: unknown }[]
    >([]);

    const user = useAuthStore((s) => s.user);

    // Fetch other repositories for the dialog with pagination
    const { data, isLoading: isLoadingOtherRepos } = useOtherRepositoryQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        isEnabled: open,
        page: currentPage,
        limit: 10, // Show 10 items per page
    });
    const otherRepos = data?.data?.docs;

    // Mutation for adding repositories
    const addRepositoryMutation = useAddRepositoryMutation();

    // Handle repository selection
    const handleRepoToggle = (repo: Repository) => {
        setSelectedRepos((prev) => {
            const isSelected = prev.some((r) => r.id === repo.id);
            if (isSelected) {
                return prev.filter((r) => r.id !== repo.id);
            } else {
                return [...prev, repo];
            }
        });
    };

    // Set up pagination
    const { Pagination } = usePagination({
        totalPages: Math.ceil((otherRepos?.length || 0) / 10), // This should come from API response
        currentPage,
        onPageChange: setCurrentPage,
    });

    // Create table columns
    const columns = createColumns(selectedRepos, handleRepoToggle);

    // Handle adding repositories
    const handleAddRepositories = async () => {
        if (selectedRepos.length === 0) {
            showToast.error("Please select at least one repository");
            return;
        }

        setIsAdding(true);

        try {
            await addRepositoryMutation.mutateAsync({
                repositories: selectedRepos.map((repo) => ({
                    id: repo.id,
                    name: repo.name,
                    provider: "github", // Make this dynamic later
                })),
            });

            handleDialogClose();
            showToast.success(
                `Successfully added ${selectedRepos.length} repositor${
                    selectedRepos.length === 1 ? "y" : "ies"
                }`
            );
        } catch (error) {
            // Error is already handled by the mutation
            console.error("Failed to add repositories:", error);
        } finally {
            setIsAdding(false);
        }
    };

    // Handle dialog close
    const handleDialogClose = () => {
        if (!isAdding) {
            onOpenChange(false);
            setSelectedRepos([]);
            setColumnFilters([]);
            setCurrentPage(1);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleDialogClose}
            title="Add Repositories"
            description="Select repositories from your connected accounts to add to your workspace"
            size="lg"
            actions={[
                {
                    label: "Cancel",
                    onClick: handleDialogClose,
                    variant: "outline",
                    disabled: isAdding,
                },
                {
                    label: `Add ${selectedRepos.length} Repository${
                        selectedRepos.length !== 1 ? "ies" : ""
                    }`,
                    onClick: handleAddRepositories,
                    variant: "default",
                    loading: isAdding,
                    disabled: selectedRepos.length === 0,
                },
            ]}
            closeOnOverlayClick={!isAdding}
        >
            <div className="space-y-4">
                {/* Search Input */}
                <Input
                    placeholder="Search repositories..."
                    value={
                        (columnFilters.find((f) => f.id === "name")
                            ?.value as string) || ""
                    }
                    onChange={(e) => {
                        const value = e.target.value;
                        setColumnFilters((prev) => {
                            const otherFilters = prev.filter(
                                (f) => f.id !== "name"
                            );
                            return value
                                ? [...otherFilters, { id: "name", value }]
                                : otherFilters;
                        });
                    }}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full"
                />

                {/* Repository Table */}
                <div className="space-y-4">
                    <DataTable
                        isLoading={isLoadingOtherRepos}
                        columns={columns}
                        data={otherRepos || []}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        className="min-w-full"
                    />

                    {/* Pagination */}
                    <Pagination />
                </div>

                {/* Selection Summary */}
                {selectedRepos.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>{selectedRepos.length}</strong> repository
                            {selectedRepos.length !== 1 ? "ies" : ""} selected
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedRepos.map((repo) => (
                                <span
                                    key={repo.id}
                                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                >
                                    {repo.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRepoToggle(repo);
                                        }}
                                        className="ml-1 hover:text-blue-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default AddRepositoryDialog;
