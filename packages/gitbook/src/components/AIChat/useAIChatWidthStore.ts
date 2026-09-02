'use client';

import { create } from 'zustand';
import { type StorageValue, persist } from 'zustand/middleware';

import {
    getLocalStorageItem,
    removeLocalStorageItem,
    setLocalStorageItem,
} from '@/lib/browser/local-storage';

const AI_CHAT_MIN_WIDTH = 384;
const AI_CHAT_MAX_WIDTH = 640;
const MIN_CONTENT_WIDTH = 720;

type AIChatWidthStore = {
    width: number;
    toggleWidth: () => void;
    setWidth: (width: number) => number;
    syncWidth: () => void;
};

type PersistedState = Pick<AIChatWidthStore, 'width'>;

export const useAIChatWidthStore = create<AIChatWidthStore>()(
    persist(
        (set, get) => ({
            width: AI_CHAT_MIN_WIDTH,
            toggleWidth: () =>
                get().setWidth(
                    get().width >= AI_CHAT_MAX_WIDTH ? AI_CHAT_MIN_WIDTH : AI_CHAT_MAX_WIDTH
                ),
            setWidth: (width) => {
                const clamped = clampWidth(width);
                if (get().width !== clamped) {
                    set({ width: clamped });
                }
                setWidthOnViewport(clamped);
                return clamped;
            },
            syncWidth: () => setWidthOnViewport(get().width),
        }),
        {
            name: '@gitbook/ai-chat-width',
            storage: {
                getItem: (name) =>
                    getLocalStorageItem<StorageValue<PersistedState> | null>(name, null),
                setItem: (name, value) => setLocalStorageItem(name, value),
                removeItem: (name) => removeLocalStorageItem(name),
            },
            partialize: (state) => ({ width: state.width }),
            onRehydrateStorage: () => (state) => state?.syncWidth(),
        }
    )
);

/**
 * Whether the panel is at its maximum width.
 */
export const useIsAIChatMaxWidth = () =>
    useAIChatWidthStore((state) => state.width >= AI_CHAT_MAX_WIDTH);

// Hoisted so the synchronous persist rehydrate (during create() above) can call them before this point.
function setWidthOnViewport(width: number) {
    if (typeof document === 'undefined') {
        return;
    }
    // Any change to the <html> style attribute re-styles the whole document, so only write when
    // the value differs from what is already in effect (the stylesheet default is the min width).
    const style = document.documentElement.style;
    const current = style.getPropertyValue('--ai-chat-width');
    const capped = capToViewport(width);
    if (capped === AI_CHAT_MIN_WIDTH) {
        if (current) {
            style.removeProperty('--ai-chat-width');
        }
        return;
    }
    const value = `${capped}px`;
    if (current !== value) {
        style.setProperty('--ai-chat-width', value);
    }
}

function clampWidth(width: number) {
    return Math.min(AI_CHAT_MAX_WIDTH, Math.max(AI_CHAT_MIN_WIDTH, Math.round(width)));
}

// Cap a width so the remaining content keeps a usable minimum at the current viewport.
function capToViewport(width: number) {
    return typeof window === 'undefined'
        ? width
        : Math.min(width, Math.max(AI_CHAT_MIN_WIDTH, window.innerWidth - MIN_CONTENT_WIDTH));
}
