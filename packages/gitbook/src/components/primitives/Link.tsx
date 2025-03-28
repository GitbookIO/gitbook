'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

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
        if (isExternal && window.self !== window.top) {
            event.preventDefault();
            window.open(href, '_blank');
        }

        domProps.onClick?.(event);
    };

    if (isExternal) {
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
