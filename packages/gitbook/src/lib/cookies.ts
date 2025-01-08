import cookies from 'js-cookie';

export function getAll(): {
    [key: string]: string;
} {
    try {
        return cookies.get();
    } catch (error) {
        if (error instanceof Error && error.name === 'SecurityError') {
            return {};
        }
        throw error;
    }
}

export function get(name: string): string | undefined {
    try {
        return cookies.get(name);
    } catch (error) {
        if (error instanceof Error && error.name === 'SecurityError') {
            return undefined;
        }
        throw error;
    }
}

export const set = cookies.set;
