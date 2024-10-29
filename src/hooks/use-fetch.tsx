'use client';

import { useCallback, useReducer } from 'react';

interface ApiResponse<T, E = undefined> {
    status: 'error' | 'success';
    message: string;
    errorCode?: string;
    data?: T;
    errors?: E;
}

interface FetchState<T, E = undefined> {
    data: T | null;
    loading: boolean;
    error: string | null;
    message: string | null;
    errorCode: string | null;
    errors?: E | null;
}

interface FetchOptions<T> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: T;
    headers?: HeadersInit;
    queryParams?: Record<string, string | number | boolean | undefined>;
}

type Action<T, E = undefined> =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: T; message: string }
    | { type: 'FETCH_ERROR'; error: string; errorCode?: string; errors?: E };

function fetchReducer<T, E = undefined>(
    state: FetchState<T, E>,
    action: Action<T, E>
): FetchState<T, E> {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null,
                message: null,
                errorCode: null,
                errors: null,
            };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                data: action.payload,
                message: action.message,
            };
        case 'FETCH_ERROR':
            return {
                ...state,
                loading: false,
                error: action.error,
                errorCode: action.errorCode ?? null,
                errors: action.errors ?? null,
            };
        default:
            return state;
    }
}

export function useFetch<T, E = undefined>(
    url: string
): [FetchState<T, E>, (options?: FetchOptions<E>) => Promise<void>] {
    const initialState: FetchState<T, E> = {
        data: null,
        loading: false,
        error: null,
        message: null,
        errorCode: null,
        errors: null,
    };

    const [state, dispatch] = useReducer(fetchReducer, initialState);

    const fetchData = useCallback(
        async (options: FetchOptions<E> = { method: 'GET' }) => {
            dispatch({ type: 'FETCH_START' });

            const queryString = options.queryParams
                ? '?' +
                  new URLSearchParams(
                      Object.entries(options.queryParams).reduce(
                          (acc, [key, value]) => {
                              if (value !== undefined) acc[key] = String(value);
                              return acc;
                          },
                          {} as Record<string, string>
                      )
                  ).toString()
                : '';

            try {
                const response = await fetch(`${url}${queryString}`, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    body: options.body ? JSON.stringify(options.body) : null,
                });

                const result: ApiResponse<T, E> = await response.json();

                if (!response.ok || result.status === 'error') {
                    dispatch({
                        type: 'FETCH_ERROR',
                        error: result.message || 'An error occurred',
                        errorCode: result.errorCode,
                        errors: result.errors,
                    });
                } else {
                    dispatch({
                        type: 'FETCH_SUCCESS',
                        payload: result.data || null,
                        message: result.message,
                    });
                }
            } catch (error) {
                dispatch({
                    type: 'FETCH_ERROR',
                    error:
                        (error as Error).message ||
                        'An unexpected error occurred',
                });
            }
        },
        [url]
    );

    return [state as FetchState<T, E>, fetchData];
}
