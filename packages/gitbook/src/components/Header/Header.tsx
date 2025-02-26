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
    const isMultiVariants = siteSpaces.length > 1;

    return (
        <header
            id="site-header"
            className={tcls(
                'flex',
                'flex-col',
                `h-[${HEADER_HEIGHT_DESKTOP}px]`,
                'sticky',
                'top-0',
                'z-10',
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
                            isMultiVariants && 'page-no-toc:max-[400px]:flex-wrap',
                            CONTAINER_STYLE
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full',
                                isMultiVariants && 'page-no-toc:max-[400px]:w-full',
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
                                    'theme-bold:hover:bg-header-link/3'
                                )}
                            />
                            <HeaderLogo context={context} />
                        </div>

                        {isMultiVariants && (
                            <div className="mr-auto page-no-toc:flex hidden">
                                <SpacesDropdown
                                    context={context}
                                    siteSpace={siteSpace}
                                    siteSpaces={siteSpaces}
                                    className={
                                        'theme-bold:bg-header-link/2 theme-bold:text-header-link theme-bold:ring-header-link/4 theme-bold:group-focus-within/dropdown:bg-header-link/3 theme-bold:group-focus-within/dropdown:text-header-link theme-bold:group-focus-within/dropdown:ring-header-link/6 theme-bold:group-hover/dropdown:bg-header-link/3 theme-bold:group-hover/dropdown:text-header-link theme-bold:group-hover/dropdown:ring-header-link/6 theme-bold:contrast-more:bg-header-background theme-bold:contrast-more:text-header-link theme-bold:contrast-more:ring-header-link theme-bold:contrast-more:group-hover/dropdown:text-header-link theme-bold:contrast-more:group-hover/dropdown:ring-header-link theme-bold:contrast-more:group-focus-within/dropdown:text-header-link theme-bold:contrast-more:group-focus-within/dropdown:ring-header-link theme-bold:dark:bg-header-link/2 theme-bold:dark:text-header-link theme-bold:dark:ring-header-link/4 theme-bold:dark:group-hover/dropdown:bg-header-link/3 theme-bold:dark:group-hover/dropdown:text-header-link theme-bold:dark:group-hover/dropdown:ring-header-link/6 theme-bold:contrast-more:dark:group-hover/dropdown:text-header-link theme-bold:contrast-more:dark:group-hover/dropdown:ring-header-link theme-bold:dark:group-focus-within/dropdown:bg-header-link/3 theme-bold:dark:group-focus-within/dropdown:text-header-link theme-bold:dark:group-focus-within/dropdown:ring-header-link/6 theme-bold:contrast-more:dark:group-focus-within/dropdown:text-header-link theme-bold:contrast-more:dark:group-focus-within/dropdown:ring-header-link'
                                    }
                                />
                            </div>
                        )}

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
            {sections ? (
                <SiteSectionTabs sections={encodeClientSiteSections(context, sections)} />
            ) : null}
        </header>
    );
}
