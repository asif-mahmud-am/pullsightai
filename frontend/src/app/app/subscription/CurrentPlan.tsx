import { useCancelPlanMutation } from "@/api/queries/subscription";
import Badge from "@/components/reusable/Badge";
import Button from "@/components/reusable/Button";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { formatDate, getRemainingDays } from "@/lib/dayjs";
import showToast from "@/lib/toast";
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                </CardTitle>
                {isTrialPlan ? (
                    <Badge variant="info" type="faded">
                        Trial
                    </Badge>
                ) : isFreeOrTrialPlan ? (
                    <Badge variant="default" type="faded">
                        Free
                    </Badge>
                ) : selectedWorkspace?.currentPlan?.isActive ? (
                    <Badge variant="success" type="faded">
                        Active
                    </Badge>
                ) : (
                    <Badge variant="destructive" type="faded">
                        Inactive
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="text-lg font-semibold">
                            {selectedWorkspace?.currentPlan?.plan?.title || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {isFreeOrTrialPlan ? "Plan Type" : "Price per Dev"}
                        </p>
                        {isFreeOrTrialPlan ? (
                            <p className="text-lg font-semibold">
                                {isTrialPlan ? "Trial Period" : "Free Forever"}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold">
                                $
                                {selectedWorkspace?.currentPlan?.plan
                                    ?.pricePerDev || "-"}
                                <span className="text-muted-foreground text-sm">
                                    /
                                    {
                                        selectedWorkspace?.currentPlan
                                            ?.billingCycle
                                    }
                                </span>
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Seats
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {selectedWorkspace?.currentPlan?.numOfSeat || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Tokens per Dev
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {selectedWorkspace?.currentPlan?.plan
                                ?.tokenLimitPerDev || "-"}
                            <span className="text-muted-foreground text-sm">
                                /{selectedWorkspace?.currentPlan?.billingCycle}
                            </span>
                        </p>
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            {isFreeOrTrialPlan
                                ? "Total Cost"
                                : "Total Monthly Cost"}
                        </p>
                        {isFreeOrTrialPlan ? (
                            <p className="text-2xl font-bold text-green-600">
                                Free
                            </p>
                        ) : (
                            <p className="text-2xl font-bold">
                                ${selectedWorkspace?.currentPlan?.amount || "-"}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            {isTrialPlan
                                ? "Trial Ends"
                                : isFreeOrTrialPlan
                                ? "Plan Status"
                                : "Next Billing Date"}
                        </p>
                        {isFreeOrTrialPlan && !isTrialPlan ? (
                            <p className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                No expiration
                            </p>
                        ) : (
                            <p className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {selectedWorkspace?.currentPlan?.periodEnd
                                    ? formatDate(
                                          selectedWorkspace?.currentPlan
                                              ?.periodEnd
                                      )
                                    : "-"}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            Available Tokens
                        </p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                            {selectedWorkspace?.currentPlan?.remainingToken ||
                                "-"}{" "}
                            /{" "}
                            {selectedWorkspace?.currentPlan?.totalToken || "-"}
                        </p>
                    </div>
                    <div className="flex-1">{}</div>
                </div>

                <div className="flex gap-3">
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

                {isTrialPlan &&
                    getRemainingDays(activePlan?.periodEnd || "") <= 7 && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-600">
                                        Trial Ending Soon
                                    </p>
                                    <p className="text-sm text-blue-600/80">
                                        Your trial period ends on{" "}
                                        {formatDate(
                                            activePlan?.periodEnd || ""
                                        )}
                                        .{" "}
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
                                        {formatDate(
                                            activePlan?.periodEnd || ""
                                        )}
                                        . You{`'`}ll still have access until
                                        then.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
};

export default CurrentPlan;
