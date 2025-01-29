import {
    CustomizationContentLink,
    CustomizationSettings,
    CustomizationHeaderPreset,
    SiteCustomizationSettings,
    CustomizationHeaderItem,
    ContentRef,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import {
    Dropdown,
    DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';
import { Button, Link } from '../primitives';

export async function HeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationHeaderItem;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { context, link, customization } = props;

    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const headerPreset = customization.header.preset;
    const linkStyle = link.style ?? 'link';

    if (link.links && link.links.length > 0) {
        return (
            <Dropdown
                className="shrink"
                button={(buttonProps) => {
                    if (!target || !link.to) {
                        return (
                            <HeaderItemDropdown
                                {...buttonProps}
                                headerPreset={headerPreset}
                                title={link.title}
                            />
                        );
                    }
                    return (
                        <HeaderLinkNavItem
                            {...buttonProps}
                            linkTarget={link.to}
                            linkStyle={linkStyle}
                            headerPreset={headerPreset}
                            title={link.title}
                            isDropdown
                            href={target?.href}
                        />
                    );
                }}
            >
                <DropdownMenu>
                    {link.links.map((subLink, index) => (
                        <SubHeaderLink key={index} {...props} link={subLink} />
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    if (!target || !link.to) {
        return null;
    }

    return (
        <HeaderLinkNavItem
            linkTarget={link.to}
            linkStyle={linkStyle}
            headerPreset={headerPreset}
            title={link.title}
            isDropdown={false}
            href={target.href}
        />
    );
}

export type HeaderLinkNavItemProps = {
    linkTarget: ContentRef;
    linkStyle: NonNullable<CustomizationHeaderItem['style']>;
    headerPreset: CustomizationHeaderPreset;
    title: string;
    href: string;
    isDropdown: boolean;
} & DropdownButtonProps<HTMLElement>;

function HeaderLinkNavItem(props: HeaderLinkNavItemProps) {
    const { linkStyle, ...rest } = props;
    switch (linkStyle) {
        case 'button-secondary':
        case 'button-primary':
            return <HeaderItemButton {...rest} linkStyle={linkStyle} />;
        case 'link':
            return <HeaderItemLink {...rest} />;
        default:
            assertNever(linkStyle);
    }
}

function HeaderItemButton(
    props: Omit<HeaderLinkNavItemProps, 'linkStyle'> & {
        linkStyle: 'button-secondary' | 'button-primary';
    },
) {
    const { linkTarget, linkStyle, headerPreset, title, href, isDropdown, ...rest } = props;
    const variant = (() => {
        switch (linkStyle) {
            case 'button-secondary':
                return 'secondary';
            case 'button-primary':
                return 'primary';
            default:
                assertNever(linkStyle);
        }
    })();
    return (
        <Button
            href={href}
            variant={variant}
            size="medium"
            className={tcls(
                {
                    'button-primary':
                        headerPreset != CustomizationHeaderPreset.Default &&
                        `bg-header-link dark:bg-header-link hover:bg-header-link dark:hover:bg-header-link
                        text-header-background dark:text-header-background hover:text-header-background dark:hover:text-header-background
                        shadow-none hover:shadow-none`,
                    'button-secondary': tcls(
                        headerPreset != CustomizationHeaderPreset.Default &&
                            `bg-header-link/2 dark:bg-header-link/2 hover:bg-header-link/3 dark:hover:bg-header-link/3 
                            text-header-link dark:text-header-link hover:text-header-link dark:hover:text-header-link
                            ring-header-link/4 dark:ring-header-link/4 hover:ring-header-link/5 dark:hover:ring-header-link/5
                            contrast-more:ring-header-link contrast-more:bg-header-background contrast-more:text-header-link contrast-more:hover:ring-header-link
                            shadow-none hover:shadow-none`,
                    ),
                }[linkStyle],
            )}
            insights={{
                type: 'link_click',
                link: {
                    target: linkTarget,
                    position: SiteInsightsLinkPosition.Header,
                },
            }}
            {...rest}
        >
            {title}
        </Button>
    );
}

function getHeaderLinkClassName(props: { headerPreset: CustomizationHeaderPreset }) {
    return tcls(
        'flex items-center shrink',
        'hover:text-header-link-400',
        'min-w-0',
        'contrast-more:underline',

        props.headerPreset === CustomizationHeaderPreset.Default
            ? ['text-gray']
            : ['text-header-link-500 hover:text-header-link-400'],
    );
}

function HeaderItemLink(props: Omit<HeaderLinkNavItemProps, 'linkStyle'>) {
    const { linkTarget, headerPreset, title, isDropdown, href, ...rest } = props;
    return (
        <Link
            href={href}
            className={getHeaderLinkClassName({ headerPreset })}
            insights={{
                type: 'link_click',
                link: {
                    target: linkTarget,
                    position: SiteInsightsLinkPosition.Header,
                },
            }}
            {...rest}
        >
            <span className="truncate min-w-0">{title}</span>
            {isDropdown ? <DropdownChevron /> : null}
        </Link>
    );
}

function HeaderItemDropdown(
    props: {
        headerPreset: CustomizationHeaderPreset;
        title: string;
    } & DropdownButtonProps<HTMLElement>,
) {
    const { headerPreset, title, ...rest } = props;
    return (
        <span
            className={tcls(getHeaderLinkClassName({ headerPreset }), 'cursor-default')}
            {...rest}
        >
            {title}
            <DropdownChevron />
        </span>
    );
}

async function SubHeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    return (
        <DropdownMenuItem
            href={target.href}
            insights={{
                type: 'link_click',
                link: {
                    target: link.to,
                    position: SiteInsightsLinkPosition.Header,
                },
            }}
        >
            {link.title}
        </DropdownMenuItem>
    );
}
