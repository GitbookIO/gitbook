'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';
import { SiteExternalLinksTarget } from '@gitbook/api';
import { type TrackEventInput, useTrackEvent } from '../Insights';
import { NavigationStatusContext } from '../hooks';
import { isExternalLink } from '../utils/link';
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
 * Get the target and rel props for a link based on the provided props and context.
 */
function getTargetProps(
    props: Pick<LinkProps, 'href' | 'rel' | 'target'>,
    context: {
        externalLinksTarget: SiteExternalLinksTarget;
        isExternal: boolean;
    }
) {
    const target =
        props.target ??
        (context.isExternal && context.externalLinksTarget === SiteExternalLinksTarget.Blank
            ? '_blank'
            : undefined);
    // Automatically set rel if target is _blank, or use the specified rel.
    const rel = props.rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
    return { target, rel };
}

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
    const { onNavigationClick } = React.useContext(NavigationStatusContext);
    const trackEvent = useTrackEvent();
    const forwardedClassNames = useClassnames(classNames || []);
    const isExternal = isExternalLink(href);
    const { target, rel } = getTargetProps(props, { externalLinksTarget, isExternal });

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const isExternalWithOrigin = isExternalLink(href, window.location.origin);
        // Only trigger navigation context for internal links without modifier keys (i.e. open in new tab).
        if (!isExternal && !event.ctrlKey && !event.metaKey) {
            onNavigationClick(href);
        }

        if (insights) {
            trackEvent(insights, undefined, { immediate: isExternalWithOrigin });
        }

        const isInIframe = window.self !== window.top;

        // When the page is embedded in an iframe
        // for security reasons other urls cannot be opened.
        if (isInIframe && isExternalWithOrigin) {
            event.preventDefault();
            window.open(href, '_blank', 'noopener noreferrer');
        } else if (isExternal && !event.ctrlKey && !event.metaKey) {
            // The external logic server-side is limited
            // so we use the client-side logic to determine the real target
            // by default the target is "_self".
            const { target = '_self' } = getTargetProps(props, {
                externalLinksTarget,
                isExternal: isExternalWithOrigin,
            });
            event.preventDefault();
            window.open(href, target, rel);
        }

        domProps.onClick?.(event);
    };

    // We test if the link is external, without comparing to the origin
    // as this will be rendered on the server and it could result in a mismatch.
    if (isExternal) {
        return (
            <a
                ref={ref}
                className={tcls(...forwardedClassNames, className)}
                {...domProps}
                href={href}
                onClick={onClick}
                target={target}
                rel={rel}
            >
                {children}
            </a>
        );
    }

    // Not sure why yet, but it seems necessary to force prefetch to true
    // default behavior doesn't seem to properly use the client router cache.
    const _prefetch = prefetch === null || prefetch === undefined ? true : prefetch;

    return (
        <NextLink
            ref={ref}
            href={href}
            prefetch={_prefetch}
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
