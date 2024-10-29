import { filterTypes, useEmail } from '@/contexts/email-context';

import { classNames } from '@/utils/class-names';

export function EmailFilter() {
    const { activeFilter, actions } = useEmail();
    return (
        <header className="flex gap-1.5 md:gap-3 py-2  text-black text-sm md:text-base font-medium">
            <span className="my-auto">Filter By:</span>
            <nav aria-label="Email Filters">
                {filterTypes.map((filter) => (
                    <button
                        key={filter.toLocaleLowerCase()}
                        className={classNames(
                            activeFilter === filter &&
                                'bg-background-filter border border-border-muted',
                            'px-3 py-0.5 mx-0.5 md:mx-2 rounded-2xl hover:ring-1 focus:ring-1 ring-offset-2 focus:outline-none ring-background-filter'
                        )}
                        onClick={() => actions.setFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </nav>
        </header>
    );
}
