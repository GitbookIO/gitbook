export interface SearchPrewarmer {
    update(open: boolean): void;
}

export function createSearchPrewarmer(
    initiallyOpen: boolean,
    prewarmSiteSearch: () => Promise<unknown>
): SearchPrewarmer {
    let wasOpen = initiallyOpen;

    return {
        update(open) {
            const shouldPrewarm = !wasOpen && open;
            wasOpen = open;

            if (shouldPrewarm) {
                void prewarmSiteSearch().catch(() => undefined);
            }
        },
    };
}
