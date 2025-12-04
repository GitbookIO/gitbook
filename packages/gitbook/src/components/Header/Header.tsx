import type { GitBookSiteContext } from '@/lib/context';

import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';
import type { SiteSpace } from '@gitbook/api';
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
    variants: {
        generic: SiteSpace[];
        translations: SiteSpace[];
    };
}) {
    const { context, withTopHeader, variants } = props;
    const { siteSpace, visibleSiteSpaces, visibleSections, customization } = context;

    const withSections = Boolean(
        visibleSections &&
            (visibleSections.list.length > 1 || // Show section tabs if there are at least 2 sections or at least 1 section group
                visibleSections.list.some((s) => s.object === 'site-section-group'))
    );

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
                            CONTAINER_STYLE,
                            'transition-[max-width] duration-300',
                            '@container/header'
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full',
                                'min-w-0 shrink items-center justify-start gap-2 lg:gap-4',
                                'search' in customization.styling &&
                                    customization.styling.search === 'prominent'
                                    ? 'lg:@2xl:basis-72'
                                    : null
                            )}
                        >
                            <HeaderMobileMenu
                                className={tcls(
                                    '-ml-2',
                                    'text-tint-strong',
                                    'theme-bold:text-header-link',
                                    'hover:bg-tint-hover',
                                    'hover:theme-bold:bg-header-link/3',
                                    variants.generic.length > 1
                                        ? 'lg:hidden'
                                        : 'page-no-toc:hidden lg:hidden'
                                )}
                            />
                            <HeaderLogo context={context} />
                        </div>

                        <div
                            className={tcls(
                                'flex',
                                'grow-0',
                                'shrink-0',
                                '@2xl:basis-56',
                                'justify-self-end',
                                'items-center',
                                'gap-2',
                                'transition-[margin] duration-300',
                                'search' in customization.styling &&
                                    customization.styling.search === 'prominent'
                                    ? [
                                          '@2xl:grow-[0.8]',
                                          '@4xl:basis-40',
                                          '@2xl:max-w-[40%]',
                                          '@4xl:max-w-lg',
                                          'lg:@2xl:ml-[max(calc((100%-18rem-48rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem)
                                          'not-chat-open:xl:ml-[max(calc((100%-18rem-48rem-14rem-3rem)/2),1.5rem)]', // container (100%) - sidebar (18rem) - content (48rem) - outline (14rem) - margin (3rem)
                                          '@2xl:mr-auto',
                                          'order-last',
                                          '@2xl:order-[unset]',
                                      ]
                                    : ['order-last']
                            )}
                        >
                            <SearchContainer
                                style={customization.styling.search}
                                withVariants={variants.generic.length > 1}
                                withSiteVariants={
                                    visibleSections?.list.some(
                                        (s) =>
                                            s.object === 'site-section' && s.siteSpaces.length > 1
                                    ) ?? false
                                }
                                withSections={
                                    visibleSections ? visibleSections.list.length > 1 : false
                                }
                                section={
                                    visibleSections
                                        ? // Client-encode to avoid a serialization issue that was causing the language selector to disappear
                                          encodeClientSiteSections(context, visibleSections).current
                                        : undefined
                                }
                                siteSpace={siteSpace}
                                siteSpaces={visibleSiteSpaces}
                                viewport={!withTopHeader ? 'mobile' : undefined}
                            />
                        </div>

                        {customization.header.links.length > 0 ||
                        (!withSections && variants.translations.length > 1) ? (
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
                                {!withSections && variants.translations.length > 1 ? (
                                    <TranslationsDropdown
                                        context={context}
                                        siteSpace={
                                            variants.translations.find(
                                                (space) => space.id === siteSpace.id
                                            ) ?? siteSpace
                                        }
                                        siteSpaces={variants.translations}
                                        className="flex! theme-bold:text-header-link hover:theme-bold:bg-header-link/3"
                                    />
                                ) : null}
                            </HeaderLinks>
                        ) : null}
                    </div>
                </div>
            </div>

            {visibleSections && withSections ? (
                <div className="transition-[padding] duration-300 lg:chat-open:pr-80 xl:chat-open:pr-96">
                    <SiteSectionTabs sections={encodeClientSiteSections(context, visibleSections)}>
                        {variants.translations.length > 1 ? (
                            <TranslationsDropdown
                                context={context}
                                siteSpace={
                                    variants.translations.find(
                                        (space) => space.id === siteSpace.id
                                    ) ?? siteSpace
                                }
                                siteSpaces={variants.translations}
                                className="my-2 ml-2 self-start"
                            />
                        ) : null}
                    </SiteSectionTabs>
                </div>
            ) : null}
        </header>
    );
}
