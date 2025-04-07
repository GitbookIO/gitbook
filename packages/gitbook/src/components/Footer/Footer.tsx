import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { Image } from '@/components/utils';
import { partition } from '@/lib/arrays';
import { tcls } from '@/lib/tailwind';

import { ThemeToggler } from '../ThemeToggler';
import { CONTAINER_STYLE } from '../layout';
import { FooterLinksGroup } from './FooterLinksGroup';

const FOOTER_COLUMNS = 4;
const MAX_COLUMNS_FOR_CONDENSED_LAYOUT = 3; // Prevent unnecessary whitespace when there's not a lot of footer content

export function Footer(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { customization } = context;

    customization.footer.logo = undefined;
    // customization.footer.groups = [...customization.footer.groups, ...customization.footer.groups];

    return (
        <footer
            className={tcls(
                'border-tint-subtle border-t',
                // If the footer only contains a mode toggle, we only show it on smaller screens
                customization.themes.toggeable &&
                    !customization.footer.copyright &&
                    !customization.footer.logo &&
                    customization.footer.groups?.length === 0
                    ? 'xl:hidden'
                    : null
            )}
        >
            <div className="scroll-nojump">
                <div className={tcls(CONTAINER_STYLE, 'px-4', 'mx-auto', 'flex', 'gap-12')}>
                    <div
                        className={tcls(
                            'py-8',
                            'lg:py-12',
                            'gap-12',
                            'flex',
                            'flex-wrap',
                            'items-start',
                            'w-full',
                            'flex-1',
                            'max-w-3xl',
                            'page-full-width:max-w-none',
                            'lg:max-w-none',
                            'mx-auto'
                        )}
                    >
                        {/* Footer Logo */}
                        <div
                            className={tcls(
                                'order-first basis-72',
                                customization.footer.logo ? 'flex' : 'hidden',
                                customization.footer.logo &&
                                    customization.footer.groups.length >
                                        MAX_COLUMNS_FOR_CONDENSED_LAYOUT
                                    ? 'xl:flex'
                                    : 'lg:flex'
                            )}
                        >
                            {customization.footer.logo ? (
                                <Image
                                    alt="Logo"
                                    resize={context.imageResizer}
                                    sources={{
                                        light: {
                                            src: customization.footer.logo.light,
                                        },
                                        dark: customization.footer.logo.dark
                                            ? {
                                                  src: customization.footer.logo.dark,
                                              }
                                            : null,
                                    }}
                                    priority="lazy"
                                    style={[
                                        'w-auto',
                                        'max-w-40',
                                        'lg:max-w-64',
                                        'max-h-10',
                                        'lg:max-h-12',
                                        'object-contain',
                                        'object-left',
                                        'rounded',
                                        'straight-corners:rounded-sm',
                                    ]}
                                    sizes={[
                                        {
                                            width: 320,
                                        },
                                    ]}
                                />
                            ) : null}
                        </div>

                        {/* Mode Switcher */}
                        <div className="order-3 ml-auto flex items-center justify-end empty:max-lg:hidden xl:hidden">
                            {customization.themes.toggeable ? (
                                <React.Suspense fallback={null}>
                                    <ThemeToggler />
                                </React.Suspense>
                            ) : null}
                        </div>

                        {/* Navigation Groups (split into equal columns) */}
                        {customization.footer.groups?.length > 0 ? (
                            <div
                                className={tcls(
                                    'order-3 mx-auto flex w-full max-w-3xl grow flex-col gap-10 sm:flex-row sm:gap-6 xl:w-auto',
                                    customization.footer.groups.length <=
                                        MAX_COLUMNS_FOR_CONDENSED_LAYOUT && 'lg:order-2 lg:w-auto',
                                    !customization.footer.logo &&
                                        customization.footer.groups.length <=
                                            MAX_COLUMNS_FOR_CONDENSED_LAYOUT &&
                                        'self-center sm:order-2 sm:w-auto sm:max-w-3xl sm:flex-1 sm:items-start sm:text-start'
                                )}
                            >
                                {partition(customization.footer.groups, FOOTER_COLUMNS).map(
                                    (column, columnIndex) => (
                                        <div
                                            key={columnIndex}
                                            className="flex w-full flex-col gap-10"
                                        >
                                            {column.map((group, groupIndex) => (
                                                <FooterLinksGroup
                                                    key={groupIndex}
                                                    group={group}
                                                    context={context}
                                                />
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : null}

                        <div className="order-3 hidden xl:block xl:basis-56" />

                        {/* Legal */}
                        <div
                            className={tcls(
                                'order-4 mx-auto flex w-full grow flex-col items-center gap-2 text-center text-tint text-xs empty:hidden',
                                customization.footer.groups.length === 0 &&
                                    'self-center sm:order-1 sm:w-auto sm:max-w-3xl sm:flex-1 sm:items-start sm:text-start'
                            )}
                        >
                            {customization.footer.copyright ? (
                                <p>{customization.footer.copyright}</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
