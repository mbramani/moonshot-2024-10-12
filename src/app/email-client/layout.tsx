import { EmailProvider } from '@/contexts/email-context';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Email Client Solution',
    description: 'solution to the Moonshot Email Client question',
};

export default function EmailClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <EmailProvider>{children}</EmailProvider>;
}
