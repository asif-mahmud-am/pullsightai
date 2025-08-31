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
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">Issues</h3>
            </ContentCard.Header>
            <ContentCard.Body
                isLoading={isFetching}
                className="flex-1 flex flex-col"
            >
                <div className="flex divide-x gap-9 py-5">
                    <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">Total</div>
                        <div className="text-3xl">{data?.data?.total || 0}</div>
                    </div>
                    {/* <div className="pr-9">
                        <div className="opacity-50 text-xs mb-1">
                            Completion Rate
                        </div>
                        <div className="text-3xl">0%</div>
                    </div> */}
                </div>
                <div className="border rounded-xl flex-1">
                    {data?.data?.total < 1 ? (
                        <div className="text-center text-muted p-6 h-full flex items-center justify-center">
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
                                    innerRadius={50}
                                    paddingAngle={2}
                                    outerRadius={70}
                                />
                                <ChartLegend
                                    content={({ payload }) => (
                                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                                            {payload?.map((entry, index) => {
                                                const count =
                                                    entry.payload?.value || 0;
                                                const percentage = data?.data
                                                    ?.total
                                                    ? Math.round(
                                                          (count /
                                                              data.data.total) *
                                                              100
                                                      )
                                                    : 0;
                                                return (
                                                    <div
                                                        key={`legend-${index}`}
                                                        className="flex items-center gap-2 text-xs"
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    entry.color,
                                                            }}
                                                        />
                                                        <span className="capitalize">
                                                            {entry.value} (
                                                            {percentage}%)
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    className="-translate-y-2"
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
