import { CustomizationSettings, SiteCustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { Image } from '@/components/utils';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { FooterLinksGroup } from './FooterLinksGroup';
import { CONTAINER_STYLE } from '../layout';
import { ThemeToggler } from '../ThemeToggler';

export function Footer(props: {
    space: Space;
    context: ContentRefContext;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { context, customization } = props;

    return (
        <div
            className={tcls(
                'border-t',
                'border-dark/2',
                'bg-light-2',
                'dark:border-light/2',
                'dark:bg-dark-2',
            )}
        >
            <div className={tcls('scroll-nojump')}>
                <div
                    className={tcls(
                        'flex',
                        'flex-col',
                        CONTAINER_STYLE,

                        'py-6',
                        'gap-6',
                        'md:flex-row',
                        'md:gap-10',

                        //override CONTAINER_STYLE px
                        'px-0',
                        'sm:px-0',
                    )}
                >
                    {' '}
                    {customization.footer.logo ? (
                        <div
                            className={tcls(
                                'pt-8',
                                'border-t',
                                'border-dark/2',
                                'dark:border-light/1',
                                'px-4',
                                'sm:px-6',
                                'md:px-0',
                                'md:pr-10',
                                'md:border-r',
                                'md:border-t-0',
                                'md:pt-0',
                            )}
                        >
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
                                style={['h-auto', 'w-full', 'max-w-12', 'object-contain']}
                                sizes={[
                                    {
                                        width: 320,
                                    },
                                ]}
                            />
                        </div>
                    ) : null}
                    <div
                        className={tcls(
                            'flex-1',
                            'flex',
                            'flex-col',
                            'gap-6',
                            'px-4',
                            'sm:px-6',
                            'md:px-0',
                        )}
                    >
                        {customization.footer.logo || customization.footer.groups?.length > 0 ? (
                            <div
                                className={tcls(
                                    'flex',
                                    'flex-col',
                                    'gap-10',
                                    'sm:gap-20',
                                    'sm:flex-row',
                                    'items-start',
                                    'flex-wrap',
                                )}
                            >
                                {customization.footer.groups.map((group, index) => (
                                    <FooterLinksGroup key={index} group={group} context={context} />
                                ))}
                            </div>
                        ) : null}
                        {customization.footer.copyright ? (
                            <p className={tcls('text-xs', 'text-dark/7', 'dark:text-light/6')}>
                                {customization.footer.copyright}
                            </p>
                        ) : null}
                    </div>
                    {customization.themes.toggeable ? (
                        <div
                            className={tcls(
                                'flex',
                                'flex-col',
                                'items-start',
                                'order-[-1]',
                                'px-4',
                                'sm:px-6',
                                'md:px-0',
                                'md:order-1',
                            )}
                        >
                            <React.Suspense fallback={null}>
                                <ThemeToggler />
                            </React.Suspense>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
