'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Suspense, useEffect, useState } from 'react';

import { FeatureCharts } from '@/components/feature-charts';
import { FeatureUsage } from '@prisma/client';
import { FilterForm } from '@/components/filter-form';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { UserWithoutPassword } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
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
            router.push('/login');
        }
    }, [executeUserQuery, authToken, router]);

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

function FilterFormSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-6 w-32" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-64" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-10 w-24" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
