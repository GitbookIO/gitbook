'use client';

import type { CustomizationContentLink, CustomizationHeaderItem, SiteSpace } from '@gitbook/api';
import {
    CustomizationAIMode,
    CustomizationHeaderPreset,
    CustomizationSearchStyle,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import * as React from 'react';

import { SiteSectionTabs } from '@/components/SiteSections';
import {
    TABLE_OF_CONTENTS_SPACES_DROPDOWN_CLASS,
    getTableOfContentsClassName,
    getTableOfContentsInnerHeaderClassName,
    getTableOfContentsSidebarClassName,
} from '@/components/TableOfContents/styles';
import { Image } from '@/components/utils';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { AIChatButtonView, AIChatIcon, getAIChatName } from '../AIChat';
import { HeaderLayout } from '../Header/HeaderLayout';
import {
    HeaderLinkItem,
    HeaderLinkMenuItem,
    HeaderLinkSubMenu,
    SubHeaderLinkItem,
} from '../Header/HeaderLinkClient';
import { HeaderLinkMoreDropdown } from '../Header/HeaderLinkMoreClient';
import {
    getHeaderLinkDropdownClassName,
    getHeaderLinkMoreDropdownClassName,
} from '../Header/HeaderLinkStyles';
import { HeaderLinks } from '../Header/HeaderLinks';
import {
    HEADER_LOGO_CONTAINER_CLASS,
    HEADER_LOGO_IMAGE_CLASS,
    HEADER_LOGO_IMAGE_SIZES,
    HeaderLogoContent,
} from '../Header/HeaderLogoContent';
import { SpacesDropdownClient } from '../Header/SpacesDropdownClient';
import {
    getSlimSiteSpaces,
    getSpacesDropdownMenuClassName,
    getSpacesDropdownTitle,
    getTranslationsDropdownClassName,
} from '../Header/SpacesDropdownData';
import headerLinksStyles from '../Header/headerLinks.module.css';
import { SearchHeaderInput } from '../Search';
import { CONTAINER_STYLE } from '../layout';
import { Button, type ButtonProps } from '../primitives';
import {
    SOCIAL_PLATFORM_ICONS,
    encodePreviewSiteSections,
    getContentRefKey,
    getHeaderSocialAccounts,
    getPreviewVariants,
    isStructurePreviewMessage,
} from './state';
import type { StructurePreviewSnapshot } from './types';

export function StructurePreview(props: { initialSnapshot: StructurePreviewSnapshot }) {
    const { initialSnapshot } = props;
    const [snapshot, setSnapshot] = React.useState(initialSnapshot);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent<unknown>) => {
            if (event.source !== window.parent || !isStructurePreviewMessage(event.data)) {
                return;
            }

            setSnapshot(event.data.payload);
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const preventNavigation = (event: React.MouseEvent<HTMLElement>) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const anchor = target.closest('a');
        if (!anchor) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div
            data-gb-structure-preview
            data-viewport-mode="desktop"
            className="site-background min-h-screen min-w-[1024px] overflow-hidden"
            onClickCapture={preventNavigation}
            onAuxClickCapture={preventNavigation}
        >
            <StructurePreviewHeader snapshot={snapshot} />
            <StructurePreviewVariantSelector snapshot={snapshot} />
        </div>
    );
}

