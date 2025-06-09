'use client';

import type React from 'react';

import { MobileMenuSheet } from '@/components/MobileMenu';
import { useIsMobile } from '@/hooks/useIsMobile';
import { tcls } from '@/lib/tailwind';
import { TableOfContentsScript } from './TableOfContentsScript';

export function TableOfContents(props: {
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    children: React.ReactNode;
}) {
    const { header, children } = props;
    const isMobile = useIsMobile();

    // If the screen is mobile, we use the mobile menu sheet to display the table of contents.
    if (isMobile) {
        return <MobileMenuSheet>{children}</MobileMenuSheet>;
    }

    return (
        <>
            <aside // Sidebar container, responsible for setting the right dimensions and position for the sidebar.
                data-testid="table-of-contents"
                id="table-of-contents"
                className={tcls(
                    'group',
                    'text-sm',

                    'grow-0',
                    'shrink-0',
                    'basis-full',
                    'lg:basis-72',
                    'page-no-toc:lg:basis-56',

                    'relative',
                    'z-[1]',
                    'lg:sticky',
                    'lg:mr-12',

                    // Server-side static positioning
                    'lg:top-0',
                    'lg:h-screen',
                    'announcement:lg:h-[calc(100vh-4.25rem)]',

                    'site-header:lg:top-16',
                    'site-header:lg:h-[calc(100vh-4rem)]',
                    'announcement:site-header:lg:h-[calc(100vh-4rem-4.25rem)]',

                    'site-header-sections:lg:top-[6.75rem]',
                    'site-header-sections:lg:h-[calc(100vh-6.75rem)]',
                    'announcement:site-header-sections:lg:h-[calc(100vh-6.75rem-4.25rem)]',

                    // Client-side dynamic positioning (CSS vars applied by script)
                    '[html[style*="--toc-top-offset"]_&]:lg:!top-[var(--toc-top-offset)]',
                    '[html[style*="--toc-height"]_&]:lg:!h-[var(--toc-height)]',

                    'pt-6',
                    'pb-4',
                    'sidebar-filled:lg:pr-6',
                    'page-no-toc:lg:pr-0',

                    'hidden',
                    'lg:flex',
                    'page-no-toc:lg:hidden',
                    'page-no-toc:xl:flex',
                    'site-header-none:page-no-toc:lg:flex',
                    'flex-col',
                    'gap-4',
                    'border-tint-subtle'
                )}
            >
                {header && header}
                {children}
            </aside>
            <TableOfContentsScript />
        </>
    );
}
