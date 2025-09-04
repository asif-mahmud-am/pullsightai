"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    CreditCard,
    Calendar,
    Download,
    Users,
    Zap,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { formatDate } from "@/lib/dayjs";
import { useAuthStore } from "@/store/authStore";
import Badge from "@/components/reusable/Badge";
import { useCancelPlanMutation } from "@/api/queries/subscription";
import CurrentPlan from "./CurrentPlan";

// Mock data - replace with real subscription data
const mockSubscription = {
    plan: "Pro",
    status: "active",
    currentPeriodEnd: "2025-10-04",
    amount: 10,
    currency: "USD",
    interval: "month",
    seats: 5,
    tokensPerUser: 15000,
    cancelAtPeriodEnd: false,
    trialEnd: null,
};

// Mock billing history
const mockBillingHistory = [
    {
        id: "1",
        date: "2025-09-04",
        amount: 50,
        status: "paid",
        invoice: "INV-001",
        description: "Pro Plan - 5 seats",
    },
    {
        id: "2",
        date: "2025-08-04",
        amount: 50,
        status: "paid",
        invoice: "INV-002",
        description: "Pro Plan - 5 seats",
    },
    {
        id: "3",
        date: "2025-07-04",
        amount: 40,
        status: "paid",
        invoice: "INV-003",
        description: "Pro Plan - 4 seats",
    },
];

const SubscriptionPage = () => {
    return (
        <div className="space-y-8">
            {/* Current Plan */}
            <CurrentPlan />
        </div>
    );
};

export default SubscriptionPage;