function StructurePreviewHeader(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const { customization } = snapshot;
    const language = useLanguage();
    const variants = getPreviewVariants(snapshot);
    const sections = encodePreviewSiteSections(snapshot);
    const headerSocialAccounts = getHeaderSocialAccounts(customization);
    const previewAssistants = getPreviewAssistants(snapshot, language);
    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withSections = Boolean(
        sections &&
            (sections.list.length > 1 ||
                sections.list.some((section) => section.object === 'site-section-group'))
    );
    const translationSiteSpace =
        variants.translations.find((space) => space.id === snapshot.siteSpace.id) ??
        snapshot.siteSpace;

    return (
        <HeaderLayout
            withTopHeader={withTopHeader}
            searchStyle={customization.styling.search}
            leading={<StructurePreviewLogo snapshot={snapshot} />}
            search={
                <>
                    <StructurePreviewSearch />
                    {previewAssistants.map((assistant, index) => (
                        <AIChatButtonView
                            key={assistant.id}
                            icon={assistant.icon}
                            label={assistant.label}
                            withShortcut={index === 0}
                            showLabel={
                                previewAssistants.length === 1 &&
                                customization.styling.search === CustomizationSearchStyle.Prominent
                            }
                            inert
                        />
                    ))}
                </>
            }
            links={
                customization.header.links.length > 0 ||
                headerSocialAccounts.length > 0 ||
                (!withSections && variants.translations.length > 1) ? (
                    <HeaderLinks>
                        {customization.header.links.map((link, index) => (
                            <StructurePreviewHeaderLink
                                key={`${getContentRefKey(link.to)}-${index}`}
                                link={link}
                                snapshot={snapshot}
                            />
                        ))}
                        {headerSocialAccounts.length > 0 ? (
                            <div className="flex items-center gap-1">
                                {headerSocialAccounts.map((account) => {
                                    const icon = SOCIAL_PLATFORM_ICONS[account.platform];
                                    return icon ? (
                                        <Button
                                            key={`${account.platform}-${account.handle}`}
                                            iconOnly
                                            label={account.platform}
                                            icon={icon}
                                            variant="blank"
                                            size="large"
                                            className="p-2 theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link focus-visible:site-header:theme-bold:bg-header-link/3"
                                        />
                                    ) : null;
                                })}
                            </div>
                        ) : null}
                        {customization.header.links.length > 0 ||
                        headerSocialAccounts.length > 0 ? (
                            <StructurePreviewMoreMenu
                                label={tString(language, 'more')}
                                links={customization.header.links}
                                snapshot={snapshot}
                            />
                        ) : null}
                        {!withSections && variants.translations.length > 1 ? (
                            <StructurePreviewTranslationsDropdown
                                snapshot={snapshot}
                                siteSpace={translationSiteSpace}
                                siteSpaces={variants.translations}
                                className="flex! site-header:theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 focus-visible:site-header:theme-bold:bg-header-link/3 aria-expanded:site-header:theme-bold:bg-header-link/5"
                            />
                        ) : null}
                    </HeaderLinks>
                ) : null
            }
            sections={
                sections && withSections ? (
                    //TODO: figure out why enabling animations here break the rendering of what's inside the tabs
                    <SiteSectionTabs sections={sections} disableAnimations>
                        {variants.translations.length > 1 ? (
                            <StructurePreviewTranslationsDropdown
                                snapshot={snapshot}
                                siteSpace={translationSiteSpace}
                                siteSpaces={variants.translations}
                                className="my-1.5 ml-2 self-start"
                            />
                        ) : null}
                    </SiteSectionTabs>
                ) : null
            }
        />
    );
}

function StructurePreviewLogo(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const { customization } = snapshot;

    return (
        <div className={HEADER_LOGO_CONTAINER_CLASS}>
            <HeaderLogoContent
                logo={
                    customization.header.logo ? (
                        <StructurePreviewLogoImage logo={customization.header.logo} />
                    ) : null
                }
                fallbackIcon={<StructurePreviewLogoFallbackIcon snapshot={snapshot} />}
                title={snapshot.site.title}
            />
        </div>
    );
}

function StructurePreviewLogoImage(props: {
    logo: NonNullable<StructurePreviewSnapshot['customization']['header']['logo']>;
}) {
    const { logo } = props;

    return (
        <Image
            alt="Logo"
            resize={false}
            sources={{
                light: {
                    src: logo.light,
                },
                dark: logo.dark
                    ? {
                          src: logo.dark,
                      }
                    : null,
            }}
            sizes={HEADER_LOGO_IMAGE_SIZES}
            preload
            style={HEADER_LOGO_IMAGE_CLASS}
        />
    );
}

function StructurePreviewLogoFallbackIcon(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const { customization } = snapshot;

    if ('emoji' in customization.favicon && customization.favicon.emoji) {
        return <span className="text-xl">{customization.favicon.emoji}</span>;
    }

    return (
        <picture>
            <source srcSet={snapshot.icons.large.dark} media="(prefers-color-scheme: dark)" />
            <img alt="" src={snapshot.icons.large.light} className="size-8 object-contain" />
        </picture>
    );
}

function StructurePreviewSearch() {
    return <SearchHeaderInput interactive={false} />;
}

