export interface SearchPrewarmer {
    update(open: boolean, prewarmSiteSearch: () => Promise<unknown>): void;
}

export function createSearchPrewarmer(initiallyOpen: boolean): SearchPrewarmer {
    let wasOpen = initiallyOpen;

    return {
        update(open, prewarmSiteSearch) {
            const shouldPrewarm = !wasOpen && open;
            wasOpen = open;

            if (shouldPrewarm) {
                void prewarmSiteSearch().catch(() => undefined);
            }
        },
    };
}
