'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AI_CHAT_MIN_WIDTH = 384;
const AI_CHAT_MAX_WIDTH = 640;

type AIChatWidthStore = {
    /** The user's preferred panel width, in pixels (independent of viewport). */
    width: number;
    /** Toggle the panel between its default and maximum width. */
    toggleWidth: () => void;
    /** Whether the panel is at its maximum width. */
    isMaxWidth: boolean;
    /** Clamp & store a new preferred width, then apply it to the CSS variable. */
    setWidth: (width: number) => number;
    /** Re-apply the viewport cap to the CSS variable (e.g. on window resize). */
    syncWidth: () => void;
};

export const useAIChatWidthStore = create<AIChatWidthStore>()(
    persist(
        (set, get) => ({
            width: AI_CHAT_MIN_WIDTH,
            isMaxWidth: false,
            toggleWidth: () =>
                get().setWidth(
                    get().width >= AI_CHAT_MAX_WIDTH ? AI_CHAT_MIN_WIDTH : AI_CHAT_MAX_WIDTH
                ),
            setWidth: (width) => {
                const clamped = clampWidth(width);
                if (get().width !== clamped) {
                    set({ width: clamped, isMaxWidth: clamped >= AI_CHAT_MAX_WIDTH });
                }
                get().syncWidth();
                return clamped;
            },
            syncWidth: () => {
                if (typeof document !== 'undefined') {
                    document.documentElement.style.setProperty(
                        '--ai-chat-width',
                        `${capToViewport(get().width)}px`
                    );
                }
            },
        }),
        {
            name: '@gitbook/ai-chat-width',
            partialize: (state) => ({ width: state.width }),
            onRehydrateStorage: () => (state) => state?.setWidth(state.width),
        }
    )
);

// Clamp a width to the allowed range (the user's preference, independent of viewport).
const clampWidth = (width: number) =>
    Math.min(AI_CHAT_MAX_WIDTH, Math.max(AI_CHAT_MIN_WIDTH, Math.round(width)));

const MIN_CONTENT_WIDTH = 720;

// Cap a width so the remaining content keeps a usable minimum at the current viewport.
const capToViewport = (width: number) =>
    typeof window === 'undefined'
        ? width
        : Math.min(width, Math.max(AI_CHAT_MIN_WIDTH, window.innerWidth - MIN_CONTENT_WIDTH));
