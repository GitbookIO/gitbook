'use client';

import { getAllBrowserCookies } from '@/lib/browser-cookies';
import { getVisitorToken } from '@/lib/visitor-token';
import { useEffect, useState } from 'react';

/**
 * Get the value of the current visitor authentication token.
 */
export function useVisitorAuthToken() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const cookies = getAllBrowserCookies();
        const visitorAuthToken = getVisitorToken({
            cookies,
            url: new URL(window.location.href),
        });

        if (visitorAuthToken) {
            setToken(visitorAuthToken.token);
        }
    }, []);

    return token;
}
