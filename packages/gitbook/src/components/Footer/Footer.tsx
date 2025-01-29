import { CustomizationSettings, SiteCustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { Image } from '@/components/utils';
import { partition } from '@/lib/arrays';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { FooterLinksGroup } from './FooterLinksGroup';
import { CONTAINER_STYLE } from '../layout';
import { ThemeToggler } from '../ThemeToggler';

const FOOTER_COLUMNS = 4;

export function Footer(props: {
    space: Space;
    context: ContentRefContext;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { context, customization } = props;

    return (
        <footer className="border-t border-gray-subtle scroll-nojump">
            <div
                className={tcls(
                    CONTAINER_STYLE,
                    'py-8',
                    'gap-12',
                    'flex',
                    'flex-wrap',
                    'items-start',
                )}
            >
                {/* Footer Logo */}
                <div className="shrink sm:basis-72 page-no-toc:lg:basis-56 mr-auto order-1 empty:hidden empty:lg:block page-no-toc:empty:lg:hidden page-no-toc:empty:xl:block">
                    {customization.footer.logo ? (
                        <Image
                            alt="Logo"
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
                <div
                    className={tcls(
                        'ml-auto',
                        'order-2 lg:order-4',
                        customization.footer.groups?.length < 3 &&
                            customization.footer.logo == undefined &&
                            'sm:order-4',
                        'xl:basis-56',
                    )}
                >
                    {customization.themes.toggeable ? (
                        <div className="flex items-center justify-end">
                            <React.Suspense fallback={null}>
                                <ThemeToggler />
                            </React.Suspense>
                        </div>
                    ) : null}
                </div>

                {/* Navigation Groups (split into equal columns) */}
                {customization.footer.groups?.length > 0 ? (
                    <div
                        className={tcls(
                            'flex flex-col sm:flex-row mx-auto grow lg:max-w-3xl gap-10 sm:gap-6 order-3',
                            'w-full lg:w-auto',
                            customization.footer.groups?.length < 3 &&
                                customization.footer.logo == undefined &&
                                'sm:w-auto',
                        )}
                    >
                        {partition(customization.footer.groups, FOOTER_COLUMNS).map(
                            (column, columnIndex) => (
                                <div key={columnIndex} className="flex w-full flex-col gap-10">
                                    {column.map((group, groupIndex) => (
                                        <FooterLinksGroup
                                            key={groupIndex}
                                            group={group}
                                            context={context}
                                        />
                                    ))}
                                </div>
                            ),
                        )}
                    </div>
                ) : null}

                {/* Legal */}
                <div
                    className={tcls(
                        'mx-auto w-full grow text-xs text-gray items-center text-center order-4 flex flex-col gap-2 empty:hidden',
                        customization.footer.groups.length == 0 &&
                            'order-2 lg:flex-1 lg:w-auto lg:items-start lg:max-w-3xl self-center lg:text-start',
                        customization.footer.groups.length == 0 &&
                            customization.footer.logo == undefined &&
                            'sm:w-auto sm:flex-1 sm:items-start sm:max-w-3xl sm:text-start',
                    )}
                >
                    {customization.footer.copyright ? (
                        <p>{customization.footer.copyright}</p>
                    ) : null}
                </div>
            </div>
        </footer>
    );
}
