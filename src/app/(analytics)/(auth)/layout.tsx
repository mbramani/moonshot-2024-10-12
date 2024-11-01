'use client';

import { AuthFormSkeleton } from '@/components/skeletons/auth-form-skeleton';
import { Header } from '@/components/header';
import { UserWithoutPassword } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

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
        if (authToken) {
            executeUserQuery({
                headers: { Authorization: `Bearer ${authToken}` },
            });
        }
    }, [authToken, executeUserQuery]);

    useEffect(() => {
        if (userQueryState?.data?.user) {
            toast({
                title: 'Welcome back!',
                description: 'You are already logged in.',
            });

            router.push('/dashboard');
        }
    }, [userQueryState, router]);

    return (
        <>
            <Header
                loading={userQueryState.loading}
                isAuthenticated={!!userQueryState.data?.user?.id}
            />
            <main className="flex min-h-[calc(100vh-4rem)] overflow-y-hidden items-center justify-center bg-background px-4 py-8">
                {userQueryState.loading ? <AuthFormSkeleton /> : children}
            </main>
        </>
    );
}
