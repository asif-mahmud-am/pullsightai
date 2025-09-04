"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Check, ArrowLeft, Users, Zap, X } from "lucide-react";
import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import {
    useGetSubscriptionPlansQuery,
    usePurchasePlanMutation,
} from "@/api/queries/subscription";
import { Plan } from "@/types/plan";
import { CheckIcon } from "@/components/reusable/icons";
import PricingTable from "./PricingTable";
import MoreToken from "./MoreToken";

const PricingPlansPage = () => {
    const [billingInterval, setBillingInterval] = useState<
        "monthly" | "yearly"
    >("monthly");
    const [seats, setSeats] = useState<number>(5);

    const { data, isFetching } = useGetSubscriptionPlansQuery();

    let plans = data?.data?.filter(
        (plan: Plan) => plan.isActive && plan.isPublic
    );
    if (billingInterval === "yearly") {
        plans = plans?.filter(
            (plan: Plan) =>
                plan.billingCycle === "yearly" || plan.billingCycle == ""
        );
    }

    const getSavings = () => {
        const yearlyPlans = data?.data
            ?.filter((plan) => plan.billingCycle === "yearly")
            .find((plan) => !plan.isFree);
        const monthlyPlans = data?.data
            ?.filter(
                (plan) =>
                    plan.billingCycle === "monthly" || plan.billingCycle === ""
            )
            .find((plan) => !plan.isFree);

        // calculate bases on one monthly and one yearly plan
        const yearlyPrice = yearlyPlans?.pricePerDev || 0;
        const monthlyPrice = monthlyPlans?.pricePerDev || 0;

        const savings = monthlyPrice * 12 - yearlyPrice;
        // return %
        return savings > 0
            ? `${Math.round((savings / (monthlyPrice * 12)) * 100)}%`
            : null;
    };

    return (
        <div className="space-y-8 pt-8 xl:-ml-[260px] bg-background relative">
            <div className="container mx-auto">
                <Link
                    href={ROUTE_CONSTANTS.APP_SUBSCRIPTION}
                    className="absolute right-0 top-0 bg-white/10 w-12 h-12 inline-flex items-center justify-center rounded-full"
                >
                    <X />
                </Link>
                <div className="text-center space-y-4 max-w-[570px] mx-auto">
                    <h1 className="text-4xl font-bold">
                        Choose your team plan and discover instant AI code
                        insights
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Simple, transparent pricing - pay only for what you
                        need.
                    </p>
                </div>

                <div className="grid grid-cols-12 max-w-8xl mx-auto items-center gap-6 my-6">
                    {/* Seats Selector */}
                    <div className="col-span-4 col-start-5">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center">
                                <Badge
                                    variant="outline"
                                    className="text-lg font-semibold"
                                >
                                    {seats}
                                </Badge>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Seats Total
                                </label>
                            </div>
                            <Slider
                                value={[seats]}
                                onValueChange={(value) => setSeats(value[0])}
                                max={25}
                                min={1}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1 dev</span>
                                <span>25 devs</span>
                            </div>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex justify-end col-span-3 col-start-9">
                        <div className="flex items-center bg-card rounded-lg p-1">
                            <button
                                onClick={() => setBillingInterval("monthly")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    billingInterval === "monthly"
                                        ? "bg-white text-gray-900"
                                        : "text-muted-foreground hover:text-white"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingInterval("yearly")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                                    billingInterval === "yearly"
                                        ? "bg-white text-gray-900"
                                        : "text-muted-foreground hover:text-white"
                                }`}
                            >
                                Yearly
                                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1">
                                    Save {getSavings()}
                                </Badge>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <PricingTable
                    isLoading={isFetching}
                    plans={plans || []}
                    seats={seats}
                />

                <MoreToken />

                {/* Trust & Social Proof Section */}
                <div className="mx-auto max-w-8xl">
                    <div className="mb-8">
                        <Badge className="mb-4 bg-gradient-to-r from-blue-400 to-green-400 text-neutral-800 border-0 rounded-2xl h-7 px-4">
                            Trusted by
                        </Badge>
                        <h2 className="text-3xl font-bold mb-2">
                            Trusted by Engineering Teams Who Ship Faster
                        </h2>
                        <p className="text-muted-foreground">
                            SOC2 certified, open-source friendly, and proven to
                            cut review time in half.
                        </p>
                    </div>

                    <div className="grid grid-cols-9 gap-6 mb-8">
                        <div className="p-6 bg-card rounded-xl col-span-5">
                            <Check className="w-6 h-6 text-white mb-4" />
                            <h3 className="font-semibold mb-2">
                                SOC2 Type II Certified
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Zero code retention
                            </p>
                        </div>

                        <div className="p-6 bg-card rounded-xl col-span-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="font-semibold mb-2">
                                1M+ PRs reviewed
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Data across 17 enterprise teams, Q2 2024
                            </p>
                        </div>

                        <div className="p-6 bg-card rounded-xl col-span-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="font-semibold mb-2">
                                50%+ reduction in review time
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Internal benchmark, 100-750k
                            </p>
                        </div>

                        <div className="p-6 bg-card rounded-xl col-span-5">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center mx-auto mb-4">
                                <ArrowLeft className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="font-semibold mb-2">
                                60% fewer bugs reaching prod
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Avg. screened customers, Q3 2024
                            </p>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8" />
                                </div>
                            </div>
                            <blockquote className="text-xl font-medium text-center mb-6 max-w-3xl mx-auto">
                                &ldquo;PullSight gave us the speed and
                                confidence we needed—without ever risking our
                                IP. Our 150-person engineering team now ships
                                40% faster.&rdquo;
                            </blockquote>
                            <div className="text-center">
                                <p className="font-medium">
                                    Sophia Kim, Head of Engineering
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 to-teal-500/50"></div>
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
                            No Noise. No Surprises. Just Clarity.
                        </Badge>
                        <h2 className="text-2xl font-bold mb-2">
                            From privacy to accuracy, here&apos;s how PullSight
                            addresses your key concerns
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <details className="group border rounded-xl p-6 bg-card">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold">
                                <span>Worried about spammy AI feedback?</span>
                                <span className="group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <div className="mt-4 text-muted-foreground">
                                Our AI is trained specifically for code review,
                                not generic text generation. We focus on
                                actionable insights, not verbose explanations.
                            </div>
                        </details>

                        <details className="group border rounded-xl p-6 bg-card">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold">
                                <span>Concerned about code privacy?</span>
                                <span className="group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <div className="mt-4 text-muted-foreground">
                                Zero code retention policy and comprehensive
                                data protection. Your data is encrypted in
                                transit and at rest. SOC2 type II certified to
                                keep data extremely secure.
                            </div>
                        </details>

                        <details className="group border rounded-xl p-6 bg-card">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold">
                                <span>Think open-source means complexity?</span>
                                <span className="group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <div className="mt-4 text-muted-foreground">
                                We believe in transparency and community-driven
                                development. Our open-source approach means
                                faster fixes and better features.
                            </div>
                        </details>

                        <details className="group border rounded-xl p-6 bg-card">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold">
                                <span>Worried automation misses context?</span>
                                <span className="group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <div className="mt-4 text-muted-foreground">
                                Our AI understands your codebase context, coding
                                standards, and team preferences. It learns from
                                your patterns to provide relevant, contextual
                                feedback.
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPlansPage;
