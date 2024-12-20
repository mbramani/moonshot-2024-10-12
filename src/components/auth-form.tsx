'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { UserWithoutPassword } from '@/types';
import { classNames } from '@/utils/class-names';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AuthFormState {
    email: string;
    password: string;
}

interface AuthFormProps {
    type: 'login' | 'register';
}

type AuthResponse<T extends 'login' | 'register'> = T extends 'login'
    ? { token: string }
    : { user: UserWithoutPassword };

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    const [_authToken, setAuthToken] = useLocalStorage<string>(
        'auth-token',
        ''
    );

    const endpoint = `/api/auth/${type}`;
    const [{ data, error, message, loading, errors }, executeAuthQuery] =
        useFetch<AuthResponse<typeof type>, AuthFormState>(endpoint);

    useEffect(() => {
        if (data) {
            const successMessage = `${type === 'login' ? 'Logged in' : 'Registered'} successfully`;
            toast({
                title: successMessage,
                description: message,
            });

            if (type === 'login' && 'token' in data) {
                setAuthToken(data.token);
                router.push(redirectUrl);
            } else if (type === 'register') {
                router.push(
                    `/login?redirect=${encodeURIComponent(redirectUrl)}`
                );
            }
        } else if (error) {
            toast({
                title: `Error during ${type}`,
                description: error,
                variant: 'destructive',
            });
        }
    }, [data, error, message, router, setAuthToken, type, redirectUrl]);

    function handleAuthFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const entries = Object.fromEntries(formData.entries());
        const data: AuthFormState = {
            email: entries.email as string,
            password: entries.password as string,
        };
        executeAuthQuery({ method: 'POST', body: data });
    }

    return (
        <form className="space-y-4" onSubmit={handleAuthFormSubmit}>
            <div className="space-y-2">
                <Label
                    htmlFor="email"
                    className={classNames(errors?.email && 'text-destructive')}
                >
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className={classNames(
                        errors?.email &&
                            '!border-destructive focus:!ring-destructive'
                    )}
                    required
                    aria-invalid={!!errors?.email}
                    aria-describedby={errors?.email ? 'email-error' : undefined}
                />
                {errors?.email && (
                    <p
                        id="email-error"
                        className="text-sm font-medium text-destructive"
                    >
                        {errors.email}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label
                    htmlFor="password"
                    className={classNames(
                        errors?.password && 'text-destructive'
                    )}
                >
                    Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className={classNames(
                        errors?.password &&
                            '!border-destructive focus:!ring-destructive'
                    )}
                    required
                    aria-invalid={!!errors?.password}
                    aria-describedby={
                        errors?.password ? 'password-error' : undefined
                    }
                />
                {errors?.password && (
                    <p
                        id="password-error"
                        className="text-sm font-medium text-destructive"
                    >
                        {errors.password}
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <span className="flex items-center justify-center">
                        <span className="animate-spin-slow mr-2">
                            <Loader2 className="animate-spin-slow" />
                        </span>
                        Loading...
                    </span>
                ) : type === 'login' ? (
                    'Log in'
                ) : (
                    'Register'
                )}
            </Button>
        </form>
    );
}
