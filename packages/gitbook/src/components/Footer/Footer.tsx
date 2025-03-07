import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { Image } from '@/components/utils';
import { partition } from '@/lib/arrays';
import { tcls } from '@/lib/tailwind';

import { ThemeToggler } from '../ThemeToggler';
import { CONTAINER_STYLE } from '../layout';
import { FooterLinksGroup } from './FooterLinksGroup';

const FOOTER_COLUMNS = 4;

export function Footer(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { customization } = context;

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
                    <div className="hidden page-no-toc:hidden basis-72 lg:block" />
                    <div
                        className={tcls(
                            'py-8',
                            'gap-12',
                            'flex',
                            'flex-wrap',
                            'items-start',
                            'w-full',
                            'flex-1',
                            'max-w-3xl',
                            'page-full-width:max-w-none',
                            'mx-auto'
                        )}
                    >
                        {/* Footer Logo */}
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
                                    'max-h-12',
                                    'object-contain',
                                    'object-left',
                                    'rounded',
                                    'straight-corners:rounded-sm',
                                    'order-1',
                                ]}
                                sizes={[
                                    {
                                        width: 320,
                                    },
                                ]}
                            />
                        ) : null}

                        {/* Mode Switcher */}
                        {customization.themes.toggeable ? (
                            <div className="order-2 ml-auto flex items-center justify-end xl:hidden">
                                <React.Suspense fallback={null}>
                                    <ThemeToggler />
                                </React.Suspense>
                            </div>
                        ) : null}

                        {/* Navigation Groups (split into equal columns) */}
                        {customization.footer.groups?.length > 0 ? (
                            <div
                                className={tcls(
                                    'order-3 mx-auto flex w-full grow flex-col gap-10 sm:flex-row sm:gap-6',
                                    !customization.footer.logo &&
                                        customization.footer.groups.length < 2 &&
                                        'self-center sm:order-1 sm:w-auto sm:max-w-3xl sm:flex-1 sm:items-start sm:text-start'
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
                    <div className="hidden page-no-toc:hidden lg:block xl:basis-56" />
                </div>
            </div>
        </footer>
    );
}
