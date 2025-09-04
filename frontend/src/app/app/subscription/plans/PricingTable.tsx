import { usePurchasePlanMutation } from "@/api/queries/subscription";
import Badge from "@/components/reusable/Badge";
import Button from "@/components/reusable/Button";
import { CheckIcon } from "@/components/reusable/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Plan } from "@/types/plan";
import { Loader2Icon } from "lucide-react";
import { FC } from "react";

interface PricingTableProps {
    isLoading: boolean;
    plans: Plan[];
    seats: number;
}

const PricingTable: FC<PricingTableProps> = ({ isLoading, plans, seats }) => {
    const { selectedWorkspace } = useAuthStore();
    const { mutateAsync } = usePurchasePlanMutation();

    const handleSubscribe = async (plan: Plan) => {
        // Handle subscription logic here
        console.log("Subscribing to plan:", plan);
        await mutateAsync({
            gateway: "stripe",
            planId: plan._id,
            noOfSeat: seats,
        }).then((res) => {
            window.location.href = res.data.url;
        });
    };
    return (
        <>
            {isLoading ? (
                <div className="px-6 py-10">
                    <Loader2Icon className="animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                    {plans?.map((plan: Plan) => {
                        const isSelected =
                            selectedWorkspace?.currentPlan?.plan?._id ===
                            plan._id;
                        return (
                            <Card
                                key={plan.title}
                                className={`relative pt-18 rounded-4xl ${
                                    plan.highlight
                                        ? "border-white border-2"
                                        : "border-0"
                                }`}
                            >
                                {plan.highlight && (
                                    <Badge className="bg-white absolute top-8 left-6">
                                        {plan.highlight}
                                    </Badge>
                                )}

                                <CardHeader className="pb-4 h-[200px]">
                                    <CardTitle className="text-xl">
                                        {plan.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm mb-8">
                                        {plan.description}
                                    </p>
                                    <div className=" mt-auto">
                                        <span className="text-3xl font-semibold">
                                            $
                                        </span>
                                        <span className="text-5xl font-bold">
                                            {plan.pricePerDev}
                                        </span>
                                        <span className="text-lg font-semibold text-muted-foreground">
                                            /dev
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
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={isSelected}
                                    >
                                        {isSelected
                                            ? "Current Plan"
                                            : "Subscribe"}
                                    </Button>

                                    <div>
                                        <ul className="space-y-2 divide-y">
                                            {plan.features.map(
                                                (feature, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2 text-sm py-3"
                                                    >
                                                        <CheckIcon className="mt-3" />
                                                        <div>
                                                            <div>
                                                                {feature?.title}
                                                            </div>
                                                            <div className="text-neutral-500">
                                                                {
                                                                    feature?.description
                                                                }
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default PricingTable;
