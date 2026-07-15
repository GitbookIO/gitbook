'use client';

import { TrackPageViewEvent } from '@/components/Insights';
import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import leven from 'leven';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { preload } from 'react-dom';
import { useAI } from '../AI';
import { PreservePageLayout } from '../PageBody/PreservePageLayout';
import { useSetSearchState } from '../Search';
import { SiteAuthLoginButton } from '../SiteAuth/SiteAuthLoginLink';
import {
    useSiteAdaptiveAuthLoginHref,
    useSiteIndexURL,
    useSpaceBasePath,
} from '../SpaceLayout/SpaceLayoutContext';
import { CurrentPageProvider, useCurrentContent } from '../hooks';
import { Button, Emoji, SkeletonList, StyledLink, SuspenseLoadedHint } from '../primitives';
import { Input } from '../primitives/Input';

const RELATED_PAGES_COUNT = 5;

type RelatedPage = { id: string; title: string; href: string; emoji?: string; icon?: string };

/**
 * Component that displays a "page not found" message, with ways to recover: related pages,
 * the assistant (when configured), search, login (for adaptive content), and the home page.
 */
export function SitePageNotFound() {
    const basePath = useSpaceBasePath();
    const adaptiveAuthLoginHref = useSiteAdaptiveAuthLoginHref();
    const siteIndexURL = useSiteIndexURL();
    const { siteSpaceId } = useCurrentContent();
    const language = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const setSearchState = useSetSearchState();
    const { assistants } = useAI();

    // getRelatedPages (below) fetches the site index on mount; preload it so the request starts
    // before hydration. Scoped to the 404 page — the common way to hit a broken link cold —
    // rather than the previous every-page preload.
    preload(siteIndexURL, { as: 'fetch', type: 'application/json' });

    // Show the assistant input when a non-search assistant is available (i.e. not just ask-AI).
    const assistant = assistants.find((candidate) => candidate.mode !== 'search') ?? null;
    const inputLabel = tString(language, assistant ? 'search_or_ask' : 'search');

    const fallback = searchParams?.get('fallback');
    const ask = searchParams?.get('ask');
    // Related-page suggestions: `null` while loading, `[]` when there are none.
    const [suggestions, setSuggestions] = useState<RelatedPage[] | null>(null);

    useEffect(() => {
        // ?fallback and ?ask redirect away from the 404. The ?ask redirect also avoids an infinite
        // RSC refetch loop here: leaving it set would rerender the page and restart the assistant.
        if (fallback) {
            router.replace(basePath);
            return;
        }
        if (ask) {
            router.replace(`${basePath}?${searchParams?.toString()}`);
            return;
        }

        // Otherwise, rank the site's pages against the path that 404'd. We reuse the search index
        // (preloaded above and CDN-cached), so this adds no extra origin request — see getRelatedPages.
        let active = true;
        getRelatedPages(siteIndexURL, pathname ?? '', siteSpaceId).then(
            (pages) => {
                if (active) {
                    setSuggestions(pages);
                }
            },
            () => {
                if (active) {
                    setSuggestions([]);
                }
            }
        );
        return () => {
            active = false;
        };
    }, [siteIndexURL, siteSpaceId, fallback, ask, pathname, basePath, router, searchParams]);

    const openSearch = (value?: string) => {
        setSearchState((prev) => ({
            ask: prev?.ask ?? null,
            scope: prev?.scope ?? 'default',
            query: value ?? prev?.query ?? '',
            open: true,
        }));
    };

    return (
        <CurrentPageProvider page={null}>
            <div className="lg:has-sidebar:-ml-84 w-full">
                <main
                    className={tcls(
                        // `page-no-toc` hides the TOC (like PageBody), and `layout-wide` takes the
                        // now-empty sidebar out of flow so the content stays centered on all layouts.
                        'page-no-toc',
                        'layout-wide',
                        'mx-auto',
                        'w-full',
                        'max-w-3xl',
                        'flex',
                        'flex-col',
                        'items-center',
                        'py-[10vh]',
                        'gap-16'
                    )}
                >
                    <PreservePageLayout wideLayout={true} pageHasToc={false} />

                    <div className="flex w-full flex-col items-center gap-8">
                        <div className="flex w-full flex-col items-center gap-2 rounded-3xl">
                            <h1 className={tcls('text-3xl', 'font-semibold', 'text-tint-strong')}>
                                {t(
                                    language,
                                    adaptiveAuthLoginHref
                                        ? 'notfound_adaptive_title'
                                        : 'notfound_title'
                                )}
                            </h1>
                            <p className={tcls('text-base', 'text-tint')}>
                                {t(
                                    language,
                                    adaptiveAuthLoginHref ? 'notfound_adaptive' : 'notfound'
                                )}
                            </p>
                        </div>
                        {adaptiveAuthLoginHref ? (
                            <div className="flex flex-col items-center gap-4">
                                <SiteAuthLoginButton
                                    href={adaptiveAuthLoginHref}
                                    variant="primary"
                                    size="large"
                                    label={t(language, 'notfound_adaptive_login')}
                                    className="w-full max-w-64 justify-center"
                                />
                                <p className="text-center text-sm text-tint-subtle">
                                    {t(language, 'notfound_adaptive_registration_hint')}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex w-full flex-col">
                        <Input
                            label={inputLabel}
                            placeholder={`${inputLabel}…`}
                            sizing="large"
                            leading={assistant ? assistant.icon : 'search'}
                            onSubmit={(value) =>
                                assistant ? assistant.open(value) : openSearch(value)
                            }
                            submitButton={{ label: inputLabel }}
                            maxLength={2048}
                            className="grow"
                        />
                        <NotFoundSuggestions suggestions={suggestions} />
                    </div>

                    {/* "Go to homepage" is the last resort, kept at the end of the flow. */}
                    <Button
                        href={basePath}
                        variant="blank"
                        icon="home"
                        size="small"
                        className="-ml-3 text-base"
                        label={tString(language, 'notfound_goto_home')}
                    />

                    <SuspenseLoadedHint />

                    {/* Track the page not found as a page view */}
                    <TrackPageViewEvent displayContext={SiteInsightsDisplayContext.Site} />
                </main>
            </div>
        </CurrentPageProvider>
    );
}

/**
 * List of related pages, with skeleton rows while they load. Renders nothing once we know
 * there are no suggestions.
 */
function NotFoundSuggestions(props: { suggestions: RelatedPage[] | null }) {
    const { suggestions } = props;
    const language = useLanguage();

    const loading = suggestions === null;
    const hasResults = suggestions != null && suggestions.length > 0;

    return loading || hasResults ? (
        <div className="-mt-4 flex w-full flex-col gap-2 circular-corners:rounded-b-3xl rounded-corners:rounded-b-xl theme-gradient:border border-tint-subtle bg-tint-subtle theme-muted:bg-tint p-8 pt-10">
            <h2 className="font-medium text-tint">{t(language, 'notfound_suggestions_title')}</h2>
            <ul className="flex flex-col gap-2">
                {loading ? (
                    <SkeletonList items={RELATED_PAGES_COUNT} className="my-0.75 max-w-md" />
                ) : (
                    suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.id}
                            className="flex grow origin-left animate-blur-in-slow"
                            style={{ animationDelay: `${index * 25}ms` }}
                        >
                            <StyledLink href={suggestion.href} className="flex items-center gap-2">
                                {suggestion.emoji ? (
                                    <span className="flex size-4 shrink-0 items-center justify-center">
                                        <Emoji
                                            code={suggestion.emoji}
                                            style="text-base leading-none"
                                        />
                                    </span>
                                ) : (
                                    <Icon
                                        icon={(suggestion.icon as IconName) ?? 'file-lines'}
                                        className="size-4 text-tint-subtle"
                                    />
                                )}
                                <span className="grow truncate">{suggestion.title}</span>
                            </StyledLink>
                        </li>
                    ))
                )}
            </ul>
        </div>
    ) : null;
}

