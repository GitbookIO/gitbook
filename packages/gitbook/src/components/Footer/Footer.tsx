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

    const hasLogo = customization.footer.logo;
    const groupCount = customization.footer.groups?.length ?? 0;
    const hasGroups = groupCount > 0;
    const hasCopyright = customization.footer.copyright;
    const hasThemeToggle = customization.themes.toggeable;

    const mobileOnly = !hasLogo && !hasGroups && !hasCopyright && hasThemeToggle;

    return (
        <footer
            id="site-footer"
            className={tcls(
                'border-tint-subtle border-t',
                // If the footer only contains a mode toggle, we only show it on smaller screens
                mobileOnly ? 'xl:hidden' : null
            )}
        >
            <div className="scroll-nojump">
                <div className={tcls(CONTAINER_STYLE, 'px-4', 'py-8', 'lg:py-12', 'mx-auto')}>
                    <div
                        className={tcls(
                            'lg:!max-w-none mx-auto grid max-w-3xl site-full-width:max-w-screen-2xl justify-between gap-12',
                            'grid-cols-[auto_auto]',
                            'lg:grid-cols-[18rem_minmax(auto,_48rem)_auto]',
                            'xl:grid-cols-[18rem_minmax(auto,_48rem)_14rem]',
                            'site-full-width:lg:grid-cols-[18rem_minmax(auto,_80rem)_auto]',
                            'site-full-width:xl:grid-cols-[18rem_minmax(auto,_80rem)_14rem]',
                            'page-no-toc:lg:grid-cols-[minmax(auto,_48rem)_auto]',
                            'page-no-toc:xl:grid-cols-[14rem_minmax(auto,_48rem)_14rem]',
                            '[body:has(.site-full-width,.page-no-toc)_&]:lg:grid-cols-[minmax(auto,_90rem)_auto]',
                            '[body:has(.site-full-width,.page-no-toc)_&]:xl:grid-cols-[14rem_minmax(auto,_90rem)_14rem]'
                        )}
                    >
                        {
                            // Footer Logo
                            customization.footer.logo ? (
                                <div className="col-start-1 row-start-1">
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
                                </div>
                            ) : null
                        }

                        {
                            // Theme Toggle
                            customization.themes.toggeable ? (
                                <div className="-col-start-2 row-start-1 flex items-start justify-end xl:hidden">
                                    <React.Suspense fallback={null}>
                                        <ThemeToggler />
                                    </React.Suspense>
                                </div>
                            ) : null
                        }

                        {
                            // Navigation groups (split into equal columns)
                            customization.footer.groups?.length > 0 ? (
                                <div
                                    className={tcls(
                                        'col-span-2 page-has-toc:lg:col-span-1 page-has-toc:lg:col-start-2 page-no-toc:xl:col-span-1 page-no-toc:xl:col-start-2'
                                    )}
                                >
                                    <div className="mx-auto flex max-w-3xl site-full-width:max-w-screen-2xl flex-col gap-10 sm:flex-row sm:gap-6">
                                        {partition(customization.footer.groups, FOOTER_COLUMNS).map(
                                            (column, columnIndex) => (
                                                <div
                                                    key={columnIndex}
                                                    className="flex flex-1 grow flex-col gap-10"
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
                                </div>
                            ) : null
                        }

                        {
                            // Legal
                            customization.footer.copyright ? (
                                <div className="order-last col-span-full flex w-full grow flex-col items-center gap-2 text-center text-tint text-xs">
                                    <p>{customization.footer.copyright}</p>
                                </div>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </footer>
    );
}
