'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useHash, scrollToHash } from '../hooks';
import { CONTENT_STYLE_REDUCED, MAIN_CONTENT_ID } from '../layout';
import { Button, SkeletonUpdate, SuspenseLoadedHint } from '../primitives';
import { UpdatesFilterContext, applyTagFilterAttribute, areTagsEqual } from './UpdatesFilter';
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
type UpdatesView =
    | { status: 'unfiltered'; pagination: UpdatesPageRange }
    | { status: 'loading'; pagination: UpdatesPageRange | null }
    | { status: 'error'; pagination: null }
    | ({ status: 'filtered' } & Omit<FilteredPage, 'status'>);

type UpdatesSelection = { tags: string[]; page: number };

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const hash = useHash();
    const availableTags = React.useMemo(() => new Set(tagSlugs), [tagSlugs]);
    const styleKey = updatesFilterStyleKey(tagSlugs);
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [view, setView] = React.useState<UpdatesView>({
        status: 'unfiltered',
        pagination: initialPagination,
    });
    const selection = React.useRef<UpdatesSelection>({ tags: [], page: initialPagination.page });
    const hasNewerRevision = React.useRef(false);
    const requestId = React.useRef(0);

    React.useLayoutEffect(() => {
        document.documentElement.setAttribute(UPDATES_FILTER_KEY_ATTR, styleKey);
        return () => {
            requestId.current++;
            document.documentElement.removeAttribute(UPDATES_FILTER_KEY_ATTR);
            document.documentElement.removeAttribute(PENDING_FILTER_ATTR);
            applyTagFilterAttribute([]);
        };
    }, [styleKey]);

    const syncLocation = React.useCallback(
        (force = false) => {
            const url = new URL(window.location.href);
            const { tags, page } = getUpdatesSelection(url, availableTags);
            const previous = selection.current;
            const sameTags = areTagsEqual(tags, previous.tags);
            if (!force && sameTags && page === previous.page) {
                return;
            }

            const id = ++requestId.current;
            selection.current = { tags, page };
            setSelectedTags(tags);
            applyTagFilterAttribute(tags);

            if (!tags.length) {
                if (page !== initialPagination.page) {
                    setView({ status: 'loading', pagination: null });
                    router.replace(relativeURL(url));
                    return;
                }
                if (hasNewerRevision.current) {
                    setView({ status: 'loading', pagination: null });
                    window.location.replace(relativeURL(url));
                    return;
                }
                setView({ status: 'unfiltered', pagination: initialPagination });
                return;
            }

            setView((current) => {
                let pagination = null;
                if (sameTags && current.pagination) {
                    pagination = getUpdatesPageRange(page, current.pagination.totalItems);
                }
                return { status: 'loading', pagination };
            });

            async function load() {
                let result: FilteredUpdatesPageResult = { status: 'error' };
                try {
                    result = await getFilteredUpdatesPage({ pageId, tags, page, isEmbeddable });
                } catch {
                    // Network or aborted action leaves the filter selected so the reader can retry.
                }
                const currentURL = new URL(window.location.href);
                const selected = getUpdatesSelection(currentURL, availableTags);
                if (
                    id !== requestId.current ||
                    currentURL.pathname !== url.pathname ||
                    selected.page !== page ||
                    !areTagsEqual(selected.tags, tags)
                ) {
                    return;
                }

                if (result.status === 'error') {
                    setView({ status: 'error', pagination: null });
                    return;
                }

                if (result.revisionId !== revisionId) {
                    hasNewerRevision.current = true;
                }

                if (result.status === 'unfiltered') {
                    const fallback = currentURL;
                    fallback.searchParams.delete(UPDATES_FILTER_SEARCH_PARAM);
                    setUpdatesPageParam(fallback.searchParams, initialPagination.page);
                    window.history.replaceState(null, '', relativeURL(fallback));
                    selection.current = { tags: [], page: initialPagination.page };
                    setSelectedTags([]);
                    applyTagFilterAttribute([]);
                    if (hasNewerRevision.current) {
                        setView({ status: 'loading', pagination: null });
                        window.location.replace(relativeURL(fallback));
                        return;
                    }
                    setView({ status: 'unfiltered', pagination: initialPagination });
                    return;
                }

                if (result.pagination.isClamped) {
                    const clamped = currentURL;
                    setUpdatesPageParam(clamped.searchParams, result.pagination.page);
                    window.history.replaceState(null, '', relativeURL(clamped));
                    selection.current = { tags, page: result.pagination.page };
                }
                setView({
                    status: 'filtered',
                    revisionId: result.revisionId,
                    content: result.content,
                    sections: result.sections,
                    pagination: result.pagination,
                });
            }

            void load();
        },
        [availableTags, pageId, revisionId, initialPagination, isEmbeddable, router]
    );

    React.useLayoutEffect(() => {
        syncLocation();
    }, [searchParams, syncLocation]);

    React.useEffect(() => {
        const onPopState = () => syncLocation();
        window.addEventListener('popstate', onPopState);
        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [syncLocation]);

    React.useLayoutEffect(() => {
        if (view.status !== 'loading') {
            document.documentElement.removeAttribute(PENDING_FILTER_ATTR);
        }
    }, [view]);

    React.useEffect(() => {
        if (
            view.status === 'loading' ||
            view.status === 'error' ||
            (view.status === 'unfiltered' && selection.current.tags.length > 0)
        ) {
            return;
        }

        let active = true;
        async function resolveHash() {
            const url = new URL(window.location.href);
            const anchorHash = url.hash;
            if (!anchorHash || scrollToHash(anchorHash.slice(1))) {
                return;
            }

            let anchor: string;
            try {
                anchor = decodeURIComponent(anchorHash.slice(1));
            } catch {
                return;
            }

            const id = requestId.current;
            const { tags } = selection.current;
            try {
                const result = await resolveUpdatesAnchor({ pageId, anchor, tags, isEmbeddable });
                if (
                    !active ||
                    !result.found ||
                    id !== requestId.current ||
                    url.href !== window.location.href
                ) {
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
            active = false;
            window.removeEventListener('hashchange', resolveHash);
        };
    }, [hash, isEmbeddable, pageId, router, view]);

    function navigate(tags: string[], page: number, history: 'push' | 'replace') {
        const url = new URL(window.location.href);
        url.searchParams.delete(UPDATES_FILTER_SEARCH_PARAM);
        for (const tag of tags) {
            url.searchParams.append(UPDATES_FILTER_SEARCH_PARAM, tag);
        }
        setUpdatesPageParam(url.searchParams, page);
        url.hash = '';
        if (tags.length === 0 && (page !== initialPagination.page || hasNewerRevision.current)) {
            requestId.current++;
            selection.current = { tags, page };
            setSelectedTags(tags);
            applyTagFilterAttribute(tags);
            setView({ status: 'loading', pagination: null });
            if (hasNewerRevision.current) {
                window.location.replace(relativeURL(url));
            } else {
                router.replace(relativeURL(url));
            }
            return;
        }
        if (history === 'push') {
            window.history.pushState(null, '', relativeURL(url));
        } else {
            window.history.replaceState(null, '', relativeURL(url));
        }
        syncLocation();
        const main = document.getElementById(MAIN_CONTENT_ID);
        if (main) {
            main.scrollIntoView({ block: 'start', behavior: 'instant' });
            main.focus({ preventScroll: true });
        }
    }

    function toggleTag(tag: string) {
        const { tags } = selection.current;
        if (tags.includes(tag)) {
            navigate(
                tags.filter((selected) => selected !== tag),
                1,
                'replace'
            );
            return;
        }

        navigate(normalizeUpdatesFilterTags([...tags, tag], availableTags), 1, 'replace');
    }

    return (
        <UpdatesFilterContext.Provider
            value={{
                selectedTags,
                selectedTagSet: new Set(selectedTags),
                toggleTag,
                clearTags: () => navigate([], 1, 'replace'),
            }}
        >
            <PaginatedUpdatesContext.Provider
                value={{
                    view,
                    goToPage: (page) => navigate(selection.current.tags, page, 'push'),
                    retry: () => syncLocation(true),
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

function getUpdatesSelection(url: URL, availableTags: ReadonlySet<string>): UpdatesSelection {
    return {
        tags: normalizeUpdatesFilterTags(
            url.searchParams.getAll(UPDATES_FILTER_SEARCH_PARAM),
            availableTags
        ),
        page: parseUpdatesPageParam(url.searchParams.get(UPDATES_PAGE_SEARCH_PARAM)) ?? 1,
    };
}

function relativeURL(url: URL): string {
    return `${url.pathname}${url.search}${url.hash}`;
}
