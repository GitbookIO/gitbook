import { Document, type DocumentValue } from 'flexsearch';

interface Breadcrumb {
    label: string;
    icon?: string;
    emoji?: string;
}

interface RawIndexPage {
    id: string;
    title: string;
    pathname: string;
    siteSpaceId: string;
    lang?: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
}

interface IndexPage {
    [key: string]: DocumentValue | DocumentValue[];
    id: string;
    title: string;
    description: string | null;
    siteSpaceId: string;
}

export interface LocalPageResult {
    type: 'local-page';
    id: string;
    title: string;
    pathname: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
}

type InboundMessage =
    | { type: 'load'; indexURL: string }
    | {
          type: 'search';
          requestId: number;
          query: string;
          lang?: string;
          filterSiteSpaceIds?: string[];
      };

type OutboundMessage =
    | { type: 'loaded' }
    | { type: 'load-error'; message: string }
    | { type: 'results'; requestId: number; results: LocalPageResult[] }
    | { type: 'search-error'; requestId: number };

const cachedIndexes = new Map<string, Document<IndexPage>>();
const cachedPageData = new Map<
    string,
    { pathname: string; icon?: string; emoji?: string; breadcrumbs?: Breadcrumb[] }
>();
let pendingFetch: Promise<Map<string, Document<IndexPage>>> | null = null;

function buildLangIndex(pages: RawIndexPage[]): Document<IndexPage> {
    const index = new Document<IndexPage>({
        document: {
            id: 'id',
            index: ['title', 'description'],
            store: ['id', 'title', 'description', 'siteSpaceId'],
            tag: 'siteSpaceId',
        },
        tokenize: 'full',
        resolution: 15,
        encoder: 'Normalize',
    });

    for (const page of pages) {
        index.addAsync({
            id: page.id,
            title: page.title,
            description: page.description ?? null,
            siteSpaceId: page.siteSpaceId,
        }).catch(() => {
            // Ignore indexing errors for individual pages
        });

        cachedPageData.set(`${page.siteSpaceId}:${page.id}`, {
            pathname: page.pathname,
            icon: page.icon,
            emoji: page.emoji,
            breadcrumbs: page.breadcrumbs?.length ? page.breadcrumbs : undefined,
        });
    }

    return index;
}

async function getOrBuildIndexes(indexURL: string): Promise<Map<string, Document<IndexPage>>> {
    if (cachedIndexes.size > 0) {
        return cachedIndexes;
    }

    if (pendingFetch) {
        return pendingFetch;
    }

    pendingFetch = (async () => {
        const response = await fetch(indexURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch search index: ${response.status}`);
        }

        const data: { version: 1; pages: RawIndexPage[] } = await response.json();

        const pagesByLang = new Map<string, RawIndexPage[]>();
        for (const page of data.pages) {
            const key = page.lang ?? '';
            const bucket = pagesByLang.get(key);
            if (bucket) {
                bucket.push(page);
            } else {
                pagesByLang.set(key, [page]);
            }
        }

        for (const [lang, pages] of pagesByLang) {
            cachedIndexes.set(lang, buildLangIndex(pages));
        }

        return cachedIndexes;
    })();

    pendingFetch.catch(() => {
        pendingFetch = null;
    });

    return pendingFetch;
}

self.onmessage = async (event: MessageEvent<InboundMessage>) => {
    const msg = event.data;

    if (msg.type === 'load') {
        try {
            console.time('Search worker index load');
            await getOrBuildIndexes(msg.indexURL);
            console.timeEnd('Search worker index load');
            self.postMessage({ type: 'loaded' } satisfies OutboundMessage);
        } catch (e) {
            self.postMessage({
                type: 'load-error',
                message: e instanceof Error ? e.message : String(e),
            } satisfies OutboundMessage);
        }
        return;
    }

    if (msg.type === 'search') {
        const { requestId, query, lang, filterSiteSpaceIds } = msg;
        try {
            const index = cachedIndexes.get(lang ?? '');
            if (!index) {
                self.postMessage({ type: 'search-error', requestId } satisfies OutboundMessage);
                return;
            }

            // @ts-ignore - Typing is wrong here, tags can be arrays when using the `tag` filter option
            const rawResults = index.search(query, {
                enrich: true,
                limit: 5,
                suggest: true,
                ...(filterSiteSpaceIds ? { tag: { siteSpaceId: filterSiteSpaceIds } } : {}),
            });

            const seen = new Set<string>();
            const results: LocalPageResult[] = [];

            for (const fieldResult of rawResults) {
                for (const item of fieldResult.result) {
                    const doc = (item as { id: string; doc: IndexPage }).doc;
                    const cacheKey = `${doc.siteSpaceId}:${doc.id}`;
                    if (!seen.has(cacheKey)) {
                        seen.add(cacheKey);
                        const extra = cachedPageData.get(cacheKey);
                        results.push({
                            type: 'local-page',
                            id: doc.id,
                            title: doc.title,
                            pathname: extra?.pathname ?? '',
                            icon: extra?.icon,
                            emoji: extra?.emoji,
                            description: (doc.description as string | null) ?? undefined,
                            breadcrumbs: extra?.breadcrumbs,
                        });
                    }
                }
            }

            self.postMessage({ type: 'results', requestId, results } satisfies OutboundMessage);
        } catch {
            self.postMessage({ type: 'search-error', requestId } satisfies OutboundMessage);
        }
    }
};
