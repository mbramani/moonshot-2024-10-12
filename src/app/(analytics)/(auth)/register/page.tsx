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

export default function RegisterPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Create a new account by your email and password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm type="register" />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
