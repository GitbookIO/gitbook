'use client';

import { generateRandomId } from "./utils";

const SESSION_TTL = 1000 * 60 * 30; // 30 minutes

interface Session {
    id: string;
    lastActiveAt: number;
}

let currentSession: Session | null = null;

const SESSION_KEY = '__gitbook_session';

/**
 * Get the current session.
 */
export function getSession(): Session {
    if (currentSession) {
        return currentSession;
    }

    try {
        const rawSession = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;

        if (rawSession) {
            const storedSession = JSON.parse(rawSession);

            if (
                typeof storedSession === 'object' &&
                typeof storedSession.lastActiveAt === 'number' &&
                typeof storedSession.id === 'string' &&
                storedSession.lastActiveAt + SESSION_TTL > Date.now()
            ) {
                currentSession = storedSession;
                touchSession();
                return currentSession;
            }
        }
    } catch (error) {
        console.error('Error parsing session', error);
    }

    currentSession = {
        id: generateRandomId(),
        lastActiveAt: Date.now(),
    };
    saveSession();
    return currentSession;
}

/**
 * Update the session.
 */
export function touchSession() {
    if (currentSession) {
    currentSession.lastActiveAt = Date.now();
    saveSession();
    }
}

/**
 * Save the session to the local storage.
 */
export function saveSession() {
    if (typeof localStorage !== 'undefined' && currentSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
    }
}
