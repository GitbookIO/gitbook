import {
    CustomizationContentLink,
    CustomizationSettings,
    CustomizationHeaderPreset,
    SiteCustomizationSettings,
    CustomizationHeaderItem,
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
                    if (!target) {
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

    if (!target) {
        return null;
    }

    return (
        <HeaderLinkNavItem
            linkStyle={linkStyle}
            headerPreset={headerPreset}
            title={link.title}
            isDropdown={false}
            href={target.href}
        />
    );
}

export type HeaderLinkNavItemProps = {
    linkStyle: NonNullable<CustomizationHeaderItem['style']>;
    headerPreset: CustomizationHeaderPreset;
    title: string;
    href: string;
    isDropdown: boolean;
} & DropdownButtonProps<HTMLElement>;

function HeaderLinkNavItem(props: HeaderLinkNavItemProps) {
    switch (props.linkStyle) {
        case 'button-secondary':
        case 'button-primary':
            return <HeaderItemButton {...props} linkStyle={props.linkStyle} />;
        case 'link':
            return <HeaderItemLink {...props} />;
        default:
            assertNever(props.linkStyle);
    }
}

function HeaderItemButton(
    props: Omit<HeaderLinkNavItemProps, 'linkStyle'> & {
        linkStyle: 'button-secondary' | 'button-primary';
    },
) {
    const { linkStyle, headerPreset, title, href, isDropdown, ...rest } = props;
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
                        headerPreset === CustomizationHeaderPreset.Custom ||
                        headerPreset === CustomizationHeaderPreset.Bold
                            ? tcls(
                                  'bg-header-link-500 hover:bg-text-header-link-300 text-header-button-text',
                                  'dark:bg-header-link-500 dark:hover:bg-text-header-link-300 dark:text-header-button-text',
                              )
                            : null,
                    'button-secondary': tcls(
                        'bg:transparent hover:bg-transparent',
                        'dark:bg-transparent dark:hover:bg-transparent',
                        'ring-header-link-500 hover:ring-header-link-300 text-header-link-500',
                        'dark:ring-header-link-500 dark:hover:ring-header-link-300 dark:text-header-link-500',
                    ),
                }[linkStyle],
            )}
            {...rest}
        >
            {title}
        </Button>
    );
}

function getHeaderLinkClassName(props: { headerPreset: CustomizationHeaderPreset }) {
    return tcls(
        'flex items-center shrink',
        'hover:text-header-link-400 dark:hover:text-light',
        'min-w-0',

        props.headerPreset === CustomizationHeaderPreset.Default
            ? ['text-dark/8', 'dark:text-light/8']
            : ['text-header-link-500 hover:text-header-link-400'],
    );
}

function HeaderItemLink(props: HeaderLinkNavItemProps) {
    const { headerPreset, title, isDropdown, href, ...rest } = props;
    return (
        <Link href={href} className={getHeaderLinkClassName({ headerPreset })} {...rest}>
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

    return <DropdownMenuItem href={target.href}>{link.title}</DropdownMenuItem>;
}
