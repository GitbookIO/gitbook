'use client';

import React from 'react';

import { type AIAgentId, isAIAgentId } from '@/lib/ai-agents';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

/**
 * What a prompt block does when its main button is pressed: copy the prompt, or hand it to one of
 * the coding agents.
 */
export type PromptActionId = 'copy' | AIAgentId;

/**
 * Not namespaced per site: a visitor who works in Cursor works in Cursor everywhere, so the pick
 * follows them across sites the same way the `select` store's slugs do.
 */
const STORAGE_KEY = '@gitbook/prompt-action';

const DEFAULT_ACTION: PromptActionId = 'copy';

let state: PromptActionId = DEFAULT_ACTION;
let loaded = false;
const listeners = new Set<() => void>();

function isPromptActionId(value: unknown): value is PromptActionId {
    return value === 'copy' || isAIAgentId(value);
}

function read(): PromptActionId {
    const stored = getLocalStorageItem<unknown>(STORAGE_KEY, DEFAULT_ACTION);
    return isPromptActionId(stored) ? stored : DEFAULT_ACTION;
}

function emitChange() {
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Adopt what's in storage, once per page load. Deferred to the first subscription rather than run at
 * module scope so the first client render still matches the server's, and the stored pick only
 * lands once React is listening.
 */
function load() {
    if (loaded || typeof window === 'undefined') {
        return;
    }
    loaded = true;
    state = read();

    // Another tab picking an action updates this one too.
    window.addEventListener('storage', (event) => {
        if (event.key !== null && event.key !== STORAGE_KEY) {
            return;
        }
        state = read();
        emitChange();
    });
}

function subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    // Storage was only read just now, so nudge the subscriber to re-read the snapshot.
    listener();
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Remember the action the visitor picked, for every prompt block on the page and the next one.
 */
export function setPromptAction(action: PromptActionId) {
    load();
    if (state === action) {
        return;
    }
    state = action;
    setLocalStorageItem(STORAGE_KEY, action);
    emitChange();
}

/**
 * The action the visitor last picked, defaulting to copying the prompt.
 */
export function usePromptAction(): PromptActionId {
    return React.useSyncExternalStore(
        subscribe,
        () => state,
        () => DEFAULT_ACTION
    );
}
