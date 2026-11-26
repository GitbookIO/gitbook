'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { scrollToHash, useHash } from '../hooks';
import { CONTENT_STYLE_REDUCED, MAIN_CONTENT_ID } from '../layout';
import { Button, SkeletonUpdate, SuspenseLoadedHint } from '../primitives';
import { UpdatesFilterContext, applyTagFilterAttribute } from './UpdatesFilter';
import { UpdatesFilterScript } from './UpdatesFilterScript';
import {
    type FilteredUpdatesPageResult,
    getFilteredUpdatesPage,
    resolveUpdatesAnchor,
} from './UpdatesServerActions';
import { tString, useLanguage } from '@/intl/client';
import {
    UPDATES_FILTER_KEY_ATTR,
    UPDATES_FILTER_SEARCH_PARAM,
    type UpdatesPageRange,
    getUpdatesPageRange,
    normalizeUpdatesFilterTags,
    updatesFilterStyleKey,
} from '@/lib/updates';
import {
    UPDATES_PAGE_SEARCH_PARAM,
    parseUpdatesPageParam,
    setUpdatesPageParam,
} from '@/lib/updates-url';

const PENDING_FILTER_ATTR = 'data-updates-pending-filter';
export const HIDE_PENDING_UPDATES = '[html[data-updates-pending-filter]_&]:hidden';

type FilteredPage = Extract<FilteredUpdatesPageResult, { status: 'ok' }>;
type FilterView =
    | { status: 'loading'; tagsKey: string; pagination: UpdatesPageRange | null }
    | { status: 'error'; pagination: null }
    | ({ status: 'filtered'; tagsKey: string } & Omit<FilteredPage, 'status'>);
type UpdatesView = { status: 'unfiltered'; pagination: UpdatesPageRange } | FilterView;

const PaginatedUpdatesContext = React.createContext<{
    view: UpdatesView;
    goToPage: (page: number) => void;
    retry: () => void;
} | null>(null);

export function PaginatedUpdatesProvider(props: {
    pageId: string;
    revisionId: string;
    isEmbeddable: boolean;
    tagSlugs: string[];
    initialPagination: UpdatesPageRange;
    children: React.ReactNode;
}) {
    const { pageId, revisionId, isEmbeddable, tagSlugs, initialPagination, children } = props;
    const searchParams = useSearchParams();
    const availableTags = React.useMemo(() => new Set(tagSlugs), [tagSlugs]);
    const styleKey = updatesFilterStyleKey(tagSlugs);
    const tagsKey = normalizeUpdatesFilterTags(
        searchParams.getAll(UPDATES_FILTER_SEARCH_PARAM),
        availableTags
    ).join(' ');
    const tags = React.useMemo(() => tagsKey.split(' ').filter(Boolean), [tagsKey]);
    const page = parseUpdatesPageParam(searchParams.get(UPDATES_PAGE_SEARCH_PARAM)) ?? 1;
    const { view, retry } = useFilteredUpdatesView({
        pageId,
        revisionId,
        isEmbeddable,
        initialPagination,
        tags,
        page,
    });

    React.useLayoutEffect(() => {
        document.documentElement.setAttribute(UPDATES_FILTER_KEY_ATTR, styleKey);
        return () => {
            document.documentElement.removeAttribute(UPDATES_FILTER_KEY_ATTR);
            document.documentElement.removeAttribute(PENDING_FILTER_ATTR);
            applyTagFilterAttribute([]);
        };
    }, [styleKey]);

    React.useLayoutEffect(() => {
        applyTagFilterAttribute(tags);
    }, [tags]);

    React.useLayoutEffect(() => {
        if (view.status !== 'loading') {
            document.documentElement.removeAttribute(PENDING_FILTER_ATTR);
        }
    }, [view.status]);

    useResolveUpdatesAnchor({ pageId, isEmbeddable, tags, view });

    function toggleTag(tag: string) {
        let nextTags = normalizeUpdatesFilterTags([...tags, tag], availableTags);
        if (tags.includes(tag)) {
            nextTags = tags.filter((selected) => selected !== tag);
        }
        navigate(nextTags, 1, 'replace');
    }

    return (
        <UpdatesFilterContext.Provider
            value={{
                selectedTags: tags,
                selectedTagSet: new Set(tags),
                toggleTag,
                clearTags: () => navigate([], 1, 'replace'),
            }}
        >
            <PaginatedUpdatesContext.Provider
                value={{
                    view,
                    goToPage: (nextPage) => navigate(tags, nextPage, 'push'),
                    retry,
                }}
            >
                {tagSlugs.length > 0 && (
                    <UpdatesFilterScript
                        tagSlugs={tagSlugs}
                        filterAttribute={PENDING_FILTER_ATTR}
                    />
                )}
                {children}
            </PaginatedUpdatesContext.Provider>
        </UpdatesFilterContext.Provider>
    );
}

