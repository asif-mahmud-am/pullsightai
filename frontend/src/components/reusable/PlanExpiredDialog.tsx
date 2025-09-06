"use client";

import React from "react";
import { useAuthStore } from "@/store/authStore";
import Dialog from "./Dialog";
import { AlertTriangle, Clock } from "lucide-react";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useRouter, usePathname } from "next/navigation";

const PlanExpiredDialog = () => {
    const { selectedWorkspace } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Don't show dialog on subscription/plan pages
    const isOnPlanPage = pathname?.includes(
        ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS
    );

    // Check if plan is expired
    const isPlanExpired = React.useMemo(() => {
        if (!selectedWorkspace?.currentPlan) return false;

        const currentDate = new Date();
        const periodEnd = new Date(selectedWorkspace.currentPlan.periodEnd);

        // Check if plan has expired and is not active
        return currentDate > periodEnd;
    }, [selectedWorkspace]);

    // Check if it's a trial that has expired
    const isTrialPlan = React.useMemo(() => {
        if (!selectedWorkspace?.currentPlan) return false;

        // Check if it's a free/trial plan that has expired
        return selectedWorkspace?.currentPlan?.isDefault == true;
    }, [selectedWorkspace]);

    const handleUpgrade = () => {
        router.push(ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS);
    };

    // Don't show dialog if plan is not expired or if user is already on plan page
    if (!isPlanExpired) {
        return null;
    }

    // Don't show dialog on subscription/plan pages since user is already there
    if (isOnPlanPage) {
        return null;
    }

    const dialogTitle = isTrialPlan ? "Trial Expired" : "Plan Expired";
    const dialogDescription = isTrialPlan
        ? "Your free trial has ended. Upgrade to continue using PullSight."
        : "Your subscription has expired. Please renew to continue using PullSight.";

    return (
        <Dialog
            open={true}
            onOpenChange={() => {}} // Prevent closing
            title={dialogTitle}
            description={dialogDescription}
            size="md"
            actions={[
                {
                    label: isTrialPlan ? "Upgrade Now" : "Renew Plan",
                    onClick: handleUpgrade,
                    variant: "default",
                },
            ]}
        >
            <div className="space-y-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        {isTrialPlan ? (
                            <Clock className="w-10 h-10 text-red-600" />
                        ) : (
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        )}
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold ">
                        {isTrialPlan
                            ? "Trial Period Ended"
                            : "Subscription Expired"}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        {isTrialPlan
                            ? "Your 14-day free trial has ended. Upgrade to a paid plan to continue accessing all features and analyzing your pull requests."
                            : "Your subscription has expired. Please renew your plan to continue using PullSight and maintain access to your data."}
                    </p>
                </div>

                {/* Plan Details */}
                {selectedWorkspace?.currentPlan && (
                    <div className=" rounded-lg p-4 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plan:</span>
                                <span className="font-medium">
                                    {selectedWorkspace?.currentPlan?.title}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Expired On:
                                </span>
                                <span className="font-medium">
                                    {selectedWorkspace?.currentPlan
                                        ?.periodEnd &&
                                        new Date(
                                            selectedWorkspace.currentPlan.periodEnd
                                        ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default PlanExpiredDialog;
