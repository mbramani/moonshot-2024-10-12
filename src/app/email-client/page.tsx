'use client';

import { EmailBody } from '@/components/email/email-body';
import { EmailFilter } from '@/components/email/email-filter';
import { EmailList } from '@/components/email/email-list';
import { EmailPagination } from '@/components/email/email-pagination';

export default function EmailClientPage() {
    return (
        <main className="bg-background-default min-h-screen px-4 py-3 md:px-12 md:py-8">
            <EmailFilter />
            <div className="md:grid grid-cols-5 lg:grid-cols-6 gap-2">
                <EmailList />
                <EmailBody />
            </div>
            <EmailPagination />
        </main>
    );
}
