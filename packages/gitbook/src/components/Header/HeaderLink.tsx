import {
    type ContentRef,
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    type CustomizationHeaderPreset,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import assertNever from 'assert-never';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Button, Link } from '../primitives';
import {
    Dropdown,
    type DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';

export async function HeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem;
}) {
    const { context, link } = props;
    const { customization } = context;

    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const headerPreset = customization.header.preset;
    const linkStyle = link.style ?? 'link';

    if (link.links && link.links.length > 0) {
        return (
            <Dropdown
                className={`shrink ${customization.styling.search === 'prominent' ? 'right-0 left-auto' : null}`}
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
    }
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
                        'theme-bold:bg-header-link theme-bold:text-header-background theme-bold:shadow-none theme-bold:hover:bg-header-link theme-bold:hover:text-header-background theme-bold:hover:shadow-none',
                    'button-secondary': tcls(
                        'theme-bold:bg-header-link/2 theme-gradient:bg-tint-base theme-muted:bg-tint-base theme-bold:text-header-link theme-bold:shadow-none theme-bold:ring-header-link/4 theme-bold:hover:bg-header-link/3 theme-bold:hover:text-header-link theme-bold:hover:shadow-none theme-bold:hover:ring-header-link/5 theme-bold:contrast-more:bg-header-background theme-bold:contrast-more:text-header-link theme-bold:contrast-more:ring-header-link theme-bold:contrast-more:hover:ring-header-link'
                    ),
                }[linkStyle]
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

function getHeaderLinkClassName(_props: { headerPreset: CustomizationHeaderPreset }) {
    return tcls(
        'flex items-center',
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
        'links-accent:py-0.5', // Prevent underline from being cut off at the bottom

        'theme-bold:text-header-link',
        'theme-bold:hover:text-header-link'
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
            {title}
            {isDropdown ? <DropdownChevron /> : null}
        </Link>
    );
}

function HeaderItemDropdown(
    props: {
        headerPreset: CustomizationHeaderPreset;
        title: string;
    } & DropdownButtonProps<HTMLElement>
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
    context: GitBookSiteContext;
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
