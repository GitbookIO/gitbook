import { create } from 'zustand';

export const useAdaptivePane = create<{
    opened: boolean;
    open: () => void;
    close: () => void;
}>((set) => ({
    opened: true,

    /**
     * Open the adaptive pane
     */
    open: () => set({ opened: true }),

    /**
     * Close the adaptive pane
     */
    close: () => set({ opened: false }),
}));
