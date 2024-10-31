'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';

import { BarChart3 } from 'lucide-react';
import { FeatureUsage } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useResize } from '@/hooks/use-resize';

interface BarChartData {
    name: string;
    value: number;
}

interface LineChartData {
    date: string;
    value: number;
}

type FeatureKeys = keyof Omit<
    FeatureUsage,
    'id' | 'gender' | 'day' | 'ageGroup'
>;
const featureKeys: FeatureKeys[] = [
    'featureA',
    'featureB',
    'featureC',
    'featureD',
    'featureE',
    'featureF',
];

function generateBarChartData(data: FeatureUsage[]): BarChartData[] {
    const featureTotals = data.reduce(
        (totals, featureUsage) => {
            for (const featureKey of featureKeys) {
                const featureName = featureKey.slice(-1);
                totals[featureName] =
                    (totals[featureName] ?? 0) +
                    (featureUsage[featureKey] as number);
            }
            return totals;
        },
        {} as Record<string, number>
    );

    return Object.entries(featureTotals).map(([name, value]) => ({
        name,
        value,
    }));
}

function generateLineChartData(
    data: FeatureUsage[],
    selectedFeature: string
): LineChartData[] {
    const featureKey = `feature${selectedFeature}` as FeatureKeys;

    const groupedData: Record<string, number> = {};
    for (const usage of data) {
        const date = new Date(usage.day).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        groupedData[date] =
            (groupedData[date] || 0) + (usage[featureKey] as number);
    }

    return Object.entries(groupedData)
        .map(([date, value]) => ({ date, value }))
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
}

interface FeatureChartsProps {
    loading?: boolean;
    data: FeatureUsage[];
}

export function FeatureCharts({ loading = false, data }: FeatureChartsProps) {
    const dimensions = useResize();
    const [selectedFeature, setSelectedFeature] = useState<string | null>();
    const barChartData = useMemo(() => generateBarChartData(data), [data]);
    const lineChartData = useMemo(
        () =>
            selectedFeature ? generateLineChartData(data, selectedFeature) : [],
        [selectedFeature, data]
    );

    const chartWidth = useMemo(
        () =>
            dimensions.width < 1000
                ? Math.min(dimensions.width - 85, 575)
                : dimensions.width / 2.5,
        [dimensions.width]
    );
    const chartHeight = useMemo(
        () => Math.min(dimensions.height - 150, 375),
        [dimensions.height]
    );

    const hasData = data.length > 0;
    const hasBarData = barChartData.length > 0;
    const hasLineData = lineChartData.length > 0;

    function handleBarClick(data: BarChartData) {
        setSelectedFeature(data?.name ?? null);
    }

    return (
        <section className="container grid gap-4 lg:grid-cols-2 min-w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Feature Usage Overview</CardTitle>
                    <CardDescription>
                        Usage statistics across different features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <SkeletonLoader type="bar" />
                    ) : !hasData || !hasBarData ? (
                        <EmptyState message="No feature usage data available. Check back later for insights." />
                    ) : (
                        <FeatureBarChart
                            data={barChartData}
                            chartHeight={chartHeight}
                            chartWidth={chartWidth}
                            onBarClick={handleBarClick}
                        />
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{`Feature ${selectedFeature ?? ''} - Usage Trend`}</CardTitle>
                    <CardDescription>
                        {selectedFeature
                            ? `Usage trend for Feature ${selectedFeature} : from ${lineChartData[0]?.date ?? 'N/A'} to ${lineChartData[lineChartData.length - 1]?.date ?? 'N/A'}`
                            : 'Select a feature to see its usage trend.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <SkeletonLoader type="line" />
                    ) : !hasData || !hasLineData ? (
                        <EmptyState
                            message={`No usage data available for Feature ${selectedFeature ?? ''}. Try selecting a different feature.`}
                        />
                    ) : (
                        <FeatureLineChart
                            data={lineChartData}
                            chartHeight={chartHeight}
                            chartWidth={chartWidth}
                        />
                    )}
                </CardContent>
            </Card>
        </section>
    );
}

function FeatureBarChart({
    data,
    chartHeight,
    chartWidth,
    onBarClick,
}: {
    data: BarChartData[];
    chartHeight: number;
    chartWidth: number;
    onBarClick: (data: BarChartData) => void;
}) {
    return (
        <div className="h-96">
            <ChartContainer
                config={{
                    value: {
                        label: 'Usage',
                        color: 'hsl(var(--chart-1))',
                    },
                }}
            >
                <BarChart
                    accessibilityLayer
                    data={data}
                    layout="vertical"
                    height={chartHeight}
                    width={chartWidth}
                    aria-label="Feature Usage Bar Chart"
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal />
                    <XAxis
                        dataKey="value"
                        type="number"
                        tickMargin={3}
                        label={{
                            value: 'Usage',
                            position: 'insideBottom',
                            offset: -4,
                        }}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickMargin={3}
                        label={{
                            value: 'Feature',
                            position: 'insideLeft',
                            offset: 15,
                            angle: -90,
                        }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                        dataKey="value"
                        fill="var(--color-value)"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={24}
                        onClick={onBarClick}
                        width={100}
                        className="cursor-pointer hover:opacity-80"
                        aria-label="Bar representing feature usage"
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}

function FeatureLineChart({
    data,
    chartHeight,
    chartWidth,
}: {
    data: LineChartData[];
    chartHeight: number;
    chartWidth: number;
}) {
    return (
        <div className="h-96">
            <ChartContainer
                config={{
                    value: {
                        label: 'Daily Usage',
                        color: 'hsl(var(--chart-2))',
                    },
                }}
            >
                <LineChart
                    data={data}
                    height={chartHeight}
                    width={chartWidth}
                    aria-label="Feature Usage Line Chart"
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickMargin={3}
                        label={{
                            value: 'Date',
                            position: 'insideBottom',
                            offset: -4,
                        }}
                    />
                    <YAxis
                        dataKey="value"
                        tickMargin={3}
                        label={{
                            value: 'Usage',
                            position: 'insideLeft',
                            offset: 15,
                            angle: -90,
                        }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="linear"
                        dataKey="value"
                        stroke="var(--color-value)"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                        aria-label="Line representing feature usage trend"
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}

function SkeletonLoader({ type }: { type: 'bar' | 'line' }) {
    return (
        <div className="space-y-4 w-full h-96">
            {type === 'bar' ? (
                <>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={`chart-skeleton-row-${i}`}
                            className="flex items-center justify-between"
                        >
                            <Skeleton className="h-4 w-12" />
                            <div className="flex-1 mx-4">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between pr-4 pl-16">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton
                                key={`chart-skeleton-col-${i}`}
                                className="h-4 w-8"
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="relative w-[90%] h-80 ml-3 md:ml-6">
                    <Skeleton className="absolute bottom-0 left-0 w-full h-1" />
                    <Skeleton className="absolute top-0 left-0 h-full w-1" />
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton
                            key={`line-skeleton-${i}`}
                            className="absolute h-2 w-2 rounded-full"
                            style={{
                                left: `${(i / 9) * 100}%`,
                                top: `${Math.random() * 80 + 10}%`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="rounded-full bg-muted p-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="max-w-xs">
                <p className="text-sm font-medium text-muted-foreground flex flex-col">
                    {message
                        .split('.')
                        .map((line, i) =>
                            line ? <span key={i}>{line.trim()}.</span> : null
                        )}
                </p>
            </div>
        </div>
    );
}
