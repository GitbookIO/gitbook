'use client';

import * as api from '@gitbook/api';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React from 'react';
import { useTrackEvent } from '../Insights';

// Props from Next, which includes NextLinkProps and all the things anchor elements support.
type BaseLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
    NextLinkProps & {
        children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>;

export type LinkInsightsProps = {
    /** Target of the link, for insights. */
    insights?: api.SiteInsightsEventLinkClick['link'];
}

export type LinkProps = Omit<BaseLinkProps, 'href'> & LinkInsightsProps & {
    /** Enforce href is passed as a string (not a URL). */
    href: string;
};

/**
 * Low-level Link component that handles navigation to external urls.
 * It does not contain any styling.
 */
export const Link = React.forwardRef(function Link(
    props: LinkProps,
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { href, prefetch, children, insights, ...domProps } = props;
    const trackEvent = useTrackEvent();

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (insights) {
            trackEvent({ type: 'link_click', link: insights });
        }

        domProps.onClick?.(event);
    };

    // Use a real anchor tag for external links,s and a Next.js Link for internal links.
    // If we use a NextLink for external links, Nextjs won't rerender the top-level layouts.
    const isExternal = URL.canParse ? URL.canParse(props.href) : props.href.startsWith('http');
    if (isExternal) {
        return (
            <a ref={ref} {...domProps} href={href} onClick={onClick}>
                {children}
            </a>
        );
    }

    return (
        <NextLink ref={ref} {...props} onClick={onClick}>
            {children}
        </NextLink>
    );
});
