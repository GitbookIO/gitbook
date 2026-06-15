'use client';

import type { CustomizationContentLink, CustomizationHeaderItem, SiteSpace } from '@gitbook/api';
import { CustomizationHeaderPreset, CustomizationSearchStyle } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import * as React from 'react';

import { HeaderMobileMenu } from '@/components/Header/HeaderMobileMenu';
import { SiteSectionTabs } from '@/components/SiteSections';
import { PagesList } from '@/components/TableOfContents/PagesList';
import { getLocalizedTitle } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';

import { tString, useLanguage } from '@/intl/client';
import headerLinksStyles from '../Header/headerLinks.module.css';
import { CONTAINER_STYLE, HEADER_HEIGHT_DESKTOP } from '../layout';
import { Button, ToggleChevron } from '../primitives';
import { DropdownMenu, DropdownMenuItem, DropdownSubMenu } from '../primitives/DropdownMenu';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SideSheet } from '../primitives/SideSheet';
import {
    SOCIAL_PLATFORM_ICONS,
    encodePreviewSiteSections,
    encodePreviewTableOfContents,
    getContentRefKey,
    getHeaderSocialAccounts,
    getPreviewVariants,
    getStructurePreviewViewportMode,
    isStructurePreviewMessage,
} from './state';
import type { StructurePreviewSnapshot, StructurePreviewViewportMode } from './types';

export function StructurePreview(props: { initialSnapshot: StructurePreviewSnapshot }) {
    const { initialSnapshot } = props;
    const [snapshot, setSnapshot] = React.useState(initialSnapshot);
    const [localMode, setLocalMode] = React.useState<StructurePreviewViewportMode>(
        getStructurePreviewViewportMode(initialSnapshot.viewportMode)
    );

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent<unknown>) => {
            if (event.source !== window.parent || !isStructurePreviewMessage(event.data)) {
                return;
            }

            setSnapshot(event.data.payload);
            setLocalMode(getStructurePreviewViewportMode(event.data.payload.viewportMode));
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const mode = getStructurePreviewViewportMode(localMode);

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
            data-viewport-mode={mode}
            className={tcls(
                'site-background min-h-screen overflow-hidden',
                mode === 'mobile' ? 'mx-auto max-w-[420px]' : null,
                mode === 'desktop' ? 'min-w-[1024px]' : null
            )}
            onClickCapture={preventNavigation}
            onAuxClickCapture={preventNavigation}
        >
            <StructurePreviewModeToggle mode={mode} onModeChange={setLocalMode} />
            <StructurePreviewHeader snapshot={snapshot} viewportMode={mode} />
            <StructurePreviewMobileNavigation snapshot={snapshot} />
        </div>
    );
}

function StructurePreviewModeToggle(props: {
    mode: StructurePreviewViewportMode;
    onModeChange: (mode: StructurePreviewViewportMode) => void;
}) {
    const { mode, onModeChange } = props;
    return (
        <div className="fixed top-2 right-2 z-50 flex rounded-md border border-tint-subtle bg-tint-base/9 p-0.5 text-xs shadow-sm backdrop-blur">
            {(['auto', 'desktop', 'mobile'] as const).map((nextMode) => (
                <button
                    key={nextMode}
                    type="button"
                    className={tcls(
                        'rounded-sm px-2 py-1 text-tint capitalize transition-colors hover:bg-tint-hover',
                        mode === nextMode ? 'bg-primary-active text-primary-strong' : null
                    )}
                    onClick={() => onModeChange(nextMode)}
                >
                    {nextMode}
                </button>
            ))}
        </div>
    );
}

