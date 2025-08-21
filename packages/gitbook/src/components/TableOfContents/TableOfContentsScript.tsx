'use client';

import { useEffect } from 'react';

/**
 * Adjusts TableOfContents height based on visible elements
 */
export function TableOfContentsScript() {
    useEffect(() => {
        const root = document.documentElement;

        // Calculate and set TOC dimensions
        const updateTocLayout = () => {
            // Get key elements
            const header = document.getElementById('site-header');
            const banner = document.getElementById('announcement-banner');
            const footer = document.getElementById('site-footer');
            const pageCover = document.getElementById('page-cover');

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
            root.style.setProperty('--toc-height', `${height}px`);
            root.style.setProperty('--toc-top-offset', `${offset}px`);

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

            root.style.setProperty('--outline-height', `${height}px`);
            root.style.setProperty('--outline-top-offset', `${offset}px`);
        };

        // Initial update
        updateTocLayout();

        // Let the browser handle scroll throttling naturally
        window.addEventListener('scroll', updateTocLayout, { passive: true });
        window.addEventListener('resize', updateTocLayout, { passive: true });

        // Use MutationObserver for DOM changes
        const observer = new MutationObserver(() => {
            requestAnimationFrame(updateTocLayout);
        });

        // Only observe what matters
        observer.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', updateTocLayout);
            window.removeEventListener('resize', updateTocLayout);
        };
    }, []);

    return null;
}
