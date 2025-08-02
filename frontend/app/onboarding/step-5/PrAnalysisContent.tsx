import { ArrowLeftIcon } from "@/components/common/icons";
import { CodeReviewInterface, type PullRequestData } from "./PrReview";
import { Button } from "@/components/ui/button";

interface PRAnalysisContentProps {
    data: PullRequestData;
    onBack?: () => void;
}

const PRAnalysisContent = ({ data, onBack }: PRAnalysisContentProps) => {
    if (!data || !data.pull_request || !data.analysis) {
        return (
            <>
                <div className="flex items-center justify-center h-full text-gray-500">
                    No analysis data available.
                </div>
                {onBack && (
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            className="text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] flex items-center gap-2 cursor-pointer border-none"
                            onClick={onBack}
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back
                        </Button>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-[900px] mx-auto pb-4">
            {onBack && (
                <div className="mb-4">
                    <Button
                        variant="outline"
                        className="text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] flex items-center gap-2 cursor-pointer border-none"
                        onClick={onBack}
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                </div>
            )}
            <CodeReviewInterface data={data} />
        </div>
    );
};

export default PRAnalysisContent;
