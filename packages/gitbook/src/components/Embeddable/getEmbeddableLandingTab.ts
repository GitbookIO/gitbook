import type { GitBookEmbeddableConfiguration } from '@gitbook/embed';

export type EmbeddableTab = GitBookEmbeddableConfiguration['tabs'][number];

export const DEFAULT_EMBEDDABLE_TABS: EmbeddableTab[] = ['assistant', 'search', 'docs'];

export function getEmbeddableLandingTab(
    settings: Partial<Pick<GitBookEmbeddableConfiguration, 'tabs' | 'defaultTab' | 'defaultPage'>>
): EmbeddableTab | null {
    const tab = settings.defaultTab ?? (settings.defaultPage ? 'docs' : undefined);
    if (!tab || !DEFAULT_EMBEDDABLE_TABS.includes(tab)) {
        return null;
    }

    const tabs = settings.tabs?.length ? settings.tabs : DEFAULT_EMBEDDABLE_TABS;
    return tabs.includes(tab) ? tab : null;
}
