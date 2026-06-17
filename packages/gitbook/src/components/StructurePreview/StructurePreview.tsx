'use client';

import type { ContentRef, CustomizationContentLink, CustomizationHeaderItem } from '@gitbook/api';
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
import {
    getSpacesDropdownMenuClassName,
    getTranslationsDropdownClassName,
} from '../Header/SpacesDropdownData';
import headerLinksStyles from '../Header/headerLinks.module.css';
import { SearchHeaderInput } from '../Search';
import { CONTAINER_STYLE, CONTENT_STYLE } from '../layout';
import {
    Button,
    type ButtonProps,
    SkeletonHeading,
    SkeletonImage,
    SkeletonParagraph,
    ToggleChevron,
} from '../primitives';
import { DropdownMenu, DropdownMenuItem } from '../primitives/DropdownMenu';
import {
    SOCIAL_PLATFORM_ICONS,
    isStructurePreviewMessage,
    selectStructurePreviewSection,
} from './state';
import type {
    PreviewContentLink,
    PreviewDropdownSpace,
    PreviewHeaderLink,
    StructurePreviewNavigationMessage,
    StructurePreviewSnapshot,
} from './types';

const PREVIEW_CONTENT_REF = {
    kind: 'url',
    url: '#',
} as ContentRef;

export function StructurePreview(props: { initialSnapshot: StructurePreviewSnapshot }) {
    const { initialSnapshot } = props;
    const [snapshot, setSnapshot] = React.useState(initialSnapshot);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent<unknown>) => {
            if (event.source !== window.parent || !isStructurePreviewMessage(event.data)) {
                return;
            }

            const message = event.data;
            setSnapshot((currentSnapshot) => ({
                ...currentSnapshot,
                ...message.payload,
            }));
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const postNavigationChange = (sectionId: string) => {
        const message: StructurePreviewNavigationMessage = {
            type: 'gitbook.structure.navigate',
            payload: { sectionId },
        };

        window.parent.postMessage(message, window.location.origin);
    };

    const preventNavigation = (event: React.MouseEvent<HTMLElement>) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return null;
        }

        const anchor = target.closest('a');
        if (!anchor) {
            return null;
        }

        event.preventDefault();
        event.stopPropagation();

        return anchor;
    };

    const fakeSectionNavigation = (event: React.MouseEvent<HTMLElement>) => {
        const anchor = preventNavigation(event);
        const sectionId = anchor?.getAttribute('data-gb-site-section-id');
        if (!sectionId) {
            return;
        }

        setSnapshot((currentSnapshot) => {
            const nextSnapshot = selectStructurePreviewSection(currentSnapshot, sectionId);
            if (nextSnapshot !== currentSnapshot) {
                postNavigationChange(sectionId);
            }

            return nextSnapshot;
        });
    };

    return (
        <div
            data-gb-structure-preview
            data-viewport-mode="desktop"
            onClickCapture={fakeSectionNavigation}
            onAuxClickCapture={preventNavigation}
        >
            <StructurePreviewHeader snapshot={snapshot} />
            <div className={tcls('flex gap-8', CONTAINER_STYLE)}>
                <StructurePreviewVariantSelector snapshot={snapshot} />
                <div className={tcls('my-8 flex min-w-xl grow flex-col gap-8', CONTENT_STYLE)}>
                    <SkeletonHeading animated={false} />
                    <SkeletonParagraph lines={4} animated={false} />
                    <SkeletonParagraph lines={5} animated={false} start={4} />
                    <SkeletonImage animated={false} />
                    <SkeletonParagraph lines={3} animated={false} start={9} />
                    <SkeletonParagraph lines={2} animated={false} start={12} />
                </div>
            </div>
        </div>
    );
}

