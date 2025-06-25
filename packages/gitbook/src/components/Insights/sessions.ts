'use client';

import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

import { generateRandomId } from './utils';

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
        const session = getLocalStorageItem<unknown | null>(SESSION_KEY, null);

        if (
            session &&
            typeof session === 'object' &&
            'lastActiveAt' in session &&
            typeof session.lastActiveAt === 'number' &&
            'id' in session &&
            typeof session.id === 'string' &&
            session.lastActiveAt + SESSION_TTL > Date.now()
        ) {
            currentSession = session as Session;
            touchSession();
            return currentSession;
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
    if (currentSession) {
        setLocalStorageItem(SESSION_KEY, currentSession);
    }
}
