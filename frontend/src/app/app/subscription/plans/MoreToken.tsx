import {
    useGetPacksQuery,
    usePurchasePackMutation,
} from "@/api/queries/subscription";
import Dialog from "@/components/reusable/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import showToast from "@/lib/toast";
import { Pack } from "@/types/pack";
import { ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const MoreToken = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPackId, setSelectedPackId] = useState<string>("");

    const { data: packs } = useGetPacksQuery();
    const { mutateAsync: purchasePack, isPending } = usePurchasePackMutation();

    const selectedPack = packs?.data?.find(
        (pack: Pack) => pack._id === selectedPackId
    );

    const handlePurchase = async () => {
        if (!selectedPackId) {
            showToast.error("Please select a token pack");
            return;
        }

        await purchasePack({ packId: selectedPackId, gateway: "stripe" }).then(
            (data) => {
                if (data.data.url) {
                    window.location.href = data.data.url;
                }
            }
        );
    };

    return (
        <>
            <div className="max-w-8xl mx-auto mb-20 flex justify-between items-center gap-6">
                <button
                    className="bg-card px-6 py-7 rounded-3xl flex text-left gap-5 items-center max-w-[450px] hover:bg-card/80 transition-colors cursor-pointer"
                    role="button"
                    onClick={() => setDialogOpen(true)}
                >
                    <ShieldCheck className="h-12 w-auto stroke-primary" />
                    <div>
                        <h3 className="text-lg font-semibold">
                            Need more tokens?
                        </h3>
                        <p className="text-muted-foreground">
                            Buy one‑time token packs that carry over to the next
                            cycle.
                        </p>
                    </div>
                </button>
                <div className="flex items-end flex-col">
                    <h4 className="text-muted-foreground mb-2 text-sm">
                        Payment Method:
                    </h4>
                    <Image
                        src="/images/stripe.png"
                        alt="stripe gateway"
                        width={115}
                        height={48}
                    />
                </div>
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Purchase Token Pack"
                description="Select a token pack to purchase additional tokens for your workspace."
                size="xl"
                actions={[
                    {
                        label: "Cancel",
                        onClick: () => setDialogOpen(false),
                        variant: "outline",
                    },
                    {
                        label: "Purchase Pack",
                        onClick: handlePurchase,
                        variant: "default",
                        loading: isPending,
                        disabled: !selectedPackId || isPending,
                    },
                ]}
            >
                <div className="space-y-6">
                    {packs && packs?.data?.length > 0 ? (
                        <RadioGroup
                            value={selectedPackId}
                            onValueChange={setSelectedPackId}
                            className="space-y-4 grid grid-cols-3"
                        >
                            {packs?.data
                                ?.filter(
                                    (pack: Pack) =>
                                        pack.isActive && pack.isPublic
                                )
                                .map((pack: Pack) => (
                                    <div key={pack._id} className="relative">
                                        <RadioGroupItem
                                            value={pack._id}
                                            id={pack._id}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={pack._id}
                                            className="flex cursor-pointer"
                                        >
                                            <Card
                                                className={`flex-1 border-2 transition-all hover:border-gray-300 ${
                                                    selectedPackId === pack._id
                                                        ? "border-primary bg-primary/5"
                                                        : ""
                                                }`}
                                            >
                                                <CardContent className="px-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex gap-3 mb-2">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
                                                                    <Zap className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-lg">
                                                                        {
                                                                            pack.title
                                                                        }
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            pack.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6 mt-4">
                                                                <div className="">
                                                                    <p className="text-2xl font-bold ">
                                                                        {pack.token.toLocaleString()}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Tokens
                                                                    </p>
                                                                </div>
                                                                <div className="">
                                                                    <p className="text-2xl font-bold">
                                                                        $
                                                                        {
                                                                            pack.price
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        One-time
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Label>
                                    </div>
                                ))}
                        </RadioGroup>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No token packs available at the moment.
                            </p>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default MoreToken;