export function usePaginatedUpdates() {
    return React.useContext(PaginatedUpdatesContext);
}

export function PaginatedUpdatesBody(props: { children: React.ReactNode }) {
    const updates = usePaginatedUpdates();
    const language = useLanguage();
    if (updates?.view.status === 'loading') {
        return <SkeletonUpdate className={CONTENT_STYLE_REDUCED} />;
    }
    if (updates?.view.status === 'error') {
        return (
            <div
                role="alert"
                className={`${CONTENT_STYLE_REDUCED} flex items-center justify-between gap-4 rounded-lg border border-tint-subtle p-4 text-sm text-tint`}
            >
                <span>{tString(language, 'unexpected_error')}</span>
                <Button
                    variant="secondary"
                    size="small"
                    label={tString(language, 'unexpected_error_retry')}
                    onClick={updates.retry}
                />
            </div>
        );
    }
    if (updates?.view.status === 'filtered') {
        return (
            <div className="contents" data-content-ref-root="">
                <SuspenseLoadedHint />
                {updates.view.content}
            </div>
        );
    }
    return <div className={`contents ${HIDE_PENDING_UPDATES}`}>{props.children}</div>;
}

/** Loads the filtered page for the selected tags and page, or falls back to the server-rendered one. */
function useFilteredUpdatesView(options: {
    pageId: string;
    revisionId: string;
    isEmbeddable: boolean;
    initialPagination: UpdatesPageRange;
    tags: string[];
    page: number;
}) {
    const { pageId, revisionId, isEmbeddable, initialPagination, tags, page } = options;
    const tagsKey = tags.join(' ');
    const initialPage = initialPagination.page;
    const router = useRouter();
    const [filterView, setFilterView] = React.useState<FilterView | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);
    const hasNewerRevision = React.useRef(false);
    const view = React.useMemo<UpdatesView>(
        () => filterView ?? { status: 'unfiltered', pagination: initialPagination },
        [filterView, initialPagination]
    );
    const isShowingPage =
        filterView?.status === 'filtered' &&
        filterView.tagsKey === tagsKey &&
        filterView.pagination.page === page;

    React.useLayoutEffect(() => {
        if (!tags.length) {
            if (page === initialPage && !hasNewerRevision.current) {
                setFilterView(null);
                return;
            }
            setFilterView({ status: 'loading', tagsKey, pagination: null });
            const target = relativeURL(new URL(window.location.href));
            if (hasNewerRevision.current) {
                // router.refresh() does not reconcile the [siteData] middleware rewrite.
                window.location.replace(target);
            } else {
                router.replace(target);
            }
            return;
        }

        // A clamped result rewrites the URL to the page it already shows.
        if (isShowingPage) {
            return;
        }

        let cancelled = false;
        setFilterView((current) => {
            let pagination = null;
            if (current?.status !== 'error' && current?.tagsKey === tagsKey && current.pagination) {
                pagination = getUpdatesPageRange(page, current.pagination.totalItems);
            }
            return { status: 'loading', tagsKey, pagination };
        });

        void getFilteredUpdatesPage({ pageId, tags, page, isEmbeddable })
            .catch((): FilteredUpdatesPageResult => ({ status: 'error' }))
            .then((result) => {
                if (cancelled) {
                    return;
                }
                if (result.status === 'error') {
                    setFilterView({ status: 'error', pagination: null });
                    return;
                }
                if (result.revisionId !== revisionId) {
                    hasNewerRevision.current = true;
                }

                const url = new URL(window.location.href);
                if (result.status === 'unfiltered') {
                    url.searchParams.delete(UPDATES_FILTER_SEARCH_PARAM);
                    setUpdatesPageParam(url.searchParams, initialPage);
                    window.history.replaceState(null, '', relativeURL(url));
                    return;
                }
                if (result.pagination.isClamped) {
                    setUpdatesPageParam(url.searchParams, result.pagination.page);
                    window.history.replaceState(null, '', relativeURL(url));
                }
                setFilterView({
                    status: 'filtered',
                    tagsKey,
                    revisionId: result.revisionId,
                    content: result.content,
                    sections: result.sections,
                    pagination: result.pagination,
                });
            });

        return () => {
            cancelled = true;
        };
    }, [
        tags,
        tagsKey,
        page,
        retryCount,
        isShowingPage,
        initialPage,
        pageId,
        isEmbeddable,
        revisionId,
        router,
    ]);

    return { view, retry: () => setRetryCount((count) => count + 1) };
}

