import { useDashboardPrAnalysisQuery } from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    fromDate?: string | null;
    toDate?: string | null;
}

const PrAnalysisCard = ({ className, fromDate, toDate }: Props) => {
    const { data } = useDashboardPrAnalysisQuery({
        from: fromDate,
        to: toDate,
    });
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                <h3 className="text-muted font-semibold">PRs</h3>
            </ContentCard.Header>
            <ContentCard.Body>
                <div className="flex divide-x gap-9 pt-5">
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">Opened</div>
                        <div className="text-3xl">
                            {data?.data?.data?.opened || 0}
                        </div>
                    </div>
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">Merged</div>
                        <div className="text-3xl">
                            {data?.data?.data?.merged || 0}
                        </div>
                    </div>
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">Declined</div>
                        <div className="text-3xl">
                            {data?.data?.data?.declined || 0}
                        </div>
                    </div>
                </div>
                <div></div>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default PrAnalysisCard;
