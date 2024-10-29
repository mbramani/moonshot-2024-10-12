'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as PrismaUser } from '@prisma/client';
import { SymbolIcon } from '@radix-ui/react-icons';
import { classNames } from '@/utils/class-names';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

type User = Omit<PrismaUser, 'password'>;

type AuthFormSchema = {
    email: string;
    password: string;
};

interface AuthFormProps {
    type: 'login' | 'register';
}

type AuthResponse<T extends 'login' | 'register'> = T extends 'login'
    ? { token: string }
    : { user: User };

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const [authToken, setAuthToken] = useLocalStorage<string>('auth-token', '');

    const endpoint = `/api/auth/${type}`;
    const [{ data, error, message, loading, errors }, executeAuthQuery] =
        useFetch<AuthResponse<typeof type>, AuthFormSchema>(endpoint);

    useEffect(() => {
        if (data) {
            console.log('token' in data);
            if (type === 'login' && 'token' in data) {
                console.log('token' in data, data);
                setAuthToken(data.token);
            }

            toast({
                title:
                    type === 'login'
                        ? 'Logged in successfully'
                        : 'Registered successfully',
                description: message,
            });

            setTimeout(() => {
                router.push(type === 'login' ? '/dashboard' : '/login');
            }, 1500);
        } else if (error) {
            toast({
                title: 'Error during authentication',
                description: error,
                variant: 'destructive',
            });
        }
    }, [data, error, message, type, setAuthToken, router]);

    const handleAuthFormSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as AuthFormSchema;
        await executeAuthQuery({ method: 'POST', body: data });
    };

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
                            <SymbolIcon />
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
