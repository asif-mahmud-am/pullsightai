"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import Dialog from "./Dialog";
import { Crown } from "lucide-react";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { redirect } from "next/navigation";

export interface UpgradePlanDialogProps {
    title?: string;
    description?: string;
    featureName?: string;
    featureDescription?: string;
    benefits?: string[];
    ctaText?: string;
    ctaLink?: string;
}

export interface UpgradePlanDialogRef {
    show: (props?: Partial<UpgradePlanDialogProps>) => void;
    hide: () => void;
}

const defaultBenefits: any[] = [];

const UpgradePlanDialog = forwardRef<
    UpgradePlanDialogRef,
    UpgradePlanDialogProps
>(
    (
        {
            title = "Upgrade Required",
            description = "Unlock the full potential of PullSight with advanced features.",
            featureName = "Premium Feature",
            featureDescription = "Upgrade to a premium plan to access this feature.",
            benefits = defaultBenefits,
            ctaText = "Upgrade Now",
            ctaLink = ROUTE_CONSTANTS.APP_SUBSCRIPTION_PLANS,
        },
        ref
    ) => {
        const [open, setOpen] = useState(false);
        const [dynamicProps, setDynamicProps] = useState<
            Partial<UpgradePlanDialogProps>
        >({});

        // Merge default props with dynamic props
        const currentProps = {
            title: dynamicProps.title ?? title,
            description: dynamicProps.description ?? description,
            featureName: dynamicProps.featureName ?? featureName,
            featureDescription:
                dynamicProps.featureDescription ?? featureDescription,
            benefits: dynamicProps.benefits ?? benefits,
            ctaText: dynamicProps.ctaText ?? ctaText,
            ctaLink: dynamicProps.ctaLink ?? ctaLink,
        };

        useImperativeHandle(ref, () => ({
            show: (props?: Partial<UpgradePlanDialogProps>) => {
                if (props) {
                    setDynamicProps(props);
                }
                setOpen(true);
            },
            hide: () => setOpen(false),
        }));

        return (
            <Dialog
                open={open}
                onOpenChange={setOpen}
                title={currentProps.title}
                description={currentProps.description}
                size="sm"
                actions={[
                    {
                        label: "Maybe Later",
                        onClick: () => setOpen(false),
                        variant: "outline",
                    },
                    {
                        label: currentProps.ctaText,
                        onClick: () => {
                            setOpen(false);
                            // Navigate to upgrade page
                            redirect(currentProps.ctaLink);
                        },
                        variant: "default",
                    },
                ]}
            >
                <div className=" space-y-6">
                    {/* Simple Lock Icon */}
                    <div className="flex">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    {/* Simple Message */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold ">
                            {currentProps.featureName}
                        </h3>
                        <p className="text-gray-400">
                            {currentProps.featureDescription}
                        </p>
                    </div>

                    {/* Simple Benefits */}
                    <div className="space-y-2">
                        {currentProps.benefits
                            .slice(0, 3)
                            .map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center  gap-2 text-sm text-gray-400"
                                >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    <span>{benefit}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </Dialog>
        );
    }
);

UpgradePlanDialog.displayName = "UpgradePlanDialog";

export default UpgradePlanDialog;
