"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ActionDropdownProps<TData> {
    row: Row<TData>;
}

interface DataTableProps<TData> {
    className?: string;
    isLoading?: boolean;
    columns: ColumnDef<TData>[];
    data: TData[];
    noBorder?: boolean;
    onSelectionChange?: (selectedRows: TData[]) => void;
    initialSelection?: (row: TData) => boolean;
    columnFilters?: { id: string; value: unknown }[];
    onColumnFiltersChange?: (filters: { id: string; value: unknown }[]) => void;
}

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

// SearchInput removed; parent should render any search UI and control filtering logic

const DataTable = <TData,>({
    className,
    isLoading,
    columns,
    data,
    noBorder = true,
    onSelectionChange,
    initialSelection,
    columnFilters,
    onColumnFiltersChange,
}: DataTableProps<TData>) => {
    const [rowSelection, setRowSelection] = useState({});
    const prevDataLength = useRef<number>(0);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
            columnFilters: columnFilters || [],
        },
        onColumnFiltersChange: onColumnFiltersChange
            ? (updaterOrValue) => {
                  // updaterOrValue can be a value or a function
                  const nextFilters =
                      typeof updaterOrValue === "function"
                          ? updaterOrValue(columnFilters || [])
                          : updaterOrValue;
                  // Always pass an array
                  onColumnFiltersChange(
                      Array.isArray(nextFilters) ? nextFilters : []
                  );
              }
            : undefined,
        enableRowSelection: true,
        enableFilters: true,
    });

    // Set initial selection based on initialSelection function
    useEffect(() => {
        if (
            initialSelection &&
            data.length > 0 &&
            data.length !== prevDataLength.current
        ) {
            const initialSelectionState: Record<string, boolean> = {};
            data.forEach((row, index) => {
                if (initialSelection(row)) {
                    initialSelectionState[index.toString()] = true;
                }
            });
            setRowSelection(initialSelectionState);
            prevDataLength.current = data.length;
        }
    }, [data, initialSelection]);

    // Call the callback whenever selection changes
    useEffect(() => {
        if (onSelectionChange) {
            const selectedRows = table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original);
            onSelectionChange(selectedRows);
        }
    }, [rowSelection, table]);

    return (
        <div
            className={cn(
                `rounded-md border relative overflow-hidden`,
                noBorder && "border-0",
                className
            )}
        >
            <Table>
                <TableHeader
                    className={cn("bg-card", noBorder && "[&_tr]:border-b-0")}
                >
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="px-5 py-3 text-muted text-xs"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className={cn(noBorder && "border-0")}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className="px-5 py-3"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
};

export default DataTable;
