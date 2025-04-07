import { create } from 'zustand';

interface SummariesState {
    cache: Map<string, string>;
    setSummary: (key: string, summary: string) => void;
}

export const useSummaries = create<SummariesState>((set) => ({
    cache: new Map(),
    setSummary: (key, summary) =>
        set((state) => {
            const newCache = new Map(state.cache);
            newCache.set(key, summary);
            return { cache: newCache };
        }),
}));
