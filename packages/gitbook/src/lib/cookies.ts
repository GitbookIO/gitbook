import cookies from 'js-cookie';

import { checkIsSecurityError } from './security-error';

export function getAll(): {
    [key: string]: string;
} {
    try {
        return cookies.get();
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return {};
        }
        throw error;
    }
}

export function get(name: string): string | undefined {
    try {
        return cookies.get(name);
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return undefined;
        }
        throw error;
    }
}

export const set = cookies.set;
