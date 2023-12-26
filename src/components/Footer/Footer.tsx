import { CustomizationSettings, Space } from '@gitbook/api';
import React from 'react';

import { Image } from '@/components/utils';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { FooterLinksGroup } from './FooterLinksGroup';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '../layout';
import { ThemeToggler } from '../ThemeToggler';

export function Footer(props: {
    space: Space;
    context: ContentRefContext;
    customization: CustomizationSettings;
    asFullWidth: boolean;
}) {
    const { context, customization, asFullWidth } = props;

    return (
        <div
            className={tcls(
                'border-t',
                'border-dark/2',
                'bg-light-3',
                'dark:border-light/2',
                'dark:bg-dark-2',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],

                    'py-6',
                )}
            >
                <div className={tcls('flex-1', 'flex', 'flex-col', 'gap-6')}>
                    {customization.footer.logo || customization.footer.groups?.length > 0 ? (
                        <div className={tcls('flex', 'flex-row', 'gap-20')}>
                            {customization.footer.logo ? (
                                <div>
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
                                        style={['h-9', 'max-w-80']}
                                    />
                                </div>
                            ) : null}

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
                    <div>
                        <React.Suspense fallback={null}>
                            <ThemeToggler />
                        </React.Suspense>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
