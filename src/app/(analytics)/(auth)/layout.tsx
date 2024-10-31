'use client';

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@prisma/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

type UserWithoutPassword = Omit<User, 'password'>;

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const [authToken] = useLocalStorage<string>('auth-token', '');
    const [userQueryState, executeUserQuery] = useFetch<{
        user: UserWithoutPassword;
    }>('/api/auth/user');

    useEffect(() => {
        executeUserQuery({ headers: { Authorization: `Bearer ${authToken}` } });
    }, [executeUserQuery, authToken]);

    useEffect(() => {
        if (userQueryState?.data?.user) {
            toast({
                title: 'Welcome back!',
                description: 'You are already logged in.',
            });

            router.push('/dashboard');
        }
    }, [userQueryState?.data, router]);

    return (
        <>
            <Header
                loading={userQueryState.loading}
                isAuthenticated={!!userQueryState.data?.user?.id}
            />
            <main className="flex min-h-[91vh] items-center justify-center bg-background px-4 py-8">
                {userQueryState.loading ? <AuthFormSkeleton /> : children}
            </main>
        </>
    );
}

function AuthFormSkeleton() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-4 w-full" />
            </CardFooter>
        </Card>
    );
}
