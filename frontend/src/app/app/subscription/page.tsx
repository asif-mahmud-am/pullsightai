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
    const getBillingStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20">
                        Paid
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20">
                        Pending
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20">
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/20">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Subscription</h1>
                    <p className="text-muted-foreground">
                        Manage your subscription and billing
                    </p>
                </div>
            </div>

            {/* Current Plan */}
            <CurrentPlan />

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockBillingHistory.map((bill) => (
                            <div
                                key={bill.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">
                                            {bill.description}
                                        </p>
                                        {getBillingStatusBadge(bill.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(bill.date)} • {bill.invoice}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold">
                                        ${bill.amount}
                                    </p>
                                    <Button variant="ghost" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionPage;
