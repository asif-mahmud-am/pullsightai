"use client";

import { useGetWorkspaceTeamMembersQuery } from "@/api/queries/workspace";
import ContentCard from "@/components/reusable/ContentCard";
import DataTable from "@/components/reusable/DataTable";
import usePagination from "@/hooks/usePagination";
import { useState } from "react";
import { columns } from "./tableColumns";

const TeamActivityPage = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isFetching } = useGetWorkspaceTeamMembersQuery({
        page: currentPage,
        limit: 10,
        isEnabled: true,
    });

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });
    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-semibold">Team Members</h2>
            </div>
            {/* Table */}
            <ContentCard className="">
                <ContentCard.Header className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Team Members
                    </h2>
                </ContentCard.Header>
                <ContentCard.Body>
                    <DataTable
                        columns={columns}
                        isLoading={isFetching}
                        data={data?.data?.docs || []}
                    />
                    <Pagination />
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};

export default TeamActivityPage;
