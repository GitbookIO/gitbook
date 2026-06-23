'use client';

import {
    getLocalStorageItem,
    removeLocalStorageItem,
    setLocalStorageItem,
} from '@/lib/browser/local-storage';
import { create } from 'zustand';
import { type StorageValue, persist } from 'zustand/middleware';

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
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--ai-chat-width', `${capToViewport(width)}px`);
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
