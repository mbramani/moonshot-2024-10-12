import { classNames } from '@/utils/class-names';

export function StatusMessage({
    message,
    className,
    children,
}: {
    message: string;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <section
            className={classNames(
                className,
                'flex justify-center items-center m-2 bg-white border border-border-muted rounded-lg min-h-[76vh] max-h-min '
            )}
        >
            <h2 className="ml-2 text-text-default text-lg font-semibold flex gap-2">
                {children}
                {message}
            </h2>
        </section>
    );
}
