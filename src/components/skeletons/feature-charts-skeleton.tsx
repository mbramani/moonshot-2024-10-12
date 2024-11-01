import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';

function FeatureChartSkeleton({ type }: { type: 'bar' | 'line' }) {
    return (
        <div
            className="space-y-4 w-full h-96"
            aria-busy="true"
            aria-label={`Loading ${type} chart`}
        >
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

export function FeatureChartSkeletonWrapper({
    children,
    title,
    description,
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton
                        className="h-6 w-48"
                        aria-label={`Loading ${title}`}
                    />
                </CardTitle>
                <CardDescription>
                    <Skeleton
                        className="h-4 w-64"
                        aria-label={`Loading ${description}`}
                    />
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function FeatureBarChartSkeleton() {
    return <FeatureChartSkeleton type="bar" />;
}

export function FeatureLineChartSkeleton() {
    return <FeatureChartSkeleton type="line" />;
}
