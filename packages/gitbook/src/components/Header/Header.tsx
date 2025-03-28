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
                <div className="scroll-nojump">
                    <div
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
                            CONTAINER_STYLE
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full lg:basis-72',
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
                                    'page-no-toc:hidden'
                                )}
                            />
                            <HeaderLogo context={context} />
                        </div>

                        <div
                            className={tcls(
                                'flex',
                                'grow-0',
                                'shrink-0',
                                'md:basis-56',
                                'justify-self-end',
                                'search' in customization.styling &&
                                    customization.styling.search === 'prominent'
                                    ? [
                                          'md:grow-[0.8]',
                                          'lg:basis-40',
                                          'md:max-w-[40%]',
                                          'lg:max-w-lg',
                                          'lg:ml-[max(calc((100%-18rem-48rem-3rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem) - margin (3rem)
                                          'xl:ml-[max(calc((100%-18rem-48rem-14rem-3rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem) - outline (14rem) - margin (3rem)
                                          'page-no-toc:lg:ml-[max(calc((100%-18rem-48rem-18rem-3rem)/2),0rem)]',
                                          'page-full-width:lg:ml-[max(calc((100%-18rem-103rem-3rem)/2),1.5rem)]',
                                          'page-full-width:2xl:ml-[max(calc((100%-18rem-96rem-14rem+3rem)/2),1.5rem)]',
                                          'md:mr-auto',
                                          'order-last',
                                          'md:order-[unset]',
                                      ]
                                    : ['order-last']
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
                                        'whitespace-nowrap',
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

                        {customization.header.links.length > 0 && (
                            <HeaderLinks>
                                {customization.header.links.map((link) => {
                                    return (
                                        <HeaderLink
                                            key={link.title}
                                            link={link}
                                            context={context}
                                        />
                                    );
                                })}
                                <HeaderLinkMore
                                    label={t(getSpaceLanguage(customization), 'more')}
                                    links={customization.header.links}
                                    context={context}
                                />
                            </HeaderLinks>
                        )}
                    </div>
                </div>
            </div>

            {sections || siteSpaces.length > 1 ? (
                <div className="scroll-nojump">
                    <div
                        className={tcls(
                            'w-full',
                            'overflow-x-scroll',
                            'overflow-y-hidden',
                            'hide-scroll',
                            '-mb-4 pb-4', // Positive padding / negative margin allows the navigation menu indicator to show in a scroll viewƒ
                            !sections ? ['hidden', 'page-no-toc:flex'] : 'flex'
                        )}
                    >
                        <div
                            className={tcls(
                                CONTAINER_STYLE,
                                'page-default-width:max-w-[unset]',
                                'grow',
                                'flex',
                                'items-end',
                                'page-default-width:2xl:px-[calc((100%-1536px+4rem)/2)]'
                            )}
                        >
                            {siteSpaces.length > 1 && (
                                <div
                                    id="variants"
                                    className="my-2 mr-5 page-no-toc:flex hidden grow border-tint border-r pr-5 *:grow only:mr-0 only:border-none only:pr-0 sm:max-w-64"
                                >
                                    <SpacesDropdown
                                        context={context}
                                        siteSpace={siteSpace}
                                        siteSpaces={siteSpaces}
                                        className="w-full grow py-1"
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
                </div>
            ) : null}
        </header>
    );
}
