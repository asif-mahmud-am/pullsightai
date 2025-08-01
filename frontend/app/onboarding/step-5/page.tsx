"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useReviewPullRequestQuery } from "@/api/queries/pullRequest";

const Step5Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    if (!repoId || !prId) {
        redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
    }

    const { data, isLoading, error } = useReviewPullRequestQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        repoId,
        prId,
    });

    const onStepComplete = () => {
        // You can add your API call or navigation logic here

        redirect(`/onboarding/step-5`);
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Generate your first AI-powered review
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        Please wait a moment. Our AI is now deeply analyzing PR
                        Improve database query performance to identify potential
                        bugs, performance bottlenecks, security flaws, and style
                        inconsistencies.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-8">
                    <div className="mb-4">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            PR Summary
                        </h3>
                        <div className="bg-dark-900 border border-dashed py-25 rounded-xl"></div>
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Invite team members"
                isEnabled={true}
                // isLoading={isPending}
                onClick={onStepComplete}
                onBackClick={() => redirect("/onboarding/step-3")}
                onSkipClick={() => redirect("/dashboard")}
            />
        </>
    );
};

export default Step5Page;
