import { useCancelPlanMutation } from "@/api/queries/subscription";
import Badge from "@/components/reusable/Badge";
import Button from "@/components/reusable/Button";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { CheckIcon } from "@/components/reusable/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { formatDate, getRemainingDays } from "@/lib/dayjs";
import showToast from "@/lib/toast";
import { numToHip } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { AlertCircle, Calendar, CreditCard, Users, Zap } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

const CurrentPlan = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { selectedWorkspace } = useAuthStore();
    const { mutateAsync: cancelPlan } = useCancelPlanMutation();

    const activePlan = selectedWorkspace?.currentPlan;
    const isTrialPlan = activePlan?.plan?.isDefault;
    const isFreeOrTrialPlan = activePlan?.plan?.isFree === true || isTrialPlan;
    const isPaidPlan = activePlan?.plan?.isFree === false && !isTrialPlan;

    const handleCancelPlan = async () => {
        await cancelPlan().then(() => {
            showToast.success("Subscription cancelled successfully");
        });
    };

    return (
        <div className="space-y-6">
            {/* Your current plan header */}
            <div className="flex items-center justify-between gap-3">
                <div className="mr-7">
                    <h2 className="text-xl font-semibold ">
                        Your current plan
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        View more about your active plan.
                    </p>
                </div>
                <div className="border mr-auto p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-0">
                        Available Tokens
                    </p>
                    <p className="text-xl font-bold">
                        {numToHip(
                            (activePlan?.remainingToken || 0) +
                                (selectedWorkspace?.currentPack
                                    ?.remainingToken || 0),
                            1
                        )}{" "}
                        /{" "}
                        <span className="text-muted-foreground text-sm">
                            {numToHip(
                                (activePlan?.totalToken || 0) +
                                    (selectedWorkspace?.currentPack
                                        ?.totalToken || 0),
                                1
                            )}
                        </span>
                    </p>
                </div>
                <Link href={ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS}>
                    <Button>
                        {isFreeOrTrialPlan ? "Upgrade Plan" : "Change Plan"}
                    </Button>
                </Link>
                {isPaidPlan && (
                    <Button
                        variant="outline"
                        onClick={() => setShowConfirm(true)}
                    >
                        Cancel Subscription
                    </Button>
                )}
            </div>
            {/* Plan details card */}
            <Card className="border-0">
                <CardContent className="px-5 py-1">
                    <div className="grid grid-cols-3 gap-7">
                        <div className="border rounded-2xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Plan</p>
                            <div className="flex justify-between">
                                <p className="text-2xl font-bold ">
                                    {activePlan?.plan?.title || "Free"}
                                </p>
                                <div className="flex items-baseline mt-1">
                                    {isFreeOrTrialPlan ? (
                                        <span className="text-xl font-semibold text-green-600">
                                            {isTrialPlan ? "Trial" : "Free"}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-xl font-semibold ">
                                                $
                                                {activePlan?.plan
                                                    ?.pricePerDev || "0"}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">
                                                /dev
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-2xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Pay</p>
                            <p className="text-2xl font-bold capitalize">
                                {isFreeOrTrialPlan
                                    ? isTrialPlan
                                        ? "Trial Period"
                                        : "Free Forever"
                                    : activePlan?.billingCycle}
                            </p>
                        </div>

                        <div className="border rounded-2xl p-4">
                            <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                {isTrialPlan
                                    ? "Trial Ends"
                                    : isFreeOrTrialPlan
                                    ? "Plan Status"
                                    : "Renews at"}
                            </p>
                            <p className="text-2xl font-bold ">
                                {isFreeOrTrialPlan && !isTrialPlan
                                    ? "No expiration"
                                    : activePlan?.periodEnd
                                    ? formatDate(activePlan?.periodEnd)
                                    : "-"}
                            </p>
                        </div>
                        {!isFreeOrTrialPlan && (
                            <>
                                <div className="border rounded-2xl p-4">
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        Total Seats
                                    </p>
                                    <div className="flex justify-between">
                                        <p className="text-2xl font-bold ">
                                            {activePlan?.numOfSeat || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="border rounded-2xl p-4">
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        Total {activePlan?.billingCycle} cost
                                    </p>
                                    <div className="flex justify-between">
                                        <p className="text-2xl font-bold ">
                                            $
                                            {activePlan?.numOfSeat
                                                ? activePlan?.numOfSeat *
                                                  (activePlan?.plan
                                                      ?.pricePerDev ?? 0)
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="border rounded-2xl p-4">
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        Tokens per Dev
                                    </p>
                                    <div className="flex justify-between">
                                        <p className="text-2xl font-bold ">
                                            {activePlan?.plan?.tokenLimitPerDev
                                                ? numToHip(
                                                      activePlan?.plan
                                                          ?.tokenLimitPerDev,
                                                      1
                                                  )
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Include section */}
            {(activePlan?.plan?.features?.length || 0) > 0 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold ">Include</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            See everything included in your plan.
                        </p>
                    </div>

                    <Card className="border max-w-[400px]">
                        <CardContent className="p-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-4">
                                Features
                            </h4>
                            <ul className="space-y-2 divide-y">
                                {activePlan?.plan?.features?.map(
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
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Alerts for trial/subscription ending */}
            {isTrialPlan &&
                getRemainingDays(activePlan?.periodEnd || "") <= 15 && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-primary">
                                    Trial Ending Soon
                                </p>
                                <p className="text-sm text-primary/80">
                                    Your trial period ends on{" "}
                                    {formatDate(activePlan?.periodEnd || "")}.{" "}
                                    <Link
                                        href={
                                            ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS
                                        }
                                        className="underline font-medium"
                                    >
                                        Upgrade now
                                    </Link>{" "}
                                    to continue using premium features.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            {isPaidPlan &&
                getRemainingDays(activePlan?.periodEnd || "") < 15 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-600">
                                    Subscription Ending
                                </p>
                                <p className="text-sm text-yellow-600/80">
                                    Your subscription will end on{" "}
                                    {formatDate(activePlan?.periodEnd || "")}.
                                    You{`'`}ll still have access until then.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            {/* Cancel Plan Dialog */}
            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Cancel Subscription"
                description="Are you sure you want to cancel your subscription? You will retain access to your current plan until the end of your billing period."
                onConfirm={handleCancelPlan}
                confirmText="Cancel Subscription"
                variant="destructive"
            />
        </div>
    );
};

export default CurrentPlan;
