import { useDashboardPrAnalysisQuery } from "@/api/queries/dashboard";
import ContentCard from "@/components/reusable/ContentCard";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dayjs";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
                <div className="flex divide-x gap-9 py-5">
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
                <ChartContainer
                    className="border py-3 pr-3 rounded-xl"
                    config={{
                        total: {
                            label: "Total",
                            color: "primary",
                        },
                    }}
                >
                    <LineChart
                        data={data?.data?.data?.graphChart || []}
                        margin={{
                            left: 0,
                            right: 0,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatDate(value, "DD")}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Line
                            dataKey="total"
                            type="monotone"
                            stroke="#39d5f7"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </ContentCard.Body>
        </ContentCard>
    );
};

export default PrAnalysisCard;
