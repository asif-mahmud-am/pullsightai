import { useUserQuery } from "@/api/queries/auth";
import { usePurchasePlanMutation } from "@/api/queries/subscription";
import Badge from "@/components/reusable/Badge";
import Button from "@/components/reusable/Button";
import { ConfirmDialog } from "@/components/reusable/Dialog";
import { CheckIcon } from "@/components/reusable/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRemainingDays } from "@/lib/dayjs";
import showToast from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { Plan } from "@/types/plan";
import { FC, useState } from "react";

interface PricingTableProps {
    isLoading: boolean;
    plans: Plan[];
    seats: number;
}

// Shimmer animation component
const Shimmer = ({ className = "" }) => (
    <div
        className={`animate-pulse bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%] rounded-md ${className}`}
        style={{
            animation: "shimmer 2s infinite linear",
            backgroundSize: "200% 100%",
        }}
    />
);

// Add shimmer keyframes to the component
const shimmerStyles = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`;

// Pricing card skeleton
const PricingCardSkeleton = () => (
    <Card className="relative pt-18 rounded-4xl border">
        {/* Popular badge skeleton */}
        <div className="absolute top-8 left-6">
            <Shimmer className="h-6 w-20 rounded-full" />
        </div>

        <CardHeader className="pb-4 h-[200px]">
            <div className="space-y-4">
                {/* Title */}
                <Shimmer className="h-7 w-32" />

                {/* Description */}
                <div className="space-y-2">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-3/4" />
                </div>

                {/* Price */}
                <div className="mt-auto pt-6">
                    <div className="flex items-baseline gap-1">
                        <Shimmer className="h-6 w-4" />
                        <Shimmer className="h-12 w-20" />
                        <Shimmer className="h-5 w-10" />
                    </div>
                </div>
            </div>
        </CardHeader>

        <CardContent className="space-y-6">
            {/* Subscribe button */}
            <Shimmer className="h-14 w-full rounded-lg" />

            {/* Features list */}
            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 py-2 border-t first:border-t-0"
                    >
                        <Shimmer className="h-4 w-4 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Shimmer
                                className={`h-4 ${
                                    index % 2 === 0 ? "w-full" : "w-4/5"
                                }`}
                            />
                            <Shimmer
                                className={`h-3 ${
                                    index % 3 === 0 ? "w-3/4" : "w-2/3"
                                }`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const enterprisePlanFeatures = [
    {
        title: "Usage:",
        description: "Unlimited PR tokens(custom contract)",
    },
    {
        title: "Seats:",
        description: "25+ developers",
    },
    {
        title: "Features:",
        description: "All Pro features + custom retention",
    },
    {
        title: "Security:",
        description: "SOC2, SSO/SAML, DPA/SLA, VPC/air‑gapped runners",
    },
    {
        title: "Dashboard:",
        description: "Trends (30‑day retention), repo & team filters",
    },
    {
        title: "Integrations:",
        description: "Slack / Discord alerts",
    },
    {
        title: "Governance:",
        description:
            "Soft policy gates (warn on severity/size; never block merges)",
    },
    {
        title: "Support:",
        description: "Dedicated CSM + premium onboarding",
    },
];

interface PricingTableProps {
    isLoading: boolean;
    plans: Plan[];
    seats: number;
}

const SinglePlanCard: FC<{
    plan: Plan;
    seats: number;
    isSelected: boolean;
}> = ({ plan, seats, isSelected }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedWorkspace } = useAuthStore();

    const { mutateAsync, isPending } = usePurchasePlanMutation();
    const { refetch, isFetching } = useUserQuery({
        isEnabled: false,
    });

    const handleSubscribe = async (plan: Plan, skipFreeCheck = false) => {
        // Handle subscription logic here
        if (plan?.isFree && !skipFreeCheck) {
            setIsOpen(true);
            return;
        }
        await mutateAsync({
            gateway: "stripe",
            planId: plan._id,
            noOfSeat: seats,
        })
            .then((res) => {
                if (res?.data?.url) {
                    window.location.href = res.data.url;
                } else {
                    refetch();
                }
            })
            .catch((error) => {
                showToast.error("Failed to initiate subscription");
            });
    };
    const handleFreePlanSubscription = async (plan: Plan) => {
        handleSubscribe(plan, true);
    };

    return (
        <>
            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title="Confirm Free Plan"
                description="Are you sure you want to subscribe to this plan? All other members except workspace owner will be disabled."
                onConfirm={() => handleFreePlanSubscription(plan)}
            />
            <Card
                key={plan._id}
                className={`relative pt-18 rounded-4xl ${
                    plan.highlight ? "border-white border-2" : "border-0"
                }`}
            >
                {plan.highlight && (
                    <Badge className="bg-white absolute top-8 left-6">
                        {plan.highlight}
                    </Badge>
                )}

                <CardHeader className="pb-4 h-[200px]">
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-8">
                        {plan.description}
                    </p>
                    <div className="mt-auto flex items-center">
                        <div className="flex-1">
                            <span className="text-3xl font-semibold">$</span>
                            <span className="text-5xl font-bold">
                                {plan.pricePerDev}
                            </span>
                            <span className="text-lg font-semibold text-muted-foreground">
                                /dev
                            </span>
                        </div>
                        {isSelected && (
                            <Badge className="bg-neutral-500">
                                Current Plan
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                        <Zap className="w-5 h-5" />
                        {(
                            plan.tokenLimitPerDev * seats
                        ).toLocaleString()}{" "}
                        tokens/month
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {plan.tokenLimitPerDev.toLocaleString()}{" "}
                        tokens per user
                    </p>
                </div> */}

                    <Button
                        className={`w-full font-semibold h-[56px]`}
                        size="lg"
                        onClick={() => handleSubscribe(plan)}
                        disabled={
                            getRemainingDays(
                                selectedWorkspace?.currentPlan?.periodEnd || ""
                            ) < 0 &&
                            isSelected &&
                            selectedWorkspace?.currentPlan?.numOfSeat == seats
                        }
                        isLoading={isPending || isFetching}
                    >
                        Subscribe
                    </Button>

                    <div>
                        <ul className="space-y-2 divide-y">
                            {plan.features.map((feature, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm py-3"
                                >
                                    <CheckIcon className="mt-3" />
                                    <div>
                                        <div>{feature?.title}</div>
                                        <div className="text-neutral-500">
                                            {feature?.description}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

const PricingTable: FC<PricingTableProps> = ({ isLoading, plans, seats }) => {
    const { selectedWorkspace } = useAuthStore();

    return (
        <>
            <style>{shimmerStyles}</style>
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 max-w-8xl mx-auto mb-20">
                    {[...Array(4)].map((_, index) => (
                        <PricingCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 max-w-8xl mx-auto mb-20 justify-center">
                    {plans?.map((plan: Plan) => {
                        const isSelected =
                            selectedWorkspace?.currentPlan?.plan?._id ===
                            plan._id;
                        return (
                            <SinglePlanCard
                                key={plan._id}
                                plan={plan}
                                seats={seats}
                                isSelected={isSelected}
                            />
                        );
                    })}
                    <Card className={`relative pt-18 rounded-4xl border-0`}>
                        <CardHeader className="pb-4 h-[200px]">
                            <CardTitle className="text-xl">
                                Enterprise Plan
                            </CardTitle>
                            <p className="text-muted-foreground text-sm mb-8">
                                For enterprises with strict compliance & scale
                                needs
                            </p>
                            <div className=" mt-auto">
                                <span className="text-xl font-semibold">
                                    Custom Pricing
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                                <Zap className="w-5 h-5" />
                                {(
                                    plan.tokenLimitPerDev * seats
                                ).toLocaleString()}{" "}
                                tokens/month
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {plan.tokenLimitPerDev.toLocaleString()}{" "}
                                tokens per user
                            </p>
                        </div> */}

                            <Button
                                className={`w-full font-semibold h-[56px]`}
                                size="lg"
                                // onClick={() => handleSubscribe(plan)}
                            >
                                Contact sales
                            </Button>

                            <div>
                                <ul className="space-y-2 divide-y">
                                    {enterprisePlanFeatures.map(
                                        (feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2 text-sm py-3"
                                            >
                                                <CheckIcon className="mt-3" />
                                                <div>
                                                    <div>{feature?.title}</div>
                                                    <div className="text-neutral-500">
                                                        {feature?.description}
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};

export default PricingTable;
