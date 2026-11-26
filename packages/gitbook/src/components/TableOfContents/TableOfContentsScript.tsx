'use client';

import { useEffect } from 'react';

/**
 * Adjusts TableOfContents height based on visible elements
 */
export function TableOfContentsScript() {
    useEffect(() => {
        const root = document.documentElement;

        // Older Chrome (e.g. 130) emits a mutation record even when the value is unchanged,
        // which would make the observer below re-trigger itself forever.
        const setRootProperty = (name: string, value: string) => {
            if (root.style.getPropertyValue(name) !== value) {
                root.style.setProperty(name, value);
            }
        };

        // Calculate and set TOC dimensions
        const updateTocLayout = () => {
            // Get key elements
            const header = document.querySelector<HTMLElement>('[data-gb-site-header]');
            const banner = document.querySelector<HTMLElement>('[data-gb-announcement-banner]');
            const footer = document.querySelector<HTMLElement>('[data-gb-site-footer]');
            const pageCover = document.querySelector<HTMLElement>('[data-gb-page-cover]');

            // Set sticky top position based on header
            const headerHeight = header?.offsetHeight ?? 0;

            // Start with full viewport height minus header
            let height = window.innerHeight - headerHeight;
            let offset = headerHeight;

            // Subtract visible banner (if any)
            if (banner && window.getComputedStyle(banner).display !== 'none') {
                const bannerRect = banner.getBoundingClientRect();
                if (bannerRect.height > 0 && bannerRect.bottom > 0) {
                    height -= Math.min(bannerRect.height, bannerRect.bottom);
                    offset += Math.min(bannerRect.height, bannerRect.bottom);
                }
            }

            // Subtract visible footer (if any)
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight) {
                    height -= Math.min(footerRect.height, window.innerHeight - footerRect.top);
                }
            }

            // Update height
            setRootProperty('--toc-height', `${Math.max(height, 0)}px`);
            setRootProperty('--toc-top-offset', `${Math.max(offset, 0)}px`);

            // Subtract visible pageCover (if any)
            if (
                pageCover &&
                pageCover.dataset.full === 'true' &&
                window.getComputedStyle(pageCover).display !== 'none'
            ) {
                const coverRect = pageCover.getBoundingClientRect();
                if (coverRect.height > 0 && coverRect.bottom > 0) {
                    height -= Math.min(
                        coverRect.height,
                        Math.max(coverRect.bottom - headerHeight, 0)
                    );
                    offset += Math.min(
                        coverRect.height,
                        Math.max(coverRect.bottom - headerHeight, 0)
                    );
                }
            }

            setRootProperty('--outline-height', `${Math.max(height, 0)}px`);
            setRootProperty('--outline-top-offset', `${Math.max(offset, 0)}px`);
        };

        // Initial update
        updateTocLayout();

        // Let the browser handle scroll throttling naturally
        window.addEventListener('scroll', updateTocLayout, { passive: true });
        window.addEventListener('resize', updateTocLayout, { passive: true });

        // Use MutationObserver for DOM changes
        let pendingFrame: number | null = null;
        const observer = new MutationObserver(() => {
            if (pendingFrame !== null) {
                return;
            }
            pendingFrame = requestAnimationFrame(() => {
                pendingFrame = null;
                updateTocLayout();
            });
        });

        // Only observe what matters
        observer.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        return () => {
            observer.disconnect();
            if (pendingFrame !== null) {
                cancelAnimationFrame(pendingFrame);
            }
            window.removeEventListener('scroll', updateTocLayout);
            window.removeEventListener('resize', updateTocLayout);
        };
    }, []);

    return null;
}