function StructurePreviewHeader(props: {
    snapshot: StructurePreviewSnapshot;
    viewportMode: StructurePreviewViewportMode;
}) {
    const { snapshot, viewportMode } = props;
    const { customization } = snapshot;
    const language = useLanguage();
    const variants = getPreviewVariants(snapshot);
    const sections = encodePreviewSiteSections(snapshot);
    const headerSocialAccounts = getHeaderSocialAccounts(customization);
    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withSections = Boolean(
        sections &&
            (sections.list.length > 1 ||
                sections.list.some((section) => section.object === 'site-section-group'))
    );
    const forceMobile = viewportMode === 'mobile';
    const forceDesktop = viewportMode === 'desktop';

    return (
        <header
            data-gb-site-header
            className={tcls(
                'flex',
                'flex-col',
                `h-[${HEADER_HEIGHT_DESKTOP}px]`,
                'sticky',
                'top-0',
                'pt-[env(safe-area-inset-top)]',
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
                    'site-header:theme-bold:bg-header-background',
                    'site-header:theme-bold:shadow-[0px_1px_0px]',
                    'site-header:theme-bold:shadow-tint-12/2'
                )}
            >
                <div>
                    <div
                        data-gb-header-content
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
                                    'site-header:theme-bold:text-header-link',
                                    'hover:bg-tint-hover',
                                    'hover:site-header:theme-bold:bg-header-link/3',
                                    forceDesktop ? 'hidden' : forceMobile ? 'flex' : 'lg:hidden'
                                )}
                            />
                            <StructurePreviewLogo snapshot={snapshot} />
                        </div>

                        <div
                            className={tcls(
                                'flex',
                                'grow-0',
                                'shrink-0',
                                'md:@2xl:basis-56',
                                'justify-self-end',
                                'items-center',
                                'gap-2',
                                'search' in customization.styling &&
                                    customization.styling.search === 'prominent'
                                    ? [
                                          'md:@2xl:grow-[0.8]',
                                          'md:@4xl:basis-40',
                                          'md:@2xl:max-w-[50%]',
                                          'md:@4xl:max-w-lg',
                                          'md:@2xl:mr-auto',
                                          'order-last',
                                          'md:@2xl:order-[unset]',
                                      ]
                                    : ['order-last']
                            )}
                        >
                            <StructurePreviewSearch
                                style={customization.styling.search}
                                mobile={forceMobile}
                            />
                        </div>

                        {(customization.header.links.length > 0 ||
                            headerSocialAccounts.length > 0 ||
                            (!withSections && variants.translations.length > 1)) &&
                        !forceMobile ? (
                            <div
                                className={tcls(
                                    headerLinksStyles.containerHeaderlinks,
                                    '@4xl:[&>.button+.button]:-ml-2 z-20 ml-auto flex min-w-9 shrink grow @7xl:grow-0 items-center justify-end @4xl:gap-x-6 gap-x-4',
                                    forceMobile ? 'hidden' : null
                                )}
                            >
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
                                    <StructurePreviewSpacesDropdown
                                        snapshot={snapshot}
                                        siteSpace={snapshot.siteSpace}
                                        siteSpaces={variants.translations}
                                        icon="globe"
                                        variant="blank"
                                        className="flex! site-header:theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 focus-visible:site-header:theme-bold:bg-header-link/3 aria-expanded:site-header:theme-bold:bg-header-link/5"
                                    />
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {sections && withSections && !forceMobile ? (
                <div>
                    <SiteSectionTabs sections={sections}>
                        {variants.translations.length > 1 ? (
                            <StructurePreviewSpacesDropdown
                                snapshot={snapshot}
                                siteSpace={snapshot.siteSpace}
                                siteSpaces={variants.translations}
                                icon="globe"
                                variant="blank"
                                className="my-1.5 ml-2 self-start"
                            />
                        ) : null}
                    </SiteSectionTabs>
                </div>
            ) : null}
        </header>
    );
}

function StructurePreviewLogo(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const { customization } = snapshot;

    return (
        <div className={tcls('group/headerlogo', 'min-w-0', 'shrink', 'flex', 'items-center')}>
            {customization.header.logo ? (
                <picture>
                    {customization.header.logo.dark ? (
                        <source
                            srcSet={customization.header.logo.dark}
                            media="(prefers-color-scheme: dark)"
                        />
                    ) : null}
                    <img
                        alt="Logo"
                        src={customization.header.logo.light}
                        className={tcls(
                            'block overflow-hidden',
                            'shrink',
                            'min-w-0',
                            'max-w-40',
                            'lg:max-w-64',
                            'max-h-8',
                            'h-full',
                            'w-full',
                            'object-contain',
                            'object-left'
                        )}
                    />
                </picture>
            ) : (
                <>
                    {'emoji' in customization.favicon && customization.favicon.emoji ? (
                        <span className="text-xl">{customization.favicon.emoji}</span>
                    ) : (
                        <picture>
                            <source
                                srcSet={snapshot.icons.large.dark}
                                media="(prefers-color-scheme: dark)"
                            />
                            <img
                                alt=""
                                src={snapshot.icons.large.light}
                                className="size-8 object-contain"
                            />
                        </picture>
                    )}
                    <div
                        className={tcls(
                            'text-pretty',
                            'line-clamp-2',
                            'tracking-tight',
                            'max-w-[18ch]',
                            'lg:max-w-[24ch]',
                            'font-semibold',
                            'ms-3',
                            'text-base/tight',
                            'lg:text-lg/tight',
                            'text-tint-strong',
                            'theme-bold:text-header-link'
                        )}
                    >
                        {snapshot.site.title}
                    </div>
                </>
            )}
        </div>
    );
}

