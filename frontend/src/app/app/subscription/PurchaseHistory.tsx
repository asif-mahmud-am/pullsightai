import { usePurchaseHistoryQuery } from "@/api/queries/subscription";
import DataTable from "@/components/reusable/DataTable";
import usePagination from "@/hooks/usePagination";
import { formatDate } from "@/lib/dayjs";
import { Transaction } from "@/types/transaction";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

const columns:ColumnDef<Transaction>[]  = [
        {
        accessorKey: "serviceBookingId",
        header: "Details",
        meta: {
            headerClassName: "min-w-64 flex-1",
            cellClassName: "min-w-64 flex-1",
        },
        cell: ({ row }) => (
            <div>
                <div className="opacity-50 truncate ">
                    Purchased {row.original?.service}
                </div>
                <div>{row.original?.serviceBookingId?.title}</div>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <span className="text-white mb-1 text-md">
                    ${row.getValue("amount")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <span className="text-white mb-1 text-md">
                    {formatDate(row.getValue("createdAt"))}
                </span>
            </div>
        ),
    }
]

const PurchaseHistory = ({

}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isFetching } = usePurchaseHistoryQuery({
        page: currentPage,
        limit: 10,
    });
    console.log(data?.data)

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });
    return (
        <>
            <DataTable
                columns={columns}
                isLoading={isFetching}
                data={data?.data?.docs || []}
            />
            <Pagination />
        </>
    );
};

export default PurchaseHistory;