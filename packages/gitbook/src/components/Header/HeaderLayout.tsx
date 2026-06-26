import type { CustomizationSearchStyle } from '@gitbook/api';
import type React from 'react';

import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { tcls } from '@/lib/tailwind';

const PROMINENT_SEARCH_STYLE: CustomizationSearchStyle = 'prominent' as CustomizationSearchStyle;

/**
 * Shared visual layout for the site header.
 *
 * The live site and structure preview provide different interactive pieces, but the shell,
 * spacing, responsive behavior, and theme classes should stay identical.
 */
export function HeaderLayout(props: {
    leading: React.ReactNode;
    search: React.ReactNode;
    searchStyle: CustomizationSearchStyle;
    withTopHeader?: boolean;
    links?: React.ReactNode;
    sections?: React.ReactNode;
}) {
    const { leading, search, searchStyle, withTopHeader, links, sections } = props;
    const hasProminentSearch = searchStyle === PROMINENT_SEARCH_STYLE;

    return (
        <header
            data-gb-site-header
            className={tcls(
                'flex',
                'flex-col',
                `h-[${HEADER_HEIGHT_DESKTOP}px]`,
                'sticky',
                'top-0',
                'pt-[env(safe-area-inset-top)]',
                'z-30',
                'w-full',
                'flex-none',
                'shadow-[0px_1px_0px]',
                'shadow-tint-12/2',
                'bg-tint-base/9',
                'theme-muted:bg-tint-subtle/9',
                '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle/9',
                'theme-gradient:bg-gradient-primary',
                'theme-gradient-tint:bg-gradient-tint',
                'contrast-more:bg-tint-base',
                withTopHeader ? null : 'mobile-only lg:hidden',
                'text-sm',
                'backdrop-blur-lg'
            )}
        >
            <div
                className={tcls(
                    'site-header:theme-bold:bg-header-background',
                    'site-header:theme-bold:shadow-[0px_1px_0px]',
                    'site-header:theme-bold:shadow-tint-12/2'
                )}
            >
                <div className="transition-all duration-300 motion-reduce:transition-none lg:chat-open:pr-80 xl:chat-open:pr-96">
                    <div
                        data-gb-header-content
                        className={tcls(
                            'gap-4',
                            'lg:gap-6',
                            'flex',
                            'items-center',
                            'justify-between',
                            'w-full',
                            'py-3',
                            'min-h-16',
                            'sm:h-16',
                            CONTAINER_STYLE,
                            'transition-[max-width] duration-300 motion-reduce:transition-none',
                            '@container/header'
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full',
                                'min-w-0 shrink items-center justify-start gap-2 lg:gap-4',
                                hasProminentSearch ? 'lg:@2xl:basis-72' : null
                            )}
                        >
                            {leading}
                        </div>

                        <div
                            className={tcls(
                                'flex',
                                'grow-0',
                                'shrink-0',
                                'md:@2xl:basis-56',
                                'justify-self-end',
                                'items-center',
                                'gap-2',
                                'transition-[margin] duration-300 motion-reduce:transition-none',
                                hasProminentSearch
                                    ? [
                                          'md:@2xl:grow-[0.8]',
                                          'md:@4xl:basis-40',
                                          'md:@2xl:max-w-[50%]',
                                          'md:@4xl:max-w-lg',
                                          'lg:@2xl:ml-[max(calc((100%-18rem-48rem)/2),1.5rem)]',
                                          'not-chat-open:xl:ml-[max(calc((100%-18rem-48rem-14rem-3rem)/2),1.5rem)]',
                                          'md:@2xl:mr-auto',
                                          'order-last',
                                          'md:@2xl:order-[unset]',
                                      ]
                                    : ['order-last']
                            )}
                        >
                            {search}
                        </div>

                        {links}
                    </div>
                </div>
            </div>

            {sections ? (
                <div className="transition-[padding] duration-300 motion-reduce:transition-none lg:chat-open:pr-80 xl:chat-open:pr-96">
                    {sections}
                </div>
            ) : null}
        </header>
    );
}