/** Minimal shape of an entry in the `~gitbook/site-index` response. */
type IndexPage = {
    id: string;
    title: string;
    pathname: string;
    siteSpaceId: string;
    icon?: string;
    emoji?: string;
};

/**
 * Return the pages whose path is closest to the one that 404'd.
 *
 * Rather than asking the server (which would mean an extra request per 404), this reuses the
 * CDN-cached search index served at `~gitbook/site-index`. The ranking is a lighter, client-side
 * cousin of `getSimilarPages` (which the Markdown 404 runs server-side from the full page tree).
 */
async function getRelatedPages(
    indexURL: string,
    requestedPath: string,
    siteSpaceId: string | null
): Promise<RelatedPage[]> {
    const response = await fetch(indexURL);
    if (!response.ok) {
        return [];
    }
    const { pages } = (await response.json()) as { pages: IndexPage[] };

    return pages
        .filter((page) => !siteSpaceId || page.siteSpaceId === siteSpaceId)
        .map((page) => ({ page, score: scorePathSimilarity(requestedPath, page.pathname) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, RELATED_PAGES_COUNT)
        .map(({ page }) => ({
            id: page.id,
            title: page.title,
            href: page.pathname,
            emoji: page.emoji,
            icon: page.icon,
        }));
}

const normalizePath = (path: string) => path.toLowerCase().replace(/^\/+|\/+$/g, '');
const lastSegment = (path: string) => path.slice(path.lastIndexOf('/') + 1);
const similarity = (left: string, right: string) => {
    const max = Math.max(left.length, right.length);
    return max === 0 ? 1 : 1 - leven(left, right) / max;
};

/** Path similarity in [0, 1] — full-path closeness, weighted toward the last segment. */
function scorePathSimilarity(input: string, candidate: string): number {
    const a = normalizePath(input);
    const b = normalizePath(candidate);
    if (!a || !b) {
        return 0;
    }
    return similarity(a, b) * 0.6 + similarity(lastSegment(a), lastSegment(b)) * 0.4;
}