function StructurePreviewHeader(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const { customization } = snapshot;
    const language = useLanguage();
    const { variants, sections } = snapshot;
    const headerSocialAccounts = customization.socialAccounts;
    const previewAssistants = getPreviewAssistants(snapshot, language);
    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withSections = Boolean(
        sections &&
            (sections.list.length > 1 ||
                sections.list.some((section) => section.object === 'site-section-group'))
    );

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
                                key={`${link.title}-${index}`}
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
    const { variants } = snapshot;

    return (
        <div data-gb-table-of-contents className={tcls(getTableOfContentsClassName(), 'max-w-xs')}>
            <div className={getTableOfContentsSidebarClassName()}>
                {variants.generic.length > 1 ? (
                    <div className={getTableOfContentsInnerHeaderClassName()}>
                        <StructurePreviewSpacesDropdown
                            title={snapshot.siteSpace.title}
                            siteSpaces={variants.generic}
                            className={TABLE_OF_CONTENTS_SPACES_DROPDOWN_CLASS}
                        />
                    </div>
                ) : null}
                <div className="ml-5 flex flex-col gap-6">
                    {Array.from({ length: 4 }).map((_, group) => (
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: [3, 5, 4, 3][group] ?? 0 }).map((_, index) => (
                                <SkeletonParagraph
                                    key={index}
                                    start={group * 5 + index}
                                    lines={1}
                                    animated={false}
                                />
                            ))}
                        </div>
                    ))}
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
    link: PreviewHeaderLink;
}) {
    const { snapshot, link } = props;
    const headerLink = toCustomizationHeaderItem(link);

    return (
        <HeaderLinkItem
            link={headerLink}
            locale={snapshot.locale}
            headerPreset={snapshot.customization.header.preset}
            href={link.hasTarget ? '#' : undefined}
            hasTarget={link.hasTarget}
            dropdownClassName={getHeaderLinkDropdownClassName(
                snapshot.customization.styling.search
            )}
        >
            {link.links.map((subLink, index) => (
                <SubHeaderLinkItem
                    key={index}
                    link={toCustomizationContentLink(subLink)}
                    locale={snapshot.locale}
                    href="#"
                />
            ))}
        </HeaderLinkItem>
    );
}

function StructurePreviewMoreMenu(props: {
    snapshot: StructurePreviewSnapshot;
    links: PreviewHeaderLink[];
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
    link: PreviewHeaderLink | PreviewContentLink;
}) {
    const { snapshot, link } = props;

    return isPreviewHeaderLink(link) && link.links.length > 0 ? (
        <HeaderLinkSubMenu link={toCustomizationHeaderItem(link)} locale={snapshot.locale}>
            {link.links.map((subLink, index) => (
                <StructurePreviewMenuLink key={index} link={subLink} snapshot={snapshot} />
            ))}
        </HeaderLinkSubMenu>
    ) : (
        <HeaderLinkMenuItem
            link={
                isPreviewHeaderLink(link)
                    ? toCustomizationHeaderItem(link)
                    : toCustomizationContentLink(link)
            }
            locale={snapshot.locale}
            href={link.hasTarget ? '#' : undefined}
        />
    );
}

function isPreviewHeaderLink(
    link: PreviewHeaderLink | PreviewContentLink
): link is PreviewHeaderLink {
    return 'links' in link;
}

function toCustomizationHeaderItem(link: PreviewHeaderLink): CustomizationHeaderItem {
    return {
        title: link.title,
        style: link.style,
        to: link.hasTarget ? PREVIEW_CONTENT_REF : null,
        links: link.links.map(toCustomizationContentLink),
    } as CustomizationHeaderItem;
}

function toCustomizationContentLink(link: PreviewContentLink): CustomizationContentLink {
    return {
        title: link.title,
        to: link.hasTarget ? PREVIEW_CONTENT_REF : undefined,
    } as CustomizationContentLink;
}

function StructurePreviewTranslationsDropdown(props: {
    siteSpaces: PreviewDropdownSpace[];
    className?: string;
}) {
    const { siteSpaces, className } = props;
    const title = siteSpaces.find((siteSpace) => siteSpace.isActive)?.title ?? siteSpaces[0]?.title;

    if (!title) {
        return null;
    }

    return (
        <StructurePreviewSpacesDropdown
            title={title}
            siteSpaces={siteSpaces}
            icon="globe"
            variant="blank"
            className={getTranslationsDropdownClassName({ title, className })}
        />
    );
}

function StructurePreviewSpacesDropdown(props: {
    title: string;
    siteSpaces: PreviewDropdownSpace[];
    className?: ButtonProps['className'];
    icon?: IconName;
    variant?: ButtonProps['variant'];
}) {
    const { title, siteSpaces, className, icon, variant = 'secondary' } = props;

    return (
        <DropdownMenu
            className={getSpacesDropdownMenuClassName()}
            button={
                <Button
                    icon={icon}
                    data-testid="space-dropdown-button"
                    size="small"
                    variant={variant}
                    trailing={<ToggleChevron />}
                    className={tcls('bg-tint-base', className)}
                >
                    <span className="button-content">{title}</span>
                </Button>
            }
        >
            {siteSpaces.map((siteSpace) => (
                <DropdownMenuItem key={siteSpace.id} active={siteSpace.isActive}>
                    {siteSpace.title}
                </DropdownMenuItem>
            ))}
        </DropdownMenu>
    );
}
