'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type React from 'react';

import { useIsMounted } from '../hooks/useIsMounted';
import { Button, type ButtonProps } from '../primitives/Button';
import { DropdownMenuItem } from '../primitives/DropdownMenu';
import { Link, type LinkInsightsProps, type LinkProps } from '../primitives/Link';
import { removeTrailingSlash } from '@/lib/paths';

/**
 * Enrich a site auth login link with the current location relative to the site URL.
 */
function useSiteAuthLoginHrefWithLocation(href: string) {
    const rawPathname = usePathname();
    const searchParams = useSearchParams();
    const currentSearch = searchParams?.toString();
    // On the server, usePathname() returns the internal rewritten route (/sites/…, which includes
    // the site API token), so the location is only added once mounted.
    // https://nextjs.org/docs/app/api-reference/functions/use-pathname#avoid-hydration-mismatch-with-rewrites
    const isMounted = useIsMounted();
    const pathname = isMounted ? (rawPathname ?? '/') : null;

    return useMemo(() => {
        if (pathname === null) {
            return href;
        }

        const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        const resolved = URL.canParse(href) ? new URL(href) : new URL(href, baseURL);
        const siteBasePath = removeTrailingSlash(
            resolved.pathname.replace(/\/~gitbook\/auth\/login\/?$/, '')
        );
        const locationPath =
            siteBasePath && pathname.startsWith(`${siteBasePath}/`)
                ? pathname.slice(siteBasePath.length)
                : pathname === siteBasePath
                  ? '/'
                  : pathname;

        resolved.searchParams.set(
            'location',
            `${locationPath}${currentSearch ? `?${currentSearch}` : ''}`
        );

        return href.startsWith('http')
            ? resolved.toString()
            : `${resolved.pathname}${resolved.search}`;
    }, [currentSearch, href, pathname]);
}

/**
 * Link component that preserves the current page location through the auth login flow.
 */
export function SiteAuthLoginLink(props: LinkProps) {
    const href = useSiteAuthLoginHrefWithLocation(props.href);
    return <Link {...props} href={href} />;
}

/**
 * Button variant of SiteAuthLoginLink.
 */
export function SiteAuthLoginButton(props: ButtonProps) {
    const href = useSiteAuthLoginHrefWithLocation(props.href ?? '#');
    return <Button {...props} href={href} />;
}

/**
 * Dropdown menu item variant of SiteAuthLoginLink.
 */
export function SiteAuthLoginDropdownMenuItem(
    props: {
        href: string;
        target?: React.HTMLAttributeAnchorTarget;
        active?: boolean;
        className?: string;
        children: React.ReactNode;
        leadingIcon?: React.ReactNode | string;
    } & LinkInsightsProps
) {
    const href = useSiteAuthLoginHrefWithLocation(props.href);
    return <DropdownMenuItem {...props} href={href} />;
}
