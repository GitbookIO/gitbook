'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';
import { type TrackEventInput, useTrackEvent } from '../Insights';

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
    };

/**
 * Low-level Link component that handles navigation to external urls.
 * It does not contain any styling.
 */
export const Link = React.forwardRef(function Link(
    props: LinkProps,
    ref: React.Ref<HTMLAnchorElement>
) {
    const { href, prefetch, children, insights, ...domProps } = props;
    const trackEvent = useTrackEvent();

    // Use a real anchor tag for external links,s and a Next.js Link for internal links.
    // If we use a NextLink for external links, Nextjs won't rerender the top-level layouts.
    const isExternal = URL.canParse ? URL.canParse(props.href) : props.href.startsWith('http');

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (insights) {
            trackEvent(insights, undefined, {
                immediate: isExternal,
            });
        }

        // When the page is embedded in an iframe, for security reasons other urls cannot be opened.
        // In this case, we open the link in a new tab.
        if (window.self !== window.top && isExternalLink(href, window.location.origin)) {
            event.preventDefault();
            window.open(href, '_blank');
        }

        domProps.onClick?.(event);
    };

    // We test if the link is external, without comparing to the origin
    // as this will be rendered on the server and it could result in a mismatch.
    if (isExternalLink(href)) {
        return (
            <a ref={ref} {...domProps} href={href} onClick={onClick}>
                {children}
            </a>
        );
    }

    return (
        <NextLink ref={ref} href={href} prefetch={prefetch} {...domProps} onClick={onClick}>
            {children}
        </NextLink>
    );
});

export const LinkBox = React.forwardRef(function LinkBox(
    props: React.BaseHTMLAttributes<HTMLDivElement>,
    ref: React.Ref<HTMLDivElement>
) {
    const { children, className, ...domProps } = props;
    return (
        <div ref={ref} {...domProps} className={tcls('elevate-link relative', className)}>
            {children}
        </div>
    );
});

export const LinkOverlay = React.forwardRef(function LinkOverlay(
    props: LinkProps,
    ref: React.Ref<HTMLAnchorElement>
) {
    const { children, className, ...domProps } = props;
    return (
        <Link
            ref={ref}
            {...domProps}
            className={tcls(
                'link-overlay static before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full',
                className
            )}
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