function StructurePreviewVariantSelector(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const variants = getPreviewVariants(snapshot);

    if (variants.generic.length <= 1) {
        return null;
    }

    return (
        <div className={tcls(CONTAINER_STYLE, 'has-sidebar flex flex-row')}>
            <div data-gb-table-of-contents className={getTableOfContentsClassName()}>
                <div className={getTableOfContentsSidebarClassName()}>
                    <div className={getTableOfContentsInnerHeaderClassName()}>
                        <StructurePreviewSpacesDropdown
                            snapshot={snapshot}
                            siteSpace={snapshot.siteSpace}
                            siteSpaces={variants.generic}
                            className={TABLE_OF_CONTENTS_SPACES_DROPDOWN_CLASS}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function getPreviewAssistants(
    snapshot: StructurePreviewSnapshot,
    language: ReturnType<typeof useLanguage>
) {
    if (snapshot.customization.ai?.mode !== CustomizationAIMode.Assistant) {
        return [];
    }

    return [
        {
            id: 'gitbook-assistant',
            label: getAIChatName(language, snapshot.customization.trademark.enabled),
            icon: (
                <AIChatIcon
                    state="default"
                    trademark={snapshot.customization.trademark.enabled}
                    className="size-text-lg"
                />
            ),
        },
    ];
}

function StructurePreviewHeaderLink(props: {
    snapshot: StructurePreviewSnapshot;
    link: CustomizationHeaderItem;
}) {
    const { snapshot, link } = props;
    return (
        <HeaderLinkItem
            link={link}
            locale={snapshot.locale}
            headerPreset={snapshot.customization.header.preset}
            href={link.to ? '#' : undefined}
            hasTarget={Boolean(link.to)}
            dropdownClassName={getHeaderLinkDropdownClassName(
                snapshot.customization.styling.search
            )}
        >
            {link.links?.map((subLink, index) => (
                <SubHeaderLinkItem key={index} link={subLink} locale={snapshot.locale} href="#" />
            ))}
        </HeaderLinkItem>
    );
}

function StructurePreviewMoreMenu(props: {
    snapshot: StructurePreviewSnapshot;
    links: CustomizationHeaderItem[];
    label: React.ReactNode;
}) {
    const { snapshot, links, label } = props;
    return (
        <div className={`${headerLinksStyles.linkEllipsis} z-20 items-center`}>
            <HeaderLinkMoreDropdown
                label={label}
                dropdownClassName={getHeaderLinkMoreDropdownClassName(
                    snapshot.customization.styling.search
                )}
            >
                {links.map((link, index) => (
                    <StructurePreviewMenuLink key={index} link={link} snapshot={snapshot} />
                ))}
            </HeaderLinkMoreDropdown>
        </div>
    );
}

function StructurePreviewMenuLink(props: {
    snapshot: StructurePreviewSnapshot;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { snapshot, link } = props;

    return 'links' in link && link.links.length > 0 ? (
        <HeaderLinkSubMenu link={link} locale={snapshot.locale}>
            {link.links.map((subLink, index) => (
                <StructurePreviewMenuLink key={index} link={subLink} snapshot={snapshot} />
            ))}
        </HeaderLinkSubMenu>
    ) : (
        <HeaderLinkMenuItem link={link} locale={snapshot.locale} href={link.to ? '#' : undefined} />
    );
}

function StructurePreviewTranslationsDropdown(props: {
    snapshot: StructurePreviewSnapshot;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
}) {
    const { snapshot, siteSpace, siteSpaces, className } = props;
    const title = getSpacesDropdownTitle(siteSpace, snapshot.locale);

    return (
        <StructurePreviewSpacesDropdown
            snapshot={snapshot}
            siteSpace={siteSpace}
            siteSpaces={siteSpaces}
            icon="globe"
            variant="blank"
            className={getTranslationsDropdownClassName({ title, className })}
        />
    );
}

function StructurePreviewSpacesDropdown(props: {
    snapshot: StructurePreviewSnapshot;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: ButtonProps['className'];
    icon?: IconName;
    variant?: ButtonProps['variant'];
}) {
    const { snapshot, siteSpace, siteSpaces, className, icon, variant = 'secondary' } = props;
    const title = getSpacesDropdownTitle(siteSpace, snapshot.locale);
    const slimSpaces = getSlimSiteSpaces({
        siteSpace,
        siteSpaces,
        currentLanguage: snapshot.locale,
        getURL: () => '',
    });

    return (
        <SpacesDropdownClient
            title={title}
            icon={icon}
            variant={variant}
            className={className}
            dropdownClassName={getSpacesDropdownMenuClassName()}
            slimSpaces={slimSpaces}
            curPath={siteSpace.path}
            clickable={false}
        />
    );
}
