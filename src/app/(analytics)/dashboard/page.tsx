'use client';

import { AgeGroup, FeatureUsage, Gender, User } from '@prisma/client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FeatureCharts } from '@/components/feature-charts';
import { FilterForm } from '@/components/filter-form';
import { Header } from '@/components/header';
import { parseISODate } from '@/utils/parse-iso-date';
import { toast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';

type UserWithoutPassword = Omit<User, 'password'>;

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [authToken, setAuthToken] = useLocalStorage<string>('auth-token', '');

    const [userQueryState, executeUserQuery] = useFetch<{
        user: UserWithoutPassword;
    }>('/api/auth/user');

    const [analyticsDataState, setAnalyticsDataState] = useState<{
        data: FeatureUsage[];
        loading: boolean;
    }>({ data: [], loading: false });

    const defaultDateRange = {
        from: new Date('2022-10-04'),
        to: new Date('2022-10-05'),
    };

    const dateRange = {
        from:
            parseISODate(searchParams.get('date_from') ?? '') ||
            defaultDateRange.from,
        to:
            parseISODate(searchParams.get('date_to') ?? '') ||
            defaultDateRange.to,
    };

    const ageGroup = (searchParams.get('age_group') as AgeGroup) ?? 'ALL';
    const gender = (searchParams.get('gender') as Gender) ?? 'ALL';

    useEffect(() => {
        executeUserQuery({ headers: { Authorization: `Bearer ${authToken}` } });
    }, [executeUserQuery, authToken]);

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
            <main className="flex flex-col gap-4 bg-background p-4 ">
                <Suspense>
                    <FilterForm
                        dateRange={dateRange}
                        ageGroup={ageGroup}
                        gender={gender}
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
