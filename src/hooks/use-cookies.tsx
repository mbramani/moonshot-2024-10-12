'use client';

import { useState } from 'react';

function getCookieValue<T>(key: string, initialValue: T): T {
    if (typeof window === 'undefined') return initialValue;

    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${key}=`));

    if (!cookie) return initialValue;

    try {
        return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch (error) {
        console.error('Error parsing cookie value:', error);
        return initialValue;
    }
}

const ONE_DAY_IN_MILLISECONDS = 864e5;

export function useCookies<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() =>
        getCookieValue(key, initialValue)
    );

    const setCookie = (
        name: string,
        value: T,
        days: number,
        options: {
            path?: string;
            sameSite?: 'Strict' | 'Lax' | 'None';
            secure?: boolean;
        } = {}
    ) => {
        const date = new Date();
        date.setTime(date.getTime() + days * ONE_DAY_IN_MILLISECONDS);
        const expires = `expires=${date.toUTCString()}`;
        const path = options.path ? `;path=${options.path}` : ';path=/';
        const sameSite = options.sameSite
            ? `;SameSite=${options.sameSite}`
            : '';
        const secure = options.secure ? ';Secure' : '';
        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};${expires}${path}${sameSite}${secure}`;
        setValue(getCookieValue(key, initialValue));
    };

    return [value, setCookie] as const;
}
