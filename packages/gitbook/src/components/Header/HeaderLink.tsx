import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import {
    type ContentRef,
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    type CustomizationHeaderPreset,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import assertNever from 'assert-never';
import type React from 'react';

import { resolveContentRef } from '@/lib/references';
import { getLocalizedTitle } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';
import {
    SiteAuthLoginButton,
    SiteAuthLoginDropdownMenuItem,
    SiteAuthLoginLink,
} from '../SiteAuth/SiteAuthLoginLink';
import { Button, Link, ToggleChevron } from '../primitives';
import {
    type DropdownButtonProps,
    DropdownMenu,
    DropdownMenuItem,
} from '../primitives/DropdownMenu';

export async function HeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem;
}) {
    const { context, link } = props;
    const { customization } = context;

    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const headerPreset = customization.header.preset;
    const linkStyle = link.style ?? 'link';
    const title = getLocalizedTitle(link, context.locale);

    if (link.links && link.links.length > 0) {
        return (
            <DropdownMenu
                className={`shrink ${customization.styling.search === 'prominent' ? 'right-0 left-auto' : null}`}
                button={
                    !target || !link.to ? (
                        <HeaderItemDropdown headerPreset={headerPreset} title={title} />
                    ) : (
                        <HeaderLinkNavItem
                            linkTarget={link.to}
                            linkStyle={linkStyle}
                            headerPreset={headerPreset}
                            title={title}
                            isDropdown
                            href={target?.href}
                            isSiteAuthLoginHref={isSiteAuthLoginHref(context.linker, target.href)}
                        />
                    )
                }
                openOnHover={true}
            >
                {link.links.map((subLink, index) => (
                    <SubHeaderLink key={index} {...props} link={subLink} />
                ))}
            </DropdownMenu>
        );
    }

    if (!link.to) {
        return null;
    }

    return (
        <HeaderLinkNavItem
            linkTarget={link.to}
            linkStyle={linkStyle}
            headerPreset={headerPreset}
            title={title}
            isDropdown={false}
            href={target?.href}
            isSiteAuthLoginHref={target ? isSiteAuthLoginHref(context.linker, target.href) : false}
        />
    );
}

export type HeaderLinkNavItemProps = {
    linkTarget: ContentRef;
    linkStyle: NonNullable<CustomizationHeaderItem['style']>;
    headerPreset: CustomizationHeaderPreset;
    title: string;
    href?: string;
    isDropdown: boolean;
    isSiteAuthLoginHref: boolean;
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
    const {
        linkTarget,
        linkStyle,
        headerPreset,
        title,
        href,
        isDropdown,
        isSiteAuthLoginHref,
        ...rest
    } = props;
    const variant = (() => {
        switch (linkStyle) {
            case 'button-secondary':
                return 'header';
            case 'button-primary':
                return 'primary';
            default:
                assertNever(linkStyle);
        }
    })();
    const sharedProps: React.ComponentProps<typeof Button> = {
        href,
        variant,
        size: 'medium' as const,
        insights: {
            type: 'link_click' as const,
            link: {
                target: linkTarget,
                position: SiteInsightsLinkPosition.Header,
            },
        },
        label: title,
        ...rest,
    };

    return isSiteAuthLoginHref ? (
        <SiteAuthLoginButton {...sharedProps} />
    ) : (
        <Button {...sharedProps} />
    );
}

function getHeaderLinkClassName(_props: { headerPreset: CustomizationHeaderPreset }) {
    return tcls(
        'flex items-center gap-1',
        'shrink',
        'contrast-more:underline',
        'truncate',

        'text-tint',
        'links-default:hover:text-primary',
        'links-default:data-[state=open]:text-primary',
        'links-default:tint:hover:text-tint-strong',
        'links-default:tint:data-[state=open]:text-tint-strong',
        'underline-offset-2',
        'links-accent:hover:underline',
        'links-accent:data-[state=open]:underline',
        'links-accent:underline-offset-4',
        'links-accent:decoration-primary-subtle',
        'links-accent:decoration-[3px]',
        'links-accent:py-0.5', // Prevent underline from being cut off at the bottom

        'theme-bold:text-header-link',
        'hover:theme-bold:text-header-link/7!'
    );
}

function HeaderItemLink(props: Omit<HeaderLinkNavItemProps, 'linkStyle'>) {
    const { linkTarget, headerPreset, title, isDropdown, href, isSiteAuthLoginHref, ...rest } =
        props;
    const sharedProps = {
        href: href ?? '#',
        className: getHeaderLinkClassName({ headerPreset }),
        insights: {
            type: 'link_click' as const,
            link: {
                target: linkTarget,
                position: SiteInsightsLinkPosition.Header,
            },
        },
        ...rest,
    };

    return isSiteAuthLoginHref ? (
        <SiteAuthLoginLink {...sharedProps}>
            {title}
            {isDropdown ? <ToggleChevron /> : null}
        </SiteAuthLoginLink>
    ) : (
        <Link {...sharedProps}>
            {title}
            {isDropdown ? <ToggleChevron /> : null}
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
            <ToggleChevron />
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

    const title = getLocalizedTitle(link, context.locale);
    const sharedProps = {
        href: target.href,
        insights: {
            type: 'link_click' as const,
            link: {
                target: link.to,
                position: SiteInsightsLinkPosition.Header,
            },
        },
    };

    return isSiteAuthLoginHref(context.linker, target.href) ? (
        <SiteAuthLoginDropdownMenuItem {...sharedProps}>{title}</SiteAuthLoginDropdownMenuItem>
    ) : (
        <DropdownMenuItem {...sharedProps}>{title}</DropdownMenuItem>
    );
}
