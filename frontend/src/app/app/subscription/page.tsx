"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import CurrentPlan from "./CurrentPlan";

const SubscriptionPage = () => {
    return (
        <AdminGuard shouldRedirectTo403>
            <div className="space-y-8">
                {/* Current Plan */}
                <CurrentPlan />
            </div>
        </AdminGuard>
    );
};

export default SubscriptionPage;
