'use client';

import {
    type CustomizationContentLink,
    type CustomizationHeaderItem,
    type CustomizationHeaderPreset,
    SiteInsightsLinkPosition,
    type TranslationLanguage,
} from '@gitbook/api';
import type React from 'react';

import { getLocalizedTitle } from '@/lib/sites';
import { SiteAuthLoginDropdownMenuItem } from '../SiteAuth/SiteAuthLoginLink';
import { DropdownMenuItem, DropdownSubMenu } from '../primitives/DropdownMenu';
import { HeaderLinkDropdown, HeaderLinkNavItem } from './HeaderLinkDropdown';

type HeaderLinkStyle = 'link' | 'button-secondary' | 'button-primary';

export function HeaderLinkItem(props: {
    link: CustomizationHeaderItem;
    locale: TranslationLanguage | undefined;
    headerPreset: CustomizationHeaderPreset;
    dropdownClassName: string | null;
    href?: string;
    hasTarget: boolean;
    isSiteAuthLoginHref?: boolean;
    children?: React.ReactNode;
}) {
    const {
        link,
        locale,
        headerPreset,
        dropdownClassName,
        href,
        hasTarget,
        isSiteAuthLoginHref = false,
        children,
    } = props;
    const linkStyle = (link.style ?? 'link') satisfies HeaderLinkStyle;
    const title = getLocalizedTitle(link, locale);

    if (link.links && link.links.length > 0) {
        return (
            <HeaderLinkDropdown
                headerPreset={headerPreset}
                title={title}
                hasTarget={hasTarget}
                linkTarget={link.to ?? null}
                linkStyle={linkStyle}
                href={href}
                isSiteAuthLoginHref={isSiteAuthLoginHref}
                dropdownClassName={dropdownClassName ?? ''}
            >
                {children}
            </HeaderLinkDropdown>
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
            href={href}
            isSiteAuthLoginHref={isSiteAuthLoginHref}
        />
    );
}

export function SubHeaderLinkItem(props: {
    link: CustomizationContentLink;
    locale: TranslationLanguage | undefined;
    href?: string;
    isSiteAuthLoginHref?: boolean;
}) {
    return <HeaderLinkMenuItem {...props} />;
}

export function HeaderLinkSubMenu(props: {
    link: CustomizationHeaderItem;
    locale: TranslationLanguage | undefined;
    children: React.ReactNode;
}) {
    const { link, locale, children } = props;
    const title = getLocalizedTitle(link, locale);

    return <DropdownSubMenu label={title}>{children}</DropdownSubMenu>;
}

export function HeaderLinkMenuItem(props: {
    link: CustomizationHeaderItem | CustomizationContentLink;
    locale: TranslationLanguage | undefined;
    href?: string;
    isSiteAuthLoginHref?: boolean;
}) {
    const { link, locale, href, isSiteAuthLoginHref = false } = props;
    const title = getLocalizedTitle(link, locale);
    const sharedProps = {
        href,
        insights: link.to
            ? {
                  type: 'link_click' as const,
                  link: {
                      target: link.to,
                      position: SiteInsightsLinkPosition.Header,
                  },
              }
            : undefined,
    };

    return isSiteAuthLoginHref && href ? (
        <SiteAuthLoginDropdownMenuItem {...sharedProps} href={href}>
            {title}
        </SiteAuthLoginDropdownMenuItem>
    ) : (
        <DropdownMenuItem {...sharedProps}>{title}</DropdownMenuItem>
    );
}
