import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';

import { Skeleton } from '../ui/skeleton';

export function FilterFormSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-6 w-32" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-64" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-10 w-24" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function FilterSelectSkeleton({ label }: { label: string }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