/** Moves to the page holding an off-page `#anchor` once the current page has rendered. */
function useResolveUpdatesAnchor(options: {
    pageId: string;
    isEmbeddable: boolean;
    tags: string[];
    view: UpdatesView;
}) {
    const { pageId, isEmbeddable, tags, view } = options;
    const router = useRouter();
    const hash = useHash();

    React.useEffect(() => {
        if (
            view.status === 'loading' ||
            view.status === 'error' ||
            (view.status === 'unfiltered' && tags.length > 0)
        ) {
            return;
        }

        let cancelled = false;
        async function resolveHash() {
            const url = new URL(window.location.href);
            if (!url.hash || scrollToHash(url.hash.slice(1))) {
                return;
            }

            let anchor: string;
            try {
                anchor = decodeURIComponent(url.hash.slice(1));
            } catch {
                return;
            }

            try {
                const result = await resolveUpdatesAnchor({ pageId, anchor, tags, isEmbeddable });
                if (cancelled || !result.found || url.href !== window.location.href) {
                    return;
                }

                setUpdatesPageParam(url.searchParams, result.page);
                if (result.clearTags) {
                    url.searchParams.delete(UPDATES_FILTER_SEARCH_PARAM);
                }
                if (url.href !== window.location.href) {
                    router.replace(relativeURL(url));
                }
            } catch {
                // An unresolved hash should leave the visitor on the current page.
            }
        }

        void resolveHash();
        window.addEventListener('hashchange', resolveHash);
        return () => {
            cancelled = true;
            window.removeEventListener('hashchange', resolveHash);
        };
    }, [hash, isEmbeddable, pageId, router, tags, view]);
}

/** Writes the filter selection to the URL; the provider reacts through `useSearchParams()`. */
function navigate(nextTags: string[], nextPage: number, history: 'push' | 'replace') {
    const url = new URL(window.location.href);
    url.searchParams.delete(UPDATES_FILTER_SEARCH_PARAM);
    for (const tag of nextTags) {
        url.searchParams.append(UPDATES_FILTER_SEARCH_PARAM, tag);
    }
    setUpdatesPageParam(url.searchParams, nextPage);
    url.hash = '';
    if (history === 'push') {
        window.history.pushState(null, '', relativeURL(url));
    } else {
        window.history.replaceState(null, '', relativeURL(url));
    }

    const main = document.getElementById(MAIN_CONTENT_ID);
    if (main) {
        main.scrollIntoView({ block: 'start', behavior: 'instant' });
        // Keeps focus off document.body when the clicked pagination button unmounts.
        main.focus({ preventScroll: true });
    }
}

function relativeURL(url: URL): string {
    return `${url.pathname}${url.search}${url.hash}`;
}
