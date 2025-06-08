import { create } from 'zustand';

/**
 * Hooks to manage the mobile menu sheet state.
 */
export const useMobileMenuSheet = create<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
}));
