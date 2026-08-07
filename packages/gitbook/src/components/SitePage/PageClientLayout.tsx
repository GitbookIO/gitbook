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

/** How an element sits relative to the bottom edge of a background page cover. */
type CoverOverlap =
    | { kind: 'none' }
    /** Entirely over the cover: one flat contrast color is enough. */
    | { kind: 'full' }
    /** Crosses the cover's bottom edge, `edge` px below the element's own top. */
    | { kind: 'split'; edge: number }
    /** Not measurable (no layout box) — leave whatever marking it already has. */
    | { kind: 'keep' };

/**
 * Mark the text elements that overlap a background page cover, so they can be recolored to stay
 * readable against it (see the `text-contrast-cover` utility).
 *
 * The elements that opt in carry `data-cover-aware-text`; the ones found to overlap get
 * `data-over-cover`. Both edges are read in viewport coordinates, which is what makes this work for
 * the sticky page outline too: it stays pinned while the cover scrolls away underneath it.
 *
 * An element that crosses the cover's bottom edge has to change color partway down, so it is marked
 * `data-over-cover="split"` with the crossing point in `--cover-edge`.
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
            const measured = elements.map((element): [HTMLElement, CoverOverlap] => {
                const rect = element.getBoundingClientRect();

                // A `display: none` element has no box, and its empty rect reads as sitting at the
                // very top of the document — keep the marking it was rendered with until it is
                // actually laid out, rather than flipping it on a meaningless measurement.
                if (rect.width === 0 && rect.height === 0) {
                    return [element, { kind: 'keep' }];
                }

                const edge = coverBottom - rect.top;

                if (edge <= 0) {
                    return [element, { kind: 'none' }];
                }

                return [element, edge >= rect.height ? { kind: 'full' } : { kind: 'split', edge }];
            });

            for (const [element, overlap] of measured) {
                switch (overlap.kind) {
                    case 'keep':
                        break;
                    case 'none':
                        element.removeAttribute('data-over-cover');
                        element.style.removeProperty('--cover-edge');
                        break;
                    case 'full':
                        element.setAttribute('data-over-cover', '');
                        element.style.removeProperty('--cover-edge');
                        break;
                    case 'split':
                        element.setAttribute('data-over-cover', 'split');
                        element.style.setProperty('--cover-edge', `${overlap.edge}px`);
                        break;
                }
            }
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
