import type { GitBookSiteContext } from '@v2/lib/context';
import { Suspense } from 'react';

import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

import { SearchButton } from '../Search';
import { SiteSectionTabs, encodeClientSiteSections } from '../SiteSections';
import { HeaderLink } from './HeaderLink';
import { HeaderLinkMore } from './HeaderLinkMore';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { HeaderMobileMenu } from './HeaderMobileMenu';
import { SpacesDropdown } from './SpacesDropdown';

/**
 * Render the header for the space.
 */
export function Header(props: { context: GitBookSiteContext; withTopHeader?: boolean }) {
    const { context, withTopHeader } = props;
    const { siteSpace, siteSpaces, sections, customization } = context;

    return (
        <header
            id="site-header"
            className={tcls(
                'flex',
                'flex-col',
                `h-[${HEADER_HEIGHT_DESKTOP}px]`,
                'sticky',
                'top-0',
                'z-30',
                'w-full',
                'flex-none',
                'shadow-[0px_1px_0px]',
                'shadow-tint-12/2',

                'bg-tint-base/9',
                'theme-muted:bg-tint-subtle/9',
                'theme-bold-tint:bg-tint-subtle/9',
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
                    'theme-bold:bg-header-background',
                    'theme-bold:shadow-[0px_1px_0px]',
                    'theme-bold:shadow-tint-12/2'
                )}
            >
                <div className={tcls('scroll-nojump')}>
                    <div
                        className={tcls(
                            'gap-4',
                            'lg:gap-8',
                            'flex',
                            'items-center',
                            'justify-between',
                            'w-full',
                            'py-3',
                            'min-h-16',
                            'sm:h-16',
                            CONTAINER_STYLE
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full',
                                'min-w-0 shrink items-center justify-start gap-2 lg:gap-4'
                            )}
                        >
                            <HeaderMobileMenu
                                className={tcls(
                                    'lg:hidden',
                                    '-ml-2',
                                    'text-tint-strong',
                                    'theme-bold:text-header-link',
                                    'hover:bg-tint-hover',
                                    'theme-bold:hover:bg-header-link/3',
                                    siteSpaces.length < 2 && 'page-no-toc:hidden' // If there is ONLY a trademark to show, we won't show the menu button.
                                )}
                            />
                            <HeaderLogo context={context} />
                        </div>

                        {customization.header.links.length > 0 && (
                            <HeaderLinks>
                                {customization.header.links.map((link, index) => {
                                    return <HeaderLink key={index} link={link} context={context} />;
                                })}
                                <HeaderLinkMore
                                    label={t(getSpaceLanguage(customization), 'more')}
                                    links={customization.header.links}
                                    context={context}
                                />
                            </HeaderLinks>
                        )}
                        <div
                            className={tcls(
                                'flex',
                                'md:min-w-56',
                                'grow-0',
                                'shrink-0',
                                'justify-self-end'
                            )}
                        >
                            <Suspense fallback={null}>
                                <SearchButton
                                    style={[
                                        'theme-bold:bg-header-link/2',
                                        'theme-bold:hover:bg-header-link/3',

                                        'theme-bold:text-header-link/8',
                                        'theme-bold:hover:text-header-link',

                                        'theme-bold:ring-header-link/4',
                                        'theme-bold:hover:ring-header-link/5',

                                        'theme-bold:[&_svg]:text-header-link/10',
                                        'theme-bold:[&_.shortcut]:text-header-link/8',

                                        'theme-bold:contrast-more:bg-header-background',
                                        'theme-bold:contrast-more:text-header-link',
                                        'theme-bold:contrast-more:ring-header-link',
                                        'theme-bold:contrast-more:hover:bg-header-background',
                                        'theme-bold:contrast-more:hover:ring-header-link',
                                        'theme-bold:contrast-more:focus:text-header-link',
                                        'theme-bold:contrast-more:focus:bg-header-background',
                                        'theme-bold:contrast-more:focus:ring-header-link',

                                        'theme-bold:shadow-none',
                                        'theme-bold:hover:shadow-none',
                                    ]}
                                >
                                    <span className={tcls('flex-1')}>
                                        {t(
                                            getSpaceLanguage(customization),
                                            customization.aiSearch.enabled
                                                ? 'search_or_ask'
                                                : 'search'
                                        )}
                                        ...
                                    </span>
                                </SearchButton>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
            {sections || siteSpaces.length > 1 ? (
                <div
                    className={tcls(
                        'w-full',
                        'overflow-x-scroll',
                        'overflow-y-hidden',
                        'hide-scroll',
                        !sections ? ['hidden', 'page-no-toc:flex'] : 'flex'
                        // page-no-toc:mr-[max(calc((100%-14rem-48rem-14rem-6rem)/2),.5rem)] w-64 *:shrink-0 *:grow max-md:only:w-full xl:mr-[max(calc((100%-18rem-48rem-14rem)/2+2rem),5rem)]
                    )}
                >
                    <div
                        className={tcls(
                            CONTAINER_STYLE,
                            'max-w-[unset]',
                            'grow',
                            'flex',
                            'items-end',
                            '2xl:px-[calc((100%-1536px+4rem)/2)]'
                        )}
                    >
                        {siteSpaces.length > 1 && (
                            <div className="my-2 mr-5 page-no-toc:flex hidden grow border-r pr-5 *:grow only:mr-0 only:border-none only:pr-0 sm:max-w-64">
                                <SpacesDropdown
                                    context={context}
                                    siteSpace={siteSpace}
                                    siteSpaces={siteSpaces}
                                    className="grow py-1"
                                />
                            </div>
                        )}
                        {sections && (
                            <SiteSectionTabs
                                sections={encodeClientSiteSections(context, sections)}
                            />
                        )}
                    </div>
                </div>
            ) : null}
        </header>
    );
}
