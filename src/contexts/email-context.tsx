'use client';

import {
    Dispatch,
    SetStateAction,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';

import { set } from 'date-fns';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Email {
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

export const filterTypes = ['All', 'Read', 'Unread', 'Favorites'] as const;
type FilterType = (typeof filterTypes)[number];

interface EmailContext {
    emailApiState: {
        data: Email[];
        loading: boolean;
        error: string;
    };
    emailBodyApiState: {
        data?: string;
        loading: boolean;
        error: string;
    };
    filteredEmails: Email[];
    selectedEmailId: string | null;
    readEmails: string[];
    favoriteEmails: string[];
    currentPage: number;
    activeFilter: FilterType;
    actions: {
        setPage: Dispatch<SetStateAction<number>>;
        setFilter: Dispatch<SetStateAction<FilterType>>;
        selectEmail: (emailId: string) => Promise<void>;
        markFavorite: (emailId: string) => void;
    };
}

export const EmailContext = createContext<EmailContext | null>(null);
const API_BASE_URL = 'https://flipkart-email-mock.now.sh';

type EmailApiState =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS'; payload: Email[] }
    | { type: 'FETCH_FAILURE'; error: string };

type EmailBodyApiState =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS'; payload: string }
    | { type: 'FETCH_FAILURE'; error: string };

function emailApiReducer(
    state: EmailContext['emailApiState'],
    action: EmailApiState
) {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { data: action.payload, loading: false, error: '' };
        case 'FETCH_FAILURE':
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
}

function emailBodyApiReducer(
    state: EmailContext['emailBodyApiState'],
    action: EmailBodyApiState
) {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { data: action.payload, loading: false, error: '' };
        case 'FETCH_FAILURE':
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
}

export function EmailProvider({ children }: { children: React.ReactNode }) {
    const [emailApiState, dispatchEmailApi] = useReducer(emailApiReducer, {
        data: [],
        loading: false,
        error: '',
    });

    const [emailBodyApiState, dispatchEmailBodyApi] = useReducer(
        emailBodyApiReducer,
        {
            data: '',
            loading: false,
            error: '',
        }
    );

    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [readEmails, setReadEmails] = useLocalStorage<string[]>(
        'read-emails',
        []
    );
    const [favoriteEmails, setFavoriteEmails] = useLocalStorage<string[]>(
        'favorite-emails',
        []
    );

    const fetchEmails = useCallback(async (page: number) => {
        dispatchEmailApi({ type: 'FETCH_INIT' });
        try {
            const response = await fetch(`${API_BASE_URL}/?page=${page}`);
            if (!response.ok) throw new Error('Failed to fetch emails');
            const data = await response.json();
            dispatchEmailApi({
                type: 'FETCH_SUCCESS',
                payload: data?.list ?? [],
            });
        } catch (err: unknown) {
            dispatchEmailApi({
                type: 'FETCH_FAILURE',
                error:
                    (err as Error).message || 'An unexpected error occurred.',
            });
        }
    }, []);

    useEffect(() => {
        fetchEmails(currentPage);
        setSelectedEmailId(null);
    }, [currentPage, fetchEmails]);

    async function fetchEmailBody(emailId: string) {
        dispatchEmailBodyApi({ type: 'FETCH_INIT' });
        try {
            const response = await fetch(`${API_BASE_URL}/?id=${emailId}`);
            if (!response.ok) throw new Error('Failed to fetch email body');
            const data = await response.json();
            dispatchEmailBodyApi({ type: 'FETCH_SUCCESS', payload: data.body });
            dispatchEmailApi({
                type: 'FETCH_SUCCESS',
                payload: emailApiState.data.map((email) =>
                    email.id === emailId
                        ? { ...email, body: data?.body ?? '' }
                        : email
                ),
            });
        } catch (err: unknown) {
            dispatchEmailBodyApi({
                type: 'FETCH_FAILURE',
                error:
                    (err as Error).message || 'An unexpected error occurred.',
            });
        }
    }

    async function handleEmailSelect(emailId: string) {
        const email = emailApiState.data.find((e) => e.id === emailId);
        if (email && !email.body) {
            await fetchEmailBody(emailId);
        }
        if (!readEmails.includes(emailId)) {
            setReadEmails((prevReadEmails) => [...prevReadEmails, emailId]);
        }
        setSelectedEmailId(emailId);
    }

    function handleMarkFavorite(emailId: string) {
        setFavoriteEmails((prev) =>
            prev.includes(emailId)
                ? prev.filter((id) => id !== emailId)
                : [...prev, emailId]
        );
    }

    const filteredEmails = useMemo(() => {
        return emailApiState.data.filter((email) => {
            switch (activeFilter) {
                case 'Read':
                    return readEmails.includes(email.id);
                case 'Unread':
                    return !readEmails.includes(email.id);
                case 'Favorites':
                    return favoriteEmails.includes(email.id);
                default:
                    return true;
            }
        });
    }, [emailApiState.data, readEmails, favoriteEmails, activeFilter]);

    const value = {
        emailApiState,
        emailBodyApiState,
        filteredEmails,
        selectedEmailId,
        readEmails,
        favoriteEmails,
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
        throw new Error('useEmail must be used within an EmailProvider');
    }
    return context;
}
