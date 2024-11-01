import {
    FeatureBarChartSkeleton,
    FeatureChartSkeletonWrapper,
    FeatureLineChartSkeleton,
} from '@/components/skeletons/feature-charts-skeleton';

import { AuthFormSkeleton } from '@/components/skeletons/auth-form-skeleton';
import { FilterFormSkeleton } from '@/components/skeletons/filter-form-skeleton';
import { HeaderSkeleton } from '@/components/skeletons/header-skeleton';

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="flex min-h-[calc(100vh-4rem)] overflow-y-hidden items-center justify-center bg-background px-4 py-8">
                <AuthFormSkeleton />
            </main>
        </>
    );
}
