'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

export function Header({
    loading,
    isAuthenticated,
}: {
    loading: boolean;
    isAuthenticated: boolean;
}) {
    const router = useRouter();
    const { setTheme } = useTheme();
    const { toast } = useToast();
    const [authToken, setAuthToken] = useLocalStorage<string>('auth-token', '');

    function handleLogout() {
        setAuthToken('');
        router.push('/login');
        toast({
            title: 'Logout Successful',
            description: 'You have been successfully logged out.',
        });
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background px-2">
            <div className="container flex h-16 items-center justify-between mx-auto">
                <Link href="/dashboard">
                    <span className="inline-block text-lg md:text-xl font-bold text-primary">
                        Feature Analytics
                    </span>
                </Link>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-9 px-0"
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setTheme('system')}
                            >
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <Skeleton className="w-24 h-9 " />
                            <Skeleton className="w-24 h-9 " />
                        </div>
                    ) : isAuthenticated ? (
                        <Button onClick={handleLogout}>Logout</Button>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Register</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
