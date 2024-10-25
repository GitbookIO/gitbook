import { CustomizationSettings, Site, SiteCustomizationSettings, Space } from '@gitbook/api';
import { CustomizationHeaderPreset } from '@gitbook/api';
import { Suspense } from 'react';

import type { SectionsList } from '@/app/(site)/fetch';
import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '@/components/layout';
import { t, getSpaceLanguage } from '@/intl/server';
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
    children?: React.ReactNode;
}) {
    const { children, context, space, site, spaces, sections, customization, withTopHeader } =
        props;
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
                withTopHeader ? null : 'lg:hidden',
                'lg:z-10',
                'dark:shadow-light/1',
                `${isCustomizationDefault || !withTopHeader ? 'bg-light' : 'bg-header-background'}`,
                `${
                    isCustomizationDefault || !withTopHeader
                        ? 'dark:bg-dark'
                        : 'bg-header-background'
                }`,
            )}
        >
            <div className={tcls('scroll-nojump')}>
                <div
                    className={tcls(
                        'gap-4',
                        'grid',
                        'grid-flow-col',
                        'auto-cols-[auto_auto_1fr_auto]',
                        'h-16',
                        'items-center',
                        'align-center',
                        'justify-between',
                        'w-full',
                        CONTAINER_STYLE,
                    )}
                >
                    <HeaderLogo site={site} space={space} customization={customization} />
                    <span>
                        {!hasSiteSections && isMultiVariants ? (
                            <SpacesDropdown space={space} spaces={spaces} />
                        ) : null}
                    </span>
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
                                              'bg-header-link/3',
                                              'shadow-sm',
                                              'ring-header-link/3',
                                              '[&>span]:!text-header-link/7',
                                              '[&_svg]:text-header-link',
                                              'contrast-more:bg-transparent',
                                              'contrast-more:ring-header-link',
                                              'contrast-more:[&>span]:!text-header-link',
                                              'dark:bg-header-link/3',
                                              'dark:ring-header-link/3',
                                              '[&>span]:!text-header-link/7',
                                              'dark:[&_svg]:text-header-link',
                                              'dark:contrast-more:bg-transparent',
                                              'dark:contrast-more:ring-header-link',
                                              'dark:contrast-more:[&>span]:!text-header-link',
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
                        'w-full shadow-thintop dark:shadow-light/1 bg-light dark:bg-dark z-[9] mt-0.5',
                    )}
                >
                    <div className={tcls(CONTAINER_STYLE)}>
                        <SiteSectionTabs {...sections} />
                    </div>
                </div>
            ) : null}
        </header>
    );
}
