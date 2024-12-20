import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({ subsets: ['latin'] });
export const metadata: Metadata = {
    title: 'Moonshot Test Solution',
    description: 'solution to the Moonshot test 2024-10-12',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${openSans.className} antialiased`}
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
