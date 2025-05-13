'use client';

import { useEffect } from 'react';

/**
 * Client component to adjust the TOC positioning based on dynamic elements
 * This gets included alongside the server-rendered TableOfContents
 */
export function TableOfContentsScript() {
    useEffect(() => {
        // Get DOM elements once
        const root = document.documentElement;

        /**
         * Updates TOC position and height based on current layout
         */
        const updateTocLayout = () => {
            // 1. Calculate header height for top offset
            const header = document.getElementById('site-header');
            const headerHeight = header?.offsetHeight || 0;

            // 2. Calculate available height = viewport - header - visibleBanner - visibleFooter
            let availableHeight = window.innerHeight - headerHeight;

            // 3. Subtract visible banner height (if any)
            const banner = document.getElementById('announcement-banner');
            if (
                banner instanceof HTMLElement &&
                window.getComputedStyle(banner).display !== 'none'
            ) {
                const rect = banner.getBoundingClientRect();
                if (rect.height > 0 && rect.bottom > 0) {
                    availableHeight -= Math.min(rect.height, rect.bottom);
                }
            }

            // 4. Subtract visible footer height (if any)
            const footer = document.querySelector('footer');
            if (footer) {
                const rect = footer.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    availableHeight -= Math.min(rect.height, window.innerHeight - rect.top);
                }
            }

            // 5. Update CSS variables
            root.style.setProperty('--toc-top-offset', `${headerHeight}px`);
            root.style.setProperty('--toc-height', `${availableHeight}px`);
        };

        // Throttled scroll handler using requestAnimationFrame
        let isUpdating = false;
        const handleScroll = () => {
            if (!isUpdating) {
                requestAnimationFrame(() => {
                    updateTocLayout();
                    isUpdating = false;
                });
                isUpdating = true;
            }
        };

        // Set up observers and event listeners
        const observer = new MutationObserver(updateTocLayout);

        // Initial calculation
        updateTocLayout();

        // Observe both document.body and root element
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id'],
        });

        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // Add event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateTocLayout);

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateTocLayout);
            observer.disconnect();
        };
    }, []);

    return null;
}
