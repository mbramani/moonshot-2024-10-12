import { classNames } from '@/utils/class-names';

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={classNames(
                'animate-pulse rounded-md bg-primary/10',
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
