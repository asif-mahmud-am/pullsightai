import React, { FC } from "react";
import {
    ArrowRightIcon,
    LoadingIcon,
    ArrowLeftIcon,
    RightBarArrowIcon,
} from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { useUpdateUserMutation } from "@/api/queries/auth";

interface ActionFooterProps {
    buttonText?: string;
    isEnabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    backButtonText?: string;
    onBackClick?: () => void;
    onSkipText?: string;
    onSkipClick?: () => void;
}

const ActionFooter: FC<ActionFooterProps> = ({
    buttonText,
    onClick,
    isEnabled = false,
    isLoading = false,
    backButtonText = "Back",
    onBackClick,
    onSkipText = "Go to Dashboard",
    onSkipClick,
}) => {
    const { mutateAsync: updateUser } = useUpdateUserMutation();

    const handleSKip = () => {
        if (onSkipClick) {
            onSkipClick();
        } else {
            // updateUser({
            //     onboardingStep: 0,
            // });
        }
    };

    return (
        <div className="flex py-8 mt-auto w-full">
            {backButtonText && onBackClick && (
                <button
                    className="text-base pr-3 py-2.5 rounded-2xl flex items-center  text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] cursor-pointer"
                    onClick={onBackClick}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    <span>{backButtonText}</span>
                </button>
            )}
            <div className="flex ml-auto gap-3">
                {onSkipText && (
                    <button
                        className="text-base pr-3 py-2.5 rounded-2xl flex items-center  text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] cursor-pointer"
                        onClick={handleSKip}
                    >
                        <span>{onSkipText}</span>
                        <RightBarArrowIcon className="w-5 h-5 ml-2" />
                    </button>
                )}

                {buttonText && onClick && (
                    <Button
                        className={`${
                            isEnabled
                                ? "!bg-white !text-black hover:!bg-gray-200 cursor-pointer"
                                : "bg-[var(--box-800)] text-[var(--subtitle-500)]"
                        }`}
                        onClick={onClick}
                        disabled={!isEnabled}
                        size={"xl"}
                    >
                        <span>{buttonText}</span>
                        {isLoading ? (
                            <LoadingIcon className="w-5 h-5 ml-2" />
                        ) : (
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ActionFooter;
