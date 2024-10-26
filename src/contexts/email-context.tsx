"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface IEmail {
  id: string;
  from: {
    email: string;
    name: string;
  };
  date: number;
  subject: string;
  short_description: string;
  body?: string | null;
}

export const filterTypes = ["All", "Read", "Unread", "Favorites"] as const;
type FilterType = (typeof filterTypes)[number];

interface IEmailContext {
  emails: IEmail[];
  selectedEmailId: string | null;
  readEmails: string[];
  favoriteEmails: string[];
  loading: boolean;
  error: string | null;
  emailBodyLoading: boolean;
  emailBodyError: string | null;
  currentPage: number;
  activeFilter: FilterType;
  actions: {
    setPage: Dispatch<SetStateAction<number>>;
    setFilter: Dispatch<SetStateAction<FilterType>>;
    selectEmail: (emailId: string) => Promise<void>;
    markFavorite: (emailId: string) => void;
  };
}

export const EmailContext = createContext<IEmailContext | null>(null);

const API_BASE_URL = "https://flipkart-email-mock.now.sh";

export function EmailProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [emails, setEmails] = useState<IEmail[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [emailBodyLoading, setEmailBodyLoading] = useState<boolean>(false);
  const [emailBodyError, setEmailBodyError] = useState<string | null>(null);
  const [readEmails, setReadEmails] = useLocalStorage<string[]>(
    "read-emails",
    []
  );
  const [favoriteEmails, setFavoriteEmails] = useLocalStorage<string[]>(
    "favorite-emails",
    []
  );

  useEffect(() => {
    fetchEmails(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setSelectedEmailId(null);
  }, [currentPage, activeFilter]);

  const handleFetchError = (error: unknown): string => {
    return (error as Error).message || "An unexpected error occurred.";
  };

  async function fetchEmails(page: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/?page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch emails");

      const data = await response.json();
      setEmails(data?.list ?? []);
    } catch (err: unknown) {
      setError(handleFetchError(err));
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmailBody(emailId: string) {
    setEmailBodyLoading(true);
    setEmailBodyError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/?id=${emailId}`);
      if (!response.ok) throw new Error("Failed to fetch email body");

      const data = await response.json();

      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId ? { ...email, body: data?.body } : email
        )
      );
    } catch (err: unknown) {
      setEmailBodyError(handleFetchError(err));
    } finally {
      setEmailBodyLoading(false);
    }
  }

  async function handleEmailSelect(emailId: string) {
    const email = emails.find((e) => e.id === emailId);

    if (email && !email.body) {
      await fetchEmailBody(emailId);
    }

    if (!readEmails.includes(emailId)) {
      setReadEmails((prevReadEmails) => [...prevReadEmails, emailId]);
    }

    setSelectedEmailId(email?.id ?? null);
  }

  function handleMarkFavorite(emailId: string) {
    setFavoriteEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  }

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      switch (activeFilter) {
        case "Read":
          return readEmails.includes(email.id);
        case "Unread":
          return !readEmails.includes(email.id);
        case "Favorites":
          return favoriteEmails.includes(email.id);
        default:
          return true;
      }
    });
  }, [emails, readEmails, favoriteEmails, activeFilter]);

  const value = {
    emails: filteredEmails,
    selectedEmailId,
    readEmails,
    favoriteEmails,
    loading,
    error,
    emailBodyLoading,
    emailBodyError,
    currentPage,
    activeFilter,
    actions: {
      setPage: setCurrentPage,
      setFilter: setActiveFilter,
      selectEmail: handleEmailSelect,
      markFavorite: handleMarkFavorite,
    },
  };

  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
