import { useMemo } from "react";
import { useEmail } from "@/contexts/email-context";
import { StatusMessage } from "./status-message";
import Spinner from "./spinner";
import formatTimestamp from "@/utils/format-timestamp";

export function EmailBody() {
  const {
    emails,
    selectedEmailId,
    emailBodyLoading,
    emailBodyError,
    favoriteEmails,
    actions,
  } = useEmail();

  const selectedEmail = useMemo(
    () => emails.find((email) => email.id === selectedEmailId) ?? null,
    [selectedEmailId, emails]
  );

  const senderInitial = useMemo(
    () => selectedEmail?.from.name.charAt(0).toUpperCase() ?? "",
    [selectedEmail]
  );

  if (selectedEmailId === null) return null;

  if (!selectedEmail) {
    return (
      <StatusMessage
        message="Email not found."
        className="col-span-3 lg:col-span-4"
      />
    );
  }

  if (emailBodyLoading) {
    return (
      <StatusMessage message="Loading..." className="col-span-3 lg:col-span-4">
        <Spinner />
      </StatusMessage>
    );
  }

  if (emailBodyError) {
    return (
      <StatusMessage
        message={`Error: ${emailBodyError}`}
        className="col-span-3 lg:col-span-4"
      />
    );
  }

  return (
    <article
      className="col-span-3 lg:col-span-4 px-2 py-2.5 md:px-6 md:py-8 my-2 mx-2 bg-white border border-border-muted rounded-lg min-h-[76vh] max-h-min"
      aria-labelledby={`email-${selectedEmail.id}-subject`}
    >
      <header className="flex gap-4 w-full">
        <div
          className="font-semibold text-lg rounded-full text-white bg-background-accent h-fit px-4 p-2"
          aria-label={`Initial of sender: ${senderInitial}`}
        >
          {senderInitial}
        </div>
        <div className="text-text-default font-medium">
          <h3
            id={`email-${selectedEmail.id}-subject`}
            className="font-bold text-lg md:text-2xl"
          >
            {selectedEmail.subject}
          </h3>
          <time
            className="text-xs md:text-sm font-medium"
            dateTime={new Date(selectedEmail.date).toISOString()}
          >
            {formatTimestamp(selectedEmail.date ?? 0)}
          </time>
        </div>
        <div className="ml-auto mr-2 md:mr-4 lg:mr-8">
          <button
            className="bg-background-accent text-white text-xs px-1 py-0.5 md:px-3 md:py-1 rounded-2xl hover:ring-1 focus:ring-1 ring-offset-2 focus:outline-none ring-background-accent"
            onClick={() => actions.markFavorite(selectedEmailId)}
          >
            {favoriteEmails.includes(selectedEmailId)
              ? "Remove from Favorite"
              : "Mark as Favorite"}
          </button>
        </div>
      </header>
      <div
        className="mt-4 py-2 px-8 md:px-14 text-text-default text-xs md:text-base font-medium"
        dangerouslySetInnerHTML={{
          __html: selectedEmail.body
            ? selectedEmail.body.replace(/<p>/g, '<p class="my-3">')
            : "",
        }}
      ></div>
    </article>
  );
}
