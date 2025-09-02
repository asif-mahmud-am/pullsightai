"use client";

import { useGetWorkspaceTeamMembersQuery } from "@/api/queries/workspace";
import ContentCard from "@/components/reusable/ContentCard";
import usePagination from "@/hooks/usePagination";
import { useState } from "react";
import { useOrganizationMembersQuery } from "@/api/queries/member";
import { useAuthStore } from "@/store/authStore";
import ResponsiveTeamMemberList from "./ResponsiveTeamMemberList";
import { TeamMember } from "@/types/user";

const TeamActivityPage = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";

    // const { data, isFetching } = useGetWorkspaceTeamMembersQuery({
    //     page: currentPage,
    //     limit: 10,
    //     isEnabled: true,
    // });
    const {
        data: _data = [],
        isFetching,
        error,
    } = useOrganizationMembersQuery({
        provider,
    });

    const data = _data.sort((a: TeamMember, b: TeamMember) =>
        a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1
    );

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
                    <ResponsiveTeamMemberList
                        data={data || []}
                        isLoading={isFetching}
                    />
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};

export default TeamActivityPage;
