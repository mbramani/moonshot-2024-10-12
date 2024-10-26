import { useEmail } from "@/contexts/email-context";
import classNames from "@/utils/class-names";

export function EmailPagination() {
  const { activeFilter, currentPage, actions } = useEmail();

  if (activeFilter !== "All") return null;

  const pages = Array.from({ length: 2 }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Email Pagination"
      className="bg-white border border-border-muted rounded-lg mt-2 ml-2 mr-1 p-2 flex justify-center"
    >
      {pages.map((page) => (
        <button
          key={page}
          className={classNames(
            currentPage === page &&
              "bg-background-filter border border-border-muted",
            "px-3 py-0.5 mx-0.5 md:mx-2 rounded-2xl hover:ring-1 focus:ring-1 ring-offset-2 focus:outline-none ring-background-filter",
          )}
          onClick={() => actions.setPage(page)}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}
