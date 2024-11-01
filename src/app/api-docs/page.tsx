import { Metadata } from 'next';
import ReactSwagger from '@/components/swagger';
import { getApiDocs } from '@/utils/swagger';

export const metadata: Metadata = {
    title: 'Moonshot 2024-10-12 Q2 API Documentation',
    description: 'API documentation for authentication and analytics endpoints',
};

export default async function ApiDocPage() {
    const spec = await getApiDocs();
    return (
        <section className="container mx-auto">
            <ReactSwagger spec={spec} />
        </section>
    );
}
