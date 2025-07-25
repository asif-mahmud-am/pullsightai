import React from "react";

interface Step {
    id: string;
    label: string;
    status: "complete" | "current" | "incomplete";
}

interface ProgressStepsProps {
    steps: Step[];
    onStepClick?: (stepId: string) => void;
    icons: {
        complete: React.ReactNode; // checked icon (e.g., CheckedIcon)
        current: React.ReactNode; // current icon (e.g., CircleIcon filled with title color)
        incomplete: React.ReactNode; // incomplete icon (e.g., CircleIcon with gray)
        progressBar?: React.ReactNode; // optional custom progress bar (used in current)
    };
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
    steps,
    onStepClick,
    icons,
}) => {
    return (
        <div className="flex items-start gap-5 mt-12 max-h-full overflow-hidden overflow-x-auto">
            {steps.map((step) => {
                const { status, id, label } = step;
                const isComplete = status === "complete";
                const isCurrent = status === "current";
                const isIncomplete = status === "incomplete";

                const bar = isComplete ? (
                    <div className="h-3 bg-primary w-full rounded-full"></div>
                ) : isCurrent && icons.progressBar ? (
                    <div className="h-3 w-full rounded-full relative overflow-hidden">
                        {icons.progressBar}
                    </div>
                ) : (
                    <div className="h-3 bg-[var(--box-800)] w-full rounded-full"></div>
                );

                const textColor = isComplete
                    ? "text-[var(--title-50)]"
                    : isCurrent
                    ? "text-[var(--title-50)]"
                    : "text-[var(--overbox-600)]";

                const icon = isComplete
                    ? icons.complete
                    : isCurrent
                    ? icons.current
                    : icons.incomplete;

                return (
                    <div
                        key={id}
                        className="flex flex-col w-1/6"
                        onClick={() => onStepClick?.(id)}
                    >
                        {bar}

                        <div className="flex mt-3 items-start">
                            <div className="rounded-full w-4 h-4 flex items-center justify-center mt-[1px]">
                                {icon}
                            </div>
                            <div
                                className={`ml-2 ${textColor} font-medium text-sm`}
                            >
                                {label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressSteps;
