'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { currentPageMetadataStore, useScrollToHash } from '@/components/hooks';
import type { PageMetaLinks } from './SitePage';

/**
 * Client component to initialize interactivity for a page.
 */
export function PageClientLayout({
    pageMetaLinks,
}: {
    pageMetaLinks: PageMetaLinks | null;
}) {
    // We use this hook in the page layout to ensure the elements for the blocks
    // are rendered before we scroll to a hash or to the top of the page
    useScrollToHash();

    // The page metadata such as meta links are generated on the server side,
    // but need to be registered on the client side in other parts of the layout
    // such as the SpaceDropdown.
    useRegisterPageMetadata({ pageMetaLinks });

    useStripFallbackQueryParam();
    useMarkTextOverCover();
    return null;
}

/**
 * Strip the fallback query parameter from current URL.
 *
 * When the user switches variants using the space dropdown, we pass a fallback=true parameter.
 * This parameter indicates that we should redirect to the root page if the path from the
 * previous variant doesn't exist in the new variant. If the path does exist, no redirect occurs,
 * so we need to remove the fallback parameter.
 */
function useStripFallbackQueryParam() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        if (searchParams?.has('fallback')) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('fallback');
            router.push(`${pathname}?${params.toString()}${window.location.hash ?? ''}`);
        }
    }, [router, pathname, searchParams]);
}

/**
 * Register the generated page metadata such as meta links for the current page.
 */
function useRegisterPageMetadata(metadata: {
    pageMetaLinks: PageMetaLinks | null;
}) {
    const { pageMetaLinks } = metadata;
    React.useEffect(() => {
        currentPageMetadataStore.setState({ metaLinks: pageMetaLinks });
    }, [pageMetaLinks]);
}

/**
 * Mark the text elements that overlap a background page cover, so they can be recolored to stay
 * readable against it (see the `text-contrast-cover` utility).
 *
 * The elements that opt in carry `data-cover-aware-text`; the ones found to overlap get
 * `data-over-cover`. Both edges are read in viewport coordinates, which is what makes this work for
 * the sticky page outline too: it stays pinned while the cover scrolls away underneath it.
 */
function useMarkTextOverCover() {
    React.useEffect(() => {
        const root = document.documentElement;
        const pageCover = document.querySelector<HTMLElement>('[data-gb-page-cover]');

        // Only a background cover sits behind the content; a hero/full cover pushes it down.
        if (!pageCover || pageCover.dataset.coverType !== 'background') {
            return;
        }

        let animationFrame: number | null = null;

        const update = () => {
            const coverBottom = pageCover.getBoundingClientRect().bottom;
            const elements = Array.from(
                document.querySelectorAll<HTMLElement>('[data-cover-aware-text]')
            );

            // Measure everything before mutating, so we don't interleave layout reads and writes.
            const isOverCover = elements.map((element) => {
                const rect = element.getBoundingClientRect();

                // A `display: none` element has no box, and its empty rect reads as sitting at the
                // very top of the document — keep the marking it was rendered with until it is
                // actually laid out, rather than flipping it on a meaningless measurement.
                if (rect.width === 0 && rect.height === 0) {
                    return element.hasAttribute('data-over-cover');
                }

                return rect.top < coverBottom;
            });

            elements.forEach((element, index) => {
                element.toggleAttribute('data-over-cover', isOverCover[index]);
            });
        };

        const scheduleUpdate = () => {
            if (animationFrame !== null) {
                return;
            }

            animationFrame = requestAnimationFrame(() => {
                animationFrame = null;
                update();
            });
        };

        scheduleUpdate();

        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });

        const resizeObserver =
            typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null;
        resizeObserver?.observe(pageCover);

        const mutationObserver =
            typeof MutationObserver !== 'undefined' ? new MutationObserver(scheduleUpdate) : null;

        // Dismissing the announcement banner only toggles a class on <html> (see
        // dismissAnnouncement) — no scroll/resize event and no cover resize — yet it shifts the
        // cover up.
        mutationObserver?.observe(root, { attributes: true, attributeFilter: ['class'] });

        // Blocks that stream in late bring elements that still need measuring. Scoped to the page
        // body so unrelated DOM churn elsewhere (portals, the AI chat streaming its answer) doesn't
        // schedule a measurement pass.
        const pageBody = document.querySelector('main');
        if (pageBody) {
            mutationObserver?.observe(pageBody, { childList: true, subtree: true });
        }

        return () => {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
            }

            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, []);
}
