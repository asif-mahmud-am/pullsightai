import { useDashboardIssueAnalysisQuery } from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import {
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
    breakdown?: string | null;
}

const IssueAnalysisCard = ({
    className,
    fromDate,
    toDate,
    repo,
    breakdown,
}: Props) => {
    const { data, isFetching } = useDashboardIssueAnalysisQuery({
        from: fromDate,
        to: toDate,
        breakdown,
        repo,
    });
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4">
                <h3 className="text-muted font-semibold">Issues</h3>
            </ContentCard.Header>
            <ContentCard.Body isLoading={isFetching}>
                <div className="flex divide-x gap-9 py-5">
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">Total</div>
                        <div className="text-3xl">{data?.data?.total || 0}</div>
                    </div>
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">
                            Completion Rate
                        </div>
                        <div className="text-3xl">0%</div>
                    </div>
                </div>
                <div className="border rounded-xl">
                    {data?.data?.total < 1 ? (
                        <div className="text-center text-muted py-20">
                            No issues data found for the selected period.
                        </div>
                    ) : (
                        <ChartContainer
                            className="py-3 pr-3"
                            config={{
                                warning: {
                                    label: "Warning",
                                    color: "warning",
                                },
                                critical: {
                                    label: "Critical",
                                    color: "critical",
                                },
                                info: {
                                    label: "Info",
                                    color: "info",
                                },
                            }}
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={[
                                        {
                                            name: "warning",
                                            value: data?.data?.warning || 0,
                                            fill: "#FFB455",
                                        },
                                        {
                                            name: "critical",
                                            value: data?.data?.critical || 0,
                                            fill: "#F85661",
                                        },
                                        {
                                            name: "info",
                                            value: data?.data?.info || 0,
                                            fill: "#A254F5",
                                        },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    paddingAngle={2}
                                />
                                <ChartLegend
                                    content={
                                        <ChartLegendContent nameKey="name" />
                                    }
                                    className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </div>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default IssueAnalysisCard;
