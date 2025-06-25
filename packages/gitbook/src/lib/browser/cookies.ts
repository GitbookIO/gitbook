'use client';

import cookies from 'js-cookie';

import { checkIsSecurityError } from './security-error';

/**
 * Get all cookies.
 * @returns A map of cookie names to their values.
 */
export function getAllBrowserCookies(): Array<{
    name: string;
    value: string;
}> {
    try {
        const all = cookies.get();
        return Object.entries(all).map(([name, value]) => ({ name, value }));
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return [];
        }
        throw error;
    }
}

/**
 * Get a map of cookie names to their values.
 * @returns A map of cookie names to their values.
 */
export function getAllBrowserCookiesMap(): Record<string, string> {
    return Object.fromEntries(getAllBrowserCookies().map(({ name, value }) => [name, value]));
}

/**
 * Get a cookie by name.
 * @param name - The name of the cookie to get.
 * @returns The value of the cookie or undefined if the cookie does not exist.
 */
export function getBrowserCookie(name: string): string | undefined {
    try {
        return cookies.get(name);
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return undefined;
        }
        throw error;
    }
}

/**
 * Set a cookie.
 * @param name - The name of the cookie to set.
 * @param value - The value of the cookie to set.
 * @param options - The options for the cookie to set.
 */
export const setBrowserCookie = cookies.set;
