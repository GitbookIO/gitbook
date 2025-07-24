'use client';

import { MobileMenuScript, useMobileMenuSheet } from '@/components/MobileMenu';
import { TableOfContentsScript } from '@/components/TableOfContents/TableOfContentsScript';
import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import type React from 'react';

export function TableOfContents(props: {
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    children: React.ReactNode;
}) {
    const { header, children } = props;
    const { open, setOpen } = useMobileMenuSheet();

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-tint-12/4 backdrop-blur-lg data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:animate-fadeOut data-[state=open]:animate-fadeIn lg:hidden dark:bg-tint-1/6"
                data-state={open ? 'open' : 'closed'}
                onClick={() => setOpen(false)}
            />
            <aside // Sidebar container, responsible for setting the right dimensions and position for the sidebar.
                data-testid="table-of-contents"
                id="table-of-contents"
                data-state={open ? 'open' : 'closed'}
                className={tcls(
                    'group',

                    'flex',
                    'flex-col',
                    'gap-4',

                    'border-tint-subtle',

                    'fixed',
                    'z-50',

                    'max-lg:transition',
                    'max-lg:ease-in-out',
                    'max-lg:duration-500',

                    'max-lg:rounded-xl',
                    'max-lg:circular-corners:rounded-2xl',
                    'max-lg:straight-corners:rounded-none',
                    'max-lg:bg-tint-base',
                    'max-lg:sidebar-filled:bg-tint-subtle',
                    'max-lg:theme-muted:bg-tint-subtle',
                    'max-lg:[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    'max-lg:[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    'max-lg:[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',

                    'max-lg:pb-2',
                    'max-lg:w-10/12',
                    'max-lg:shadow-lg',
                    'max-lg:depth-flat:shadow-none',
                    'max-lg:inset-1.5',
                    'max-lg:transition-all',
                    'max-lg:duration-300',
                    'max-lg:max-w-sm',
                    'max-lg:data-[state=open]:left-1.5',
                    'max-lg:data-[state=closed]:-left-full',

                    'text-sm',

                    'grow-0',
                    'shrink-0',
                    'lg:basis-72',
                    'page-no-toc:lg:basis-56',

                    'lg:sticky',
                    'lg:z-[1]',
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

                    'lg:pt-6',
                    'lg:pb-4',
                    'sidebar-filled:lg:pr-6',
                    'page-no-toc:lg:pr-0',

                    'page-no-toc:lg:hidden',
                    'page-no-toc:xl:flex',
                    'site-header-none:page-no-toc:lg:flex'
                )}
            >
                {header && header}

                {open ? (
                    <Button
                        variant="blank"
                        icon="close"
                        iconOnly
                        size="medium"
                        autoFocus={false}
                        className="absolute top-2 right-2 z-50 aspect-square size-[calc(2.25rem+1px)] justify-center bg-transparent text-tint opacity-8 shadow-none ring-transparent lg:hidden"
                        onClick={() => setOpen(false)}
                    >
                        <span className="sr-only">Close</span>
                    </Button>
                ) : null}

                {children}
            </aside>
            <TableOfContentsScript />
            <MobileMenuScript />
        </>
    );
}
