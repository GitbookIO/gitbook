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
import { SiteSectionTabs } from '../SiteSectionTabs';
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
                'shadow-thinbottom',
                'dark:shadow-light/2',
                withTopHeader ? null : 'lg:hidden',
                isCustomizationDefault || !withTopHeader
                    ? ['bg-light', 'dark:bg-dark']
                    : ['bg-header-background', 'bg-header-background'],
                'text-sm',
                isCustomizationDefault
                    ? [
                          'bg-opacity-9',
                          'dark:bg-opacity-9',
                          'backdrop-blur-lg',
                          'contrast-more:bg-opacity-11',
                          'contrast-more:dark:bg-opacity-11',
                      ]
                    : null,
            )}
        >
            <div className={tcls('scroll-nojump')}>
                <div
                    className={tcls(
                        'gap-6',
                        'lg:gap-8',
                        'flex',
                        'h-16',
                        'items-center',
                        'justify-between',
                        'w-full',
                        CONTAINER_STYLE,
                    )}
                >
                    <HeaderLogo site={site} space={space} customization={customization} />
                    {!hasSiteSections && isMultiVariants ? (
                        <div className="z-20">
                            <SpacesDropdown space={space} spaces={spaces} />
                        </div>
                    ) : null}
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
                    <div
                        className={tcls(
                            'flex',
                            'md:w-56',
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
                                              // 'bg-transparent',
                                              // 'dark:bg-transparent',
                                              'bg-header-link/2',
                                              'dark:bg-header-link/2',
                                              'hover:bg-header-link/3',
                                              'dark:hover:bg-header-link/3',

                                              'text-header-link/8',
                                              'dark:text-header-link/8',
                                              'hover:text-header-link',
                                              'dark:hover:text-header-link',

                                              'ring-header-link/4',
                                              'dark:ring-header-link/4',
                                              'hover:ring-header-link/5',
                                              'dark:hover:ring-header-link/5',

                                              '[&_svg]:text-header-link/10',
                                              'dark:[&_svg]:text-header-link/10',
                                              '[&_.shortcut]:text-header-link/8',
                                              'dark:[&_.shortcut]:text-header-link/8',

                                              'shadow-none',
                                              'hover:shadow-none',
                                              // 'bg-primary',
                                              // 'text-contrast-primary/6',
                                              // 'ring-contrast-primary/1',
                                              // 'bg-header-link/3',
                                              //   'shadow-sm',
                                              // 'ring-header-link/3',
                                              // '[&>span]:!text-header-link/7',
                                              // '[&_svg]:text-header-link',
                                              //   'contrast-more:bg-transparent',
                                              //   'contrast-more:ring-header-link',
                                              //   'contrast-more:[&>span]:!text-header-link',
                                              //   'dark:bg-header-link/3',
                                              //   'dark:ring-header-link/3',
                                              //   '[&>span]:!text-header-link/7',
                                              //   'dark:[&_svg]:text-header-link',
                                              //   'dark:contrast-more:bg-transparent',
                                              //   'dark:contrast-more:ring-header-link',
                                              //   'dark:contrast-more:[&>span]:!text-header-link',
                                          ]
                                        : null
                                }
                            >
                                <span className={tcls('flex-1')}>
                                    {t(
                                        getSpaceLanguage(customization),
                                        customization.aiSearch.enabled ? 'search_or_ask' : 'search',
                                    )}
                                </span>
                            </SearchButton>
                        </Suspense>
                    </div>
                </div>
            </div>
            {sections ? (
                <div
                    className={tcls(
                        'w-full',
                        // Handle long section tabs, particularly on smaller screens.
                        'overflow-x-auto hide-scroll',
                    )}
                >
                    <SiteSectionTabs {...sections} />
                </div>
            ) : null}
        </header>
    );
}
