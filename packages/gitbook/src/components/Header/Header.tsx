import type { GitBookSiteContext } from '@/lib/context';

import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';
import { SearchContainer } from '../Search';
import { SiteSectionTabs, encodeClientSiteSections } from '../SiteSections';
import { HeaderLink } from './HeaderLink';
import { HeaderLinkMore } from './HeaderLinkMore';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { HeaderMobileMenu } from './HeaderMobileMenu';
import { TranslationsDropdown } from './SpacesDropdown';

/**
 * Render the header for the space.
 */
export function Header(props: {
    context: GitBookSiteContext;
    withTopHeader?: boolean;
    withVariants?: 'generic' | 'translations';
}) {
    const { context, withTopHeader, withVariants } = props;
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
                '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle/9',
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
                <div className="transition-all duration-300 lg:chat-open:pr-80 xl:chat-open:pr-96">
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
                                    'hover:theme-bold:bg-header-link/3',
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
                                'items-center',
                                'gap-2',
                                'search' in customization.styling &&
                                    customization.styling.search === 'prominent'
                                    ? [
                                          'md:grow-[0.8]',
                                          'lg:basis-40',
                                          'md:max-w-[40%]',
                                          'lg:max-w-lg',
                                          'lg:ml-[max(calc((100%-18rem-48rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem)
                                          'xl:ml-[max(calc((100%-18rem-48rem-14rem-3rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem) - outline (14rem) - margin (3rem)
                                          'md:mr-auto',
                                          'order-last',
                                          'md:order-[unset]',
                                      ]
                                    : ['order-last']
                            )}
                        >
                            <SearchContainer
                                style={customization.styling.search}
                                isMultiVariants={siteSpaces.length > 1}
                                spaceTitle={siteSpace.title}
                                siteSpaceId={siteSpace.id}
                                viewport={!withTopHeader ? 'mobile' : undefined}
                            />
                        </div>

                        {customization.header.links.length > 0 ||
                        (!sections && withVariants === 'translations') ? (
                            <HeaderLinks>
                                {customization.header.links.length > 0 ? (
                                    <>
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
                                            label={t(getSpaceLanguage(context), 'more')}
                                            links={customization.header.links}
                                            context={context}
                                        />
                                    </>
                                ) : null}
                                {!sections && withVariants === 'translations' ? (
                                    <TranslationsDropdown
                                        context={context}
                                        siteSpace={siteSpace}
                                        siteSpaces={siteSpaces}
                                        className="theme-bold:text-header-link hover:theme-bold:bg-header-link/3"
                                    />
                                ) : null}
                            </HeaderLinks>
                        ) : null}
                    </div>
                </div>
            </div>

            {sections ? (
                <div className="transition-all duration-300 lg:chat-open:pr-80 xl:chat-open:pr-96">
                    <div
                        className={tcls(
                            'w-full',
                            'overflow-x-auto',
                            'no-scrollbar',
                            '-mb-4 pb-4', // Positive padding / negative margin allows the navigation menu indicator to show in a scroll viewƒ
                            !sections ? ['hidden', 'page-no-toc:flex'] : 'flex'
                        )}
                    >
                        <div
                            className={tcls(
                                CONTAINER_STYLE,
                                'grow',
                                'flex',
                                'items-end',
                                'page-default-width:2xl:px-[calc((100%-1536px+4rem)/2)]'
                            )}
                        >
                            {sections.list.some((s) => s.object === 'site-section-group') || // If there's even a single group, show the tabs
                            sections.list.length > 1 ? ( // Otherwise, show the tabs if there's more than one section
                                <SiteSectionTabs
                                    sections={encodeClientSiteSections(context, sections)}
                                />
                            ) : null}
                            {withVariants === 'translations' ? (
                                <div className="site-background before:contents[] -mr-4 sm:-mr-6 md:-mr-8 sticky inset-y-0 right-0 z-10 ml-6 flex h-full items-center py-2 pr-4 before:mr-4 before:h-full before:border-tint before:border-l sm:pr-6 md:pr-8">
                                    <TranslationsDropdown
                                        context={context}
                                        siteSpace={siteSpace}
                                        siteSpaces={siteSpaces}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
