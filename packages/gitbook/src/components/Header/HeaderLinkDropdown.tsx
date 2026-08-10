'use client';

import {
    type ContentRef,
    type CustomizationHeaderPreset,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import assertNever from 'assert-never';
import type React from 'react';

import { tcls } from '@/lib/tailwind';
import { SiteAuthLoginButton, SiteAuthLoginLink } from '../SiteAuth/SiteAuthLoginLink';
import { Button, Link, ToggleChevron } from '../primitives';
import { type DropdownButtonProps, DropdownMenu } from '../primitives/DropdownMenu';

/**
 * Client component wrapping the DropdownMenu for header links.
 * Accepts serializable props to avoid Flight lazy chunk wrappers reaching Radix's Slot.
 */
export function HeaderLinkDropdown(props: {
    headerPreset: CustomizationHeaderPreset;
    title: string;
    hasTarget: boolean;
    linkTarget: ContentRef | null;
    linkStyle: 'link' | 'button-secondary' | 'button-primary';
    href?: string;
    isSiteAuthLoginHref: boolean;
    dropdownClassName: string;
    children: React.ReactNode;
}) {
    const {
        headerPreset,
        title,
        hasTarget,
        linkTarget,
        linkStyle,
        href,
        isSiteAuthLoginHref,
        dropdownClassName,
        children,
    } = props;

    return (
        <DropdownMenu
            className={dropdownClassName}
            button={
                !hasTarget || !linkTarget ? (
                    <HeaderItemDropdown headerPreset={headerPreset} title={title} />
                ) : (
                    <HeaderLinkNavItem
                        linkTarget={linkTarget}
                        linkStyle={linkStyle}
                        headerPreset={headerPreset}
                        title={title}
                        isDropdown
                        href={href}
                        isSiteAuthLoginHref={isSiteAuthLoginHref}
                    />
                )
            }
            openOnHover={true}
        >
            {children}
        </DropdownMenu>
    );
}

export type HeaderLinkNavItemProps = {
    linkTarget: ContentRef;
    linkStyle: NonNullable<'link' | 'button-secondary' | 'button-primary'>;
    headerPreset: CustomizationHeaderPreset;
    title: string;
    href?: string;
    isDropdown: boolean;
    isSiteAuthLoginHref: boolean;
} & DropdownButtonProps<HTMLElement>;

export function HeaderLinkNavItem(props: HeaderLinkNavItemProps) {
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
    const {
        linkTarget,
        headerPreset,
        title,
        isDropdown,
        href,
        isSiteAuthLoginHref,
        className,
        ...rest
    } = props;
    const sharedProps = {
        href: href ?? '#',
        className: tcls(getHeaderLinkClassName({ headerPreset }), className),
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
    const { headerPreset, title, className, ...rest } = props;
    return (
        <span
            className={tcls(getHeaderLinkClassName({ headerPreset }), 'cursor-default', className)}
            {...rest}
        >
            {title}
            <ToggleChevron />
        </span>
    );
}
