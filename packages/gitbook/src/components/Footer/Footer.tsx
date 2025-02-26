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
        <>
            <hr className="border-t border-tint-subtle" />
            <div className="scroll-nojump">
                <footer
                    className={tcls(
                        CONTAINER_STYLE,
                        'px-4',
                        'mx-auto',
                        'flex',
                        'gap-12',
                        // If the footer only contains a mode toggle, we only show it on smaller screens
                        customization.themes.toggeable &&
                            !customization.footer.copyright &&
                            !customization.footer.logo &&
                            customization.footer.groups?.length == 0
                            ? 'xl:hidden'
                            : null
                    )}
                >
                    <div className="hidden lg:block basis-72 page-no-toc:hidden" />
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
                            <div className="flex items-center justify-end ml-auto order-2 xl:hidden">
                                <React.Suspense fallback={null}>
                                    <ThemeToggler />
                                </React.Suspense>
                            </div>
                        ) : null}

                        {/* Navigation Groups (split into equal columns) */}
                        {customization.footer.groups?.length > 0 ? (
                            <div
                                className={tcls(
                                    'flex flex-col sm:flex-row mx-auto grow gap-10 sm:gap-6 order-3 w-full',
                                    !customization.footer.logo &&
                                        customization.footer.groups.length < 2 &&
                                        'sm:order-1 sm:flex-1 sm:w-auto sm:items-start sm:max-w-3xl self-center sm:text-start'
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
                                'mx-auto w-full grow text-xs text-tint items-center text-center order-4 flex flex-col gap-2 empty:hidden',
                                customization.footer.groups.length == 0 &&
                                    'sm:order-1 sm:flex-1 sm:w-auto sm:items-start sm:max-w-3xl self-center sm:text-start'
                            )}
                        >
                            {customization.footer.copyright ? (
                                <p>{customization.footer.copyright}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="hidden lg:block xl:basis-56 page-no-toc:hidden" />
                </footer>
            </div>
        </>
    );
}
