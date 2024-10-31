import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { AuthForm } from '@/components/auth-form';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login page for the application',
};

export default function LoginPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Log in</CardTitle>
                <CardDescription>
                    Enter your email and password to log in to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm type="login" />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="underline underline-offset-4 hover:text-primary"
                        aria-label="Create a new account"
                    >
                        Register
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
