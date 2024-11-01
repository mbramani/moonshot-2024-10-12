import { Skeleton } from '@/components/ui/skeleton';

export function HeaderSkeleton() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background px-2">
            <div className="container flex h-16 items-center justify-between mx-auto">
                <Skeleton className="h-6 w-40" />

                <div className="flex items-center space-x-2 md:space-x-4">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>
        </header>
    );
}