function StructurePreviewSearch(props: { style: CustomizationSearchStyle; mobile: boolean }) {
    const language = useLanguage();
    const label = tString(language, 'search');

    if (props.mobile) {
        return <Button icon="search" variant="header" size="medium" iconOnly label={label} />;
    }

    if (props.style === CustomizationSearchStyle.Prominent) {
        return (
            <div className="flex min-h-10 w-full items-center gap-2 rounded-md border border-tint-subtle bg-tint-base px-3 text-tint">
                <Icon icon="search" className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
            </div>
        );
    }

    return <Button icon="search" variant="header" size="medium" label={label} />;
}

function StructurePreviewHeaderLink(props: {
    snapshot: StructurePreviewSnapshot;
    link: CustomizationHeaderItem;
}) {
    const { snapshot, link } = props;
    const title = getLocalizedTitle(link, snapshot.locale);
    const linkStyle = link.style ?? 'link';

    if (link.links && link.links.length > 0) {
        return (
            <DropdownMenu
                openOnHover
                className={
                    snapshot.customization.styling.search === 'prominent'
                        ? 'right-0 left-auto'
                        : null
                }
                button={
                    <StructurePreviewHeaderLinkButton
                        title={title}
                        linkStyle={linkStyle}
                        headerPreset={snapshot.customization.header.preset}
                        trailing={<ToggleChevron />}
                    />
                }
            >
                {link.links.map((subLink, index) => (
                    <StructurePreviewMenuLink key={index} link={subLink} snapshot={snapshot} />
                ))}
            </DropdownMenu>
        );
    }

    if (!link.to) {
        return null;
    }

    return (
        <StructurePreviewHeaderLinkButton
            title={title}
            linkStyle={linkStyle}
            headerPreset={snapshot.customization.header.preset}
        />
    );
}

function StructurePreviewHeaderLinkButton(props: {
    title: string;
    linkStyle: 'link' | 'button-secondary' | 'button-primary';
    headerPreset: CustomizationHeaderPreset;
    trailing?: React.ReactNode;
}) {
    const { title, linkStyle, trailing } = props;

    if (linkStyle === 'button-primary' || linkStyle === 'button-secondary') {
        return (
            <Button
                variant={linkStyle === 'button-primary' ? 'primary' : 'header'}
                size="medium"
                label={title}
                trailing={trailing}
            />
        );
    }

    return (
        <button
            type="button"
            className={tcls(
                'flex items-center gap-1',
                'shrink',
                'contrast-more:underline',
                'truncate',
                'text-tint',
                'links-default:hover:text-primary',
                'links-default:tint:hover:text-tint-strong',
                'underline-offset-2',
                'links-accent:hover:underline',
                'links-accent:underline-offset-4',
                'links-accent:decoration-primary-subtle',
                'links-accent:decoration-[3px]',
                'links-accent:py-0.5',
                'theme-bold:text-header-link',
                'hover:theme-bold:text-header-link/7!'
            )}
        >
            {title}
            {trailing}
        </button>
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
            <DropdownMenu
                openOnHover
                className={tcls(
                    'max-md:right-0 max-md:left-auto',
                    snapshot.customization.styling.search === 'prominent' && 'right-0 left-auto'
                )}
                button={
                    <button
                        type="button"
                        className={tcls(
                            'text-tint',
                            'hover:text-primary',
                            'dark:hover:text-primary',
                            'theme-bold:text-header-link',
                            'theme-bold:hover:text-header-link/8',
                            'flex',
                            'gap-1',
                            'items-center'
                        )}
                    >
                        <span className="sr-only">{label}</span>
                        <Icon icon="ellipsis" className="size-4" />
                        <ToggleChevron />
                    </button>
                }
            >
                {links.map((link, index) => (
                    <StructurePreviewMenuLink key={index} link={link} snapshot={snapshot} />
                ))}
            </DropdownMenu>
        </div>
    );
}

