import Pagination from "@/components/reusable/Pagination";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UsePaginationOptions {
    totalPages: number;
}

interface PaginationProps {
    className?: string;
}

const usePagination = ({ totalPages }: UsePaginationOptions) => {
    const [currentPage, setCurrentPage] = useState(1);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const PaginationComponent = ({ className }: PaginationProps) => {
        return (
            <Pagination
                className={cn("mt-4", className)}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={goToPage}
            />
        );
    };

    return {
        currentPage,
        setCurrentPage: goToPage,
        Pagination: PaginationComponent,
    };
};

export default usePagination;
