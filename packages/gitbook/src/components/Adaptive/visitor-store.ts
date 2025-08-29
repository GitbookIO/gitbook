import { create } from 'zustand';

export type AdaptiveVisitorClaimsData = {
    visitor: {
        claims: Record<string, unknown> & { unsigned: Record<string, unknown> };
    };
};

type AdaptiveVisitorState = {
    data: AdaptiveVisitorClaimsData | null;
    promise: Promise<AdaptiveVisitorClaimsData | null> | null;
    getAdaptiveVisitorClaimsFactory: (
        url: string,
        contextId?: string
    ) => Promise<AdaptiveVisitorClaimsData | null>;
};

export const useAdaptiveVisitorStore = create<AdaptiveVisitorState>((set, get) => {
    return {
        data: null,
        promise: null,
        async getAdaptiveVisitorClaimsFactory(url: string, contextId?: string) {
            // Only fetch visitor claims if contextId is defined (adaptive content site).
            if (!contextId) {
                return null;
            }

            if (get().data) {
                return get().data;
            }

            if (get().promise) {
                return get().promise;
            }

            const promise = (async () => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) {
                        return null;
                    }
                    const data = await res.json<AdaptiveVisitorClaimsData>();
                    set({ data });
                    return data;
                } catch {
                    return null;
                }
            })();

            set({ promise });

            return promise;
        },
    };
});
