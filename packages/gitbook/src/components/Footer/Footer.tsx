import type { GitBookSiteContext } from '@/lib/context';
import React from 'react';

import { Image } from '@/components/utils';
import { partition } from '@/lib/arrays';
import { tcls } from '@/lib/tailwind';

import { ThemeToggler } from '../ThemeToggler';
import { CONTAINER_STYLE } from '../layout';
import { FooterLinksGroup } from './FooterLinksGroup';
import { SocialLink } from './SocialLink';

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
            <div className="motion-safe:transition-[padding] motion-safe:duration-300 lg:chat-open:pr-80 xl:chat-open:pr-96">
                <div
                    className={tcls(
                        CONTAINER_STYLE,
                        'px-4',
                        'py-8',
                        '@4xl:py-12',
                        'mx-auto',
                        '@container/footer'
                    )}
                >
                    <div
                        className={tcls(
                            'mx-auto flex @xs:grid @4xl:max-w-none! max-w-3xl site-width-wide:max-w-screen-2xl flex-col justify-between gap-12',
                            'grid-cols-[auto_auto]',
                            '@4xl:grid-cols-[18rem_minmax(auto,48rem)_auto]',
                            '@7xl:grid-cols-[18rem_minmax(auto,48rem)_14rem]',
                            '@4xl:site-width-wide:grid-cols-[18rem_minmax(auto,80rem)_auto]',
                            '@7xl:site-width-wide:grid-cols-[18rem_minmax(auto,80rem)_14rem]',
                            '@4xl:page-no-toc:grid-cols-[minmax(auto,48rem)_auto]',
                            '@7xl:page-no-toc:grid-cols-[14rem_minmax(auto,48rem)_14rem]',
                            '@4xl:[body:has(.site-width-wide,.page-no-toc)_&]:grid-cols-[minmax(auto,90rem)_auto]',
                            '@7xl:[body:has(.site-width-wide,.page-no-toc)_&]:grid-cols-[14rem_minmax(auto,90rem)_14rem]'
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
                                        loading="lazy"
                                        style={[
                                            'w-auto',
                                            'max-w-40',
                                            '@4xl:max-w-64',
                                            'max-h-10',
                                            '@4xl:max-h-12',
                                            'object-contain',
                                            'object-left',
                                            'rounded-sm',
                                            'straight-corners:rounded-xs',
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
                                <div className="-col-start-2 row-start-1 flex items-start @xs:justify-end xl:hidden">
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
                                        '@4xl:page-has-toc:col-span-1 @7xl:page-no-toc:col-span-1 col-span-2 @4xl:page-has-toc:col-start-2 @7xl:page-no-toc:col-start-2'
                                    )}
                                >
                                    <div className="mx-auto flex max-w-3xl site-width-wide:max-w-screen-2xl @xl:flex-row flex-col @xl:gap-6 gap-10">
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
                            // Social Links
                            customization.socialAccounts.filter(
                                (account) => account.display?.footer
                            ).length > 0 ? (
                                <div className="col-span-full flex w-full grow items-center justify-center gap-2">
                                    {customization.socialAccounts?.map((account) => (
                                        <SocialLink
                                            key={`${account.platform}-${account.handle}`}
                                            account={account}
                                            target={customization.externalLinks.target}
                                        />
                                    ))}
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
