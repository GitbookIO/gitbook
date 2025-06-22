'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';
import { SiteExternalLinksTarget } from '@gitbook/api';
import { type TrackEventInput, useTrackEvent } from '../Insights';
import { type DesignTokenName, useClassnames } from './StyleProvider';

// Props from Next, which includes NextLinkProps and all the things anchor elements support.
type BaseLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
    NextLinkProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>;

export type LinkInsightsProps = {
    /** Event to track when the link is clicked. */
    insights?:
        | TrackEventInput<'ad_click'>
        | TrackEventInput<'link_click'>
        | TrackEventInput<'trademark_click'>
        | TrackEventInput<'search_open_result'>;
};

export type LinkProps = Omit<BaseLinkProps, 'href'> &
    LinkInsightsProps & {
        /** Enforce href is passed as a string (not a URL). */
        href: string;
        /** This is a temporary solution designed to reduce the number of tailwind class passed to the client */
        classNames?: DesignTokenName[];
    };

/**
 * Context to configure the default behavior of links.
 */
export const LinkSettingsContext = React.createContext<{
    externalLinksTarget: SiteExternalLinksTarget;
}>({
    externalLinksTarget: SiteExternalLinksTarget.Self,
});

/**
 * Low-level Link component that handles navigation to external urls.
 * It does not contain any styling.
 */
export const Link = React.forwardRef(function Link(
    props: LinkProps,
    ref: React.Ref<HTMLAnchorElement>
) {
    const { href, prefetch, children, insights, classNames, className, ...domProps } = props;
    const { externalLinksTarget } = React.useContext(LinkSettingsContext);
    const trackEvent = useTrackEvent();
    const forwardedClassNames = useClassnames(classNames || []);

    // Use a real anchor tag for external links,s and a Next.js Link for internal links.
    // If we use a NextLink for external links, Nextjs won't rerender the top-level layouts.
    const isExternal = URL.canParse ? URL.canParse(props.href) : props.href.startsWith('http');

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (insights) {
            trackEvent(insights, undefined, {
                immediate: isExternal,
            });
        }

        if (
            isExternalLink(href, window.location.origin) &&
            // When the page is embedded in an iframe, for security reasons other urls cannot be opened.
            // In this case, we open the link in a new tab.
            (window.self !== window.top ||
                // If the site is configured to open links in a new tab
                externalLinksTarget === SiteExternalLinksTarget.Blank)
        ) {
            event.preventDefault();
            window.open(href, '_blank');
        }

        domProps.onClick?.(event);
    };

    // We test if the link is external, without comparing to the origin
    // as this will be rendered on the server and it could result in a mismatch.
    if (isExternalLink(href)) {
        return (
            <a
                ref={ref}
                className={tcls(...forwardedClassNames, className)}
                {...domProps}
                href={href}
                onClick={onClick}
                {...(externalLinksTarget === SiteExternalLinksTarget.Blank
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
            >
                {children}
            </a>
        );
    }

    return (
        <NextLink
            ref={ref}
            href={href}
            prefetch={prefetch}
            className={tcls(...forwardedClassNames, className)}
            {...domProps}
            onClick={onClick}
        >
            {children}
        </NextLink>
    );
});

/**
 * A box used to contain a link overlay.
 * It is used to create a clickable area that can contain other elements.
 */
export const LinkBox = React.forwardRef(function LinkBox(
    props: React.BaseHTMLAttributes<HTMLDivElement> & { classNames?: DesignTokenName[] },
    ref: React.Ref<HTMLDivElement>
) {
    const { children, className, classNames, ...domProps } = props;
    const forwardedClassNames = useClassnames(classNames || []);
    return (
        <div
            ref={ref}
            {...domProps}
            className={tcls('elevate-link relative', className, forwardedClassNames)}
        >
            {children}
        </div>
    );
});

/**
 * A link overlay that can be used to create a clickable area on top of other elements.
 * It is used to create a link that covers the entire area of the element without encapsulating it in a link tag.
 * This is useful to avoid nesting links inside links.
 */
export const LinkOverlay = React.forwardRef(function LinkOverlay(
    props: LinkProps,
    ref: React.Ref<HTMLAnchorElement>
) {
    const { children, className, ...domProps } = props;
    return (
        <Link
            ref={ref}
            {...domProps}
            className={tcls('link-overlay absolute inset-0 z-10', className)}
        >
            {children}
        </Link>
    );
});

/**
 * Check if a link is external, compared to an origin.
 */
function isExternalLink(href: string, origin: string | null = null) {
    if (!URL.canParse) {
        // If URL.canParse is not available, we quickly check if it looks like a URL
        return href.startsWith('http');
    }

    if (!URL.canParse(href)) {
        // If we can't parse the href, we consider it a relative path
        return false;
    }

    if (!origin) {
        // If origin is not provided, we consider the link external
        return true;
    }

    // If the url points to the same origin, we consider it internal
    const parsed = new URL(href);
    return parsed.origin !== origin;
}
