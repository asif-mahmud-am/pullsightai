import React from "react";
import {
    ArrowRightIcon,
    LoadingIcon,
    ArrowLeftIcon,
} from "@/components/common/icons";

interface ActionFooterProps {
    buttonText?: string;
    isEnabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    backButtonText?: string;
    onBackClick?: () => void;
}

const ActionFooter: React.FC<ActionFooterProps> = ({
    buttonText,
    isEnabled = false,
    isLoading = false,
    onClick,
    backButtonText = "Back",
    onBackClick,
}) => {
    return (
        <div className="flex justify-between py-8 mt-auto w-full">
            {backButtonText && onBackClick ? (
                <button
                    className="text-base pr-3 py-2.5 rounded-2xl flex items-center  text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] cursor-pointer"
                    onClick={onBackClick}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    <span>{backButtonText}</span>
                </button>
            ) : (
                <div></div>
            )}

            {buttonText && onClick && (
                <button
                    className={`text-base px-6 py-2.5 rounded-2xl flex items-center ${
                        isEnabled
                            ? "bg-[var(--title-50)] text-[var(--body-900)] cursor-pointer"
                            : "bg-[var(--box-800)] text-[var(--subtitle-500)] cursor-not-allowed"
                    }`}
                    onClick={onClick}
                    disabled={!isEnabled}
                >
                    <span>{buttonText}</span>
                    {isLoading ? (
                        <LoadingIcon className="w-5 h-5 ml-2" />
                    ) : (
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    )}
                </button>
            )}
        </div>
    );
};

export default ActionFooter;