function StructurePreviewMenuLink(props: {
    snapshot: StructurePreviewSnapshot;
    link: CustomizationHeaderItem | CustomizationContentLink;
}) {
    const { snapshot, link } = props;
    const title = getLocalizedTitle(link, snapshot.locale);

    return 'links' in link && link.links.length > 0 ? (
        <DropdownSubMenu label={title}>
            {link.links.map((subLink, index) => (
                <StructurePreviewMenuLink key={index} link={subLink} snapshot={snapshot} />
            ))}
        </DropdownSubMenu>
    ) : (
        <DropdownMenuItem>{title}</DropdownMenuItem>
    );
}

function StructurePreviewSpacesDropdown(props: {
    snapshot: StructurePreviewSnapshot;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
    variant?: React.ComponentProps<typeof Button>['variant'];
    icon?: IconName;
}) {
    const { snapshot, siteSpace, siteSpaces, className, variant = 'secondary', icon } = props;
    const title = getLocalizedTitle(siteSpace, snapshot.locale);

    return (
        <DropdownMenu
            className={tcls(
                'group-hover/dropdown:invisible',
                'group-focus-within/dropdown:group-hover/dropdown:visible'
            )}
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
            {siteSpaces.map((space) => (
                <DropdownMenuItem key={space.id} active={space.id === siteSpace.id}>
                    {getLocalizedTitle(space, snapshot.locale)}
                </DropdownMenuItem>
            ))}
        </DropdownMenu>
    );
}

function StructurePreviewMobileNavigation(props: { snapshot: StructurePreviewSnapshot }) {
    const { snapshot } = props;
    const pages = React.useMemo(() => encodePreviewTableOfContents(snapshot), [snapshot]);
    const variants = getPreviewVariants(snapshot);

    return (
        <SideSheet
            side="left"
            data-testid="table-of-contents"
            data-gb-table-of-contents
            toggleClass="navigation-open"
            withOverlay={true}
            withCloseButton={true}
            className={tcls(
                'group/table-of-contents',
                'text-sm',
                'grow-0',
                'shrink-0',
                'w-4/5',
                'md:w-1/2',
                'lg:w-72',
                'max-lg:not-sidebar-filled:bg-tint-base',
                'max-lg:not-sidebar-filled:border-r',
                'border-tint-subtle',
                'pt-6 pb-4',
                'supports-[-webkit-touch-callout]:pb-[env(safe-area-inset-bottom)]',
                'max-lg:pl-8',
                'flex',
                'flex-col',
                'min-h-0',
                'gap-4'
            )}
        >
            <div className="flex grow-0 items-center pr-4 text-base/tight">
                <StructurePreviewLogo snapshot={snapshot} />
                {variants.translations.length > 1 ? (
                    <StructurePreviewSpacesDropdown
                        snapshot={snapshot}
                        siteSpace={snapshot.siteSpace}
                        siteSpaces={variants.translations}
                        icon="globe"
                        variant="blank"
                        className="[&_.button-leading-icon]:block! ml-auto py-2 [&_.button-content]:hidden"
                    />
                ) : null}
            </div>
            <div
                className={tcls(
                    '-ms-5',
                    'relative flex min-h-0 grow flex-col border-tint-subtle',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-gradient_&]:border',
                    'max-lg:sidebar-filled:border',
                    'sidebar-filled:rounded-2xl',
                    'straight-corners:rounded-none'
                )}
            >
                <ScrollContainer
                    data-testid="toc-scroll-container"
                    orientation="vertical"
                    contentClassName="flex flex-col p-2 gutter-stable"
                    active="[data-active=true]"
                    leading={{
                        fade: true,
                        button: {
                            className: '-mt-4',
                        },
                    }}
                >
                    <PagesList
                        pages={pages}
                        isRoot={true}
                        style="grow border-tint-subtle sidebar-list-line:border-l"
                    />
                </ScrollContainer>
            </div>
        </SideSheet>
    );
}
