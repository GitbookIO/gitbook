import { CustomizationSettings, Site, SiteCustomizationSettings, Space } from '@gitbook/api';
import { CustomizationHeaderPreset } from '@gitbook/api';
import { Suspense } from 'react';

import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { t, getSpaceLanguage } from '@/intl/server';
import type { SectionsList } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { HeaderLink } from './HeaderLink';
import { HeaderLinkMore } from './HeaderLinkMore';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { SpacesDropdown } from './SpacesDropdown';
import { SearchButton } from '../Search';
import { SiteSectionTabs } from '../SiteSections';
import { HeaderMobileMenu } from './HeaderMobileMenu';

/**
 * Render the header for the space.
 */
export function Header(props: {
    space: Space;
    site: Site | null;
    spaces: Space[];
    sections: SectionsList | null;
    context: ContentRefContext;
    customization: CustomizationSettings | SiteCustomizationSettings;
    withTopHeader?: boolean;
}) {
    const { context, space, site, spaces, sections, customization, withTopHeader } = props;
    const isCustomizationDefault =
        customization.header.preset === CustomizationHeaderPreset.Default;
    const hasSiteSections = sections && sections.list.length > 1;
    const isMultiVariants = site && spaces.length > 1;

    return (
        <header
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
                '[html.tint.sidebar-filled_&]:bg-tint-subtle/9',
                'contrast-more:bg-tint-base',
                withTopHeader ? null : 'lg:hidden',
                'text-sm',
                'backdrop-blur-lg',
            )}
        >
            <div
                className={tcls(
                    !isCustomizationDefault &&
                        withTopHeader && [
                            'bg-header-background',
                            'shadow-[0px_1px_0px]',
                            'shadow-tint-12/2',
                        ],
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
                            CONTAINER_STYLE,
                        )}
                    >
                        <div
                            className={tcls(
                                'flex max-w-full',
                                isMultiVariants && 'page-no-toc:max-[400px]:w-full',
                                'shrink min-w-0 gap-2 lg:gap-4 justify-start items-center',
                            )}
                        >
                            <HeaderMobileMenu
                                className={tcls(
                                    'lg:hidden',
                                    '-ml-2',
                                    customization.header.preset ===
                                        CustomizationHeaderPreset.Default
                                        ? ['text-tint-strong']
                                        : 'text-header-link',
                                )}
                            />
                            <HeaderLogo site={site} space={space} customization={customization} />
                        </div>

                        {isMultiVariants && (
                            <div className="hidden page-no-toc:flex mr-auto">
                                <SpacesDropdown
                                    space={space}
                                    spaces={spaces}
                                    className={
                                        !isCustomizationDefault
                                            ? `bg-header-link/2 text-header-link ring-header-link/4 
                                            dark:bg-header-link/2 dark:text-header-link dark:ring-header-link/4 
                                            group-hover/dropdown:bg-header-link/3 group-hover/dropdown:text-header-link group-hover/dropdown:ring-header-link/6
                                            dark:group-hover/dropdown:bg-header-link/3 dark:group-hover/dropdown:text-header-link dark:group-hover/dropdown:ring-header-link/6
                                            group-focus-within/dropdown:bg-header-link/3 group-focus-within/dropdown:text-header-link group-focus-within/dropdown:ring-header-link/6
                                            dark:group-focus-within/dropdown:bg-header-link/3 dark:group-focus-within/dropdown:text-header-link dark:group-focus-within/dropdown:ring-header-link/6
                                            
                                            contrast-more:bg-header-background contrast-more:text-header-link contrast-more:ring-header-link
                                            contrast-more:group-hover/dropdown:text-header-link contrast-more:group-hover/dropdown:ring-header-link
                                            contrast-more:dark:group-hover/dropdown:text-header-link contrast-more:dark:group-hover/dropdown:ring-header-link
                                            contrast-more:group-focus-within/dropdown:text-header-link contrast-more:group-focus-within/dropdown:ring-header-link
                                            contrast-more:dark:group-focus-within/dropdown:text-header-link contrast-more:dark:group-focus-within/dropdown:ring-header-link`
                                            : ''
                                    }
                                />
                            </div>
                        )}

                        {customization.header.links.length > 0 && (
                            <HeaderLinks>
                                {customization.header.links.map((link, index) => {
                                    return (
                                        <HeaderLink
                                            key={index}
                                            link={link}
                                            context={context}
                                            customization={customization}
                                        />
                                    );
                                })}
                                <HeaderLinkMore
                                    label={t(getSpaceLanguage(customization), 'more')}
                                    links={customization.header.links}
                                    context={context}
                                    customization={customization}
                                />
                            </HeaderLinks>
                        )}
                        <div
                            className={tcls(
                                'flex',
                                'md:min-w-56',
                                'grow-0',
                                'shrink-0',
                                'justify-self-end',
                            )}
                        >
                            <Suspense fallback={null}>
                                <SearchButton
                                    style={
                                        !isCustomizationDefault && withTopHeader
                                            ? [
                                                  'bg-header-link/2',
                                                  'hover:bg-header-link/3',

                                                  'text-header-link/8',
                                                  'hover:text-header-link',

                                                  'ring-header-link/4',
                                                  'hover:ring-header-link/5',

                                                  '[&_svg]:text-header-link/10',
                                                  '[&_.shortcut]:text-header-link/8',

                                                  'contrast-more:bg-header-background',
                                                  'contrast-more:text-header-link',
                                                  'contrast-more:ring-header-link',
                                                  'contrast-more:hover:bg-header-background',
                                                  'contrast-more:hover:ring-header-link',
                                                  'contrast-more:focus:text-header-link',
                                                  'contrast-more:focus:bg-header-background',
                                                  'contrast-more:focus:ring-header-link',

                                                  'shadow-none',
                                                  'hover:shadow-none',
                                              ]
                                            : null
                                    }
                                >
                                    <span className={tcls('flex-1')}>
                                        {t(
                                            getSpaceLanguage(customization),
                                            customization.aiSearch.enabled
                                                ? 'search_or_ask'
                                                : 'search',
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
                <div
                    className={tcls(
                        'scroll-nojump',
                        'w-full',
                        // Handle long section tabs, particularly on smaller screens.
                        'overflow-x-auto hide-scroll',
                    )}
                >
                    <SiteSectionTabs sections={sections} />
                </div>
            ) : null}
        </header>
    );
}
