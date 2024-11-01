import Spinner from './spinner';
import { StatusMessage } from './status-message';
import { classNames } from '@/utils/class-names';
import { formatTimestamp } from '@/utils/format-timestamp';
import { useEmail } from '@/contexts/email-context';

export function EmailList() {
    const {
        emailApiState,
        filteredEmails,
        readEmails,
        favoriteEmails,
        selectedEmailId,
        actions,
    } = useEmail();

    function getInitial(name: string) {
        return name.charAt(0).toUpperCase();
    }

    function truncateText(text: string, limit: number) {
        return text.length > limit ? `${text.slice(0, limit)}...` : text;
    }

    const statusMessageClass = classNames(
        selectedEmailId ? 'col-span-2 lg:col-span-2' : 'col-span-6 '
    );

    if (emailApiState.loading)
        return (
            <StatusMessage message="Loading..." className={statusMessageClass}>
                <Spinner />
            </StatusMessage>
        );
    if (emailApiState.error)
        return (
            <StatusMessage
                message={`Error: ${emailApiState.error}`}
                className={statusMessageClass}
            />
        );
    if (filteredEmails.length === 0)
        return (
            <StatusMessage
                message="No emails found."
                className={statusMessageClass}
            />
        );

    return (
        <section
            className={classNames(
                'flex flex-col gap-y-4 p-2 w-full ',
                statusMessageClass
            )}
            aria-label="Email List"
            role="region"
        >
            <ul role="list" className="space-y-4">
                {filteredEmails.map(
                    ({ id, from, subject, short_description, date }) => (
                        <li
                            key={id}
                            className={classNames(
                                'px-4 py-2.5 md:px-6 md:py-2 flex gap-4 border rounded-lg',
                                selectedEmailId === id
                                    ? 'border-background-accent'
                                    : 'border-border-muted ',
                                readEmails.includes(id)
                                    ? 'bg-background-read'
                                    : 'bg-white',
                                'hover:border-background-accent cursor-pointer focus:outline-none  focus:ring-1 ring-offset-0 focus:ring-background-accent'
                            )}
                            onClick={() => actions.selectEmail(id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    actions.selectEmail(id);
                                }
                            }}
                            role="listitem"
                            aria-labelledby={`email-${id}-subject`}
                            tabIndex={0}
                        >
                            <div
                                className="font-semibold text-lg rounded-full text-white bg-background-accent h-fit px-4 p-2"
                                aria-label={`Initial of sender: ${getInitial(from.name)}`}
                            >
                                {getInitial(from.name)}
                            </div>
                            <div className="text-text-default font-medium text-sm space-y-1">
                                <h3>
                                    From:{' '}
                                    <span className="font-bold">
                                        {from.name} &lt;{from.email}&gt;
                                    </span>
                                </h3>
                                <h4 id={`email-${id}-subject`}>
                                    Subject:{' '}
                                    <span className="font-bold">{subject}</span>
                                </h4>
                                <p className="py-1">
                                    {selectedEmailId
                                        ? truncateText(short_description, 30)
                                        : short_description}
                                </p>
                                <div className="flex gap-3">
                                    <time
                                        dateTime={new Date(date).toISOString()}
                                    >
                                        {formatTimestamp(date)}
                                    </time>
                                    {favoriteEmails.includes(id) && (
                                        <span className="text-background-accent font-bold">
                                            Favorite
                                        </span>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </section>
    );
}
