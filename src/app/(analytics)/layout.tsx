import React, { Suspense } from 'react';

import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Dashboard page for feature analytics',
};

export default function AnalyticsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <Toaster />
            <Suspense>{children}</Suspense>
        </ThemeProvider>
    );
}
