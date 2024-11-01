import {
    FeatureBarChartSkeleton,
    FeatureChartSkeletonWrapper,
    FeatureLineChartSkeleton,
} from '@/components/skeletons/feature-charts-skeleton';

import { FilterFormSkeleton } from '@/components/skeletons/filter-form-skeleton';
import { HeaderSkeleton } from '@/components/skeletons/header-skeleton';

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="flex flex-col gap-4 bg-background p-4">
                <FilterFormSkeleton />
                <section className="container grid gap-4 lg:grid-cols-2 min-w-full">
                    <FeatureChartSkeletonWrapper
                        title="Feature Usage Overview"
                        description="Usage statistics across different features"
                    >
                        <FeatureBarChartSkeleton />
                    </FeatureChartSkeletonWrapper>
                    <FeatureChartSkeletonWrapper
                        title="Feature Usage Trend"
                        description="Usage trend for selected feature"
                    >
                        <FeatureLineChartSkeleton />
                    </FeatureChartSkeletonWrapper>
                </section>
            </main>
        </>
    );
}
