import {
    useDashboardPrAnalysisQuery,
    useDashboardTimeMoneySavedQuery,
} from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn, numToHip } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from "recharts";
import { useAuthStore } from "@/store/authStore";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
    breakdown?: string | null;
}

const TimeMoneySavedCard = ({
    className,
    fromDate,
    toDate,
    repo,
    breakdown,
}: Props) => {
    const { selectedWorkspace } = useAuthStore();
    const { data, isFetching } = useDashboardTimeMoneySavedQuery({
        from: fromDate,
        to: toDate,
        repo,
        breakdown,
    });
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">Time & Money Saved</h3>
                <div className="text-sm text-neutral-500 border px-3 py-2 rounded-md">
                    Hourly rate: $
                    <span className="text-neutral-300">
                        {selectedWorkspace?.workspaceSetting?.hourlyRate || 50}
                    </span>
                </div>
            </ContentCard.Header>
            <ContentCard.Body
                isLoading={isFetching}
                className="flex flex-col flex-1"
            >
                <div className="flex divide-x gap-5 lg:gap-9 pb-5 lg:py-5">
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">Hours</div>
                        <div className="text-3xl">
                            {data?.data?.totalTimeSaved || 0}
                        </div>
                    </div>
                    <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">
                            Money Saved
                        </div>
                        <div className="text-3xl">
                            $
                            {numToHip(
                                (data?.data?.totalTimeSaved || 0) *
                                    (selectedWorkspace?.workspaceSetting
                                        ?.hourlyRate || 50)
                            )}
                        </div>
                    </div>
                    {/* <div className="pr-5 lg:pr-9">
                        <div className="opacity-50 text-xs mb-1">ROI</div>
                        <div className="text-3xl">3.2x</div>
                    </div> */}
                </div>
                <ChartContainer
                    className="border py-3 pr-3 rounded-xl flex-1"
                    config={{
                        total: {
                            label: "Total",
                            color: "primary",
                        },
                    }}
                >
                    <BarChart
                        accessibilityLayer
                        data={data?.data?.graphChart || []}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={15}
                            height={40}
                            tickFormatter={(value) =>
                                formatDate(
                                    value,
                                    breakdown == "year"
                                        ? "YYYY"
                                        : breakdown == "month"
                                        ? "MMM YY"
                                        : "DD MMM"
                                )
                            }
                            angle={-45}
                            padding={{ right: 20 }}
                        />
                        <YAxis
                            width={35}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={0}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="timeSaved"
                            fill="#3AF7AF"
                            radius={8}
                            maxBarSize={30}
                        />
                    </BarChart>
                </ChartContainer>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default TimeMoneySavedCard;
