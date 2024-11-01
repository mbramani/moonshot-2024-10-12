'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FeatureCharts } from '@/components/feature-charts';
import { FeatureUsage } from '@prisma/client';
import { FilterForm } from '@/components/filter-form';
import { FilterFormSkeleton } from '@/components/skeletons/filter-form-skeleton';
import { Header } from '@/components/header';
import { UserWithoutPassword } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentUrl = useMemo(
        () => `${pathname}?${searchParams.toString()}`,
        [pathname, searchParams]
    );

    const [authToken, setAuthToken] = useLocalStorage<string>('auth-token', '');

    const [userQueryState, executeUserQuery] = useFetch<{
        user: UserWithoutPassword;
    }>('/api/auth/user');

    const [analyticsDataState, setAnalyticsDataState] = useState<{
        data: FeatureUsage[];
        loading: boolean;
    }>({ data: [], loading: false });

    useEffect(() => {
        if (authToken) {
            executeUserQuery({
                headers: { Authorization: `Bearer ${authToken}` },
            });
        } else {
            toast({
                title: 'Login Required',
                description: 'Please log in to access the dashboard.',
                variant: 'destructive',
            });
            router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        }
    }, [authToken, executeUserQuery, router]);

    useEffect(() => {
        if (userQueryState.error) {
            toast({
                title: 'Login Required',
                description: 'Please log in to access the dashboard.',
                variant: 'destructive',
            });
            setAuthToken('');
            router.push('/login');
        }
    }, [userQueryState.error, router, setAuthToken]);

    return (
        <>
            <Header
                loading={userQueryState.loading}
                isAuthenticated={Boolean(userQueryState.data?.user?.id)}
            />
            <main className="flex flex-col gap-4 bg-background p-4">
                <Suspense fallback={<FilterFormSkeleton />}>
                    <FilterForm
                        loading={userQueryState.loading}
                        onAnalyticsDataChange={setAnalyticsDataState}
                    />
                </Suspense>
                <FeatureCharts
                    data={analyticsDataState.data}
                    loading={
                        analyticsDataState.loading || userQueryState.loading
                    }
                />
            </main>
        </>
    );
}
