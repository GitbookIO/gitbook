'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const LoadingValueContext = React.createContext<React.ReactNode>(null);

// To avoid polluting the RSC payload with the tooltip implementation,
// we lazily load it on the client side. This way, the tooltip is only loaded
// when the user interacts with the link, and it doesn't block the initial render.

const InlineLinkTooltipImpl = dynamic(
    () => import('./InlineLinkTooltipImpl').then((mod) => mod.InlineLinkTooltipImpl),
    {
        // Disable server-side rendering for this component, it's only
        // visible on user interaction.
        ssr: false,
        loading: () => {
            // The fallback should be the children (the content of the link),
            // but as next/dynamic is aiming for feature parity with React.lazy,
            // it doesn't support passing children to the loading component.
            // https://github.com/vercel/next.js/issues/7906
            const children = React.useContext(LoadingValueContext);
            return <>{children}</>;
        },
    }
);

/**
 * Tooltip for inline links. It's lazily loaded to avoid blocking the initial render
 * and polluting the RSC payload.
 *
 * The link text and href have already been rendered on the server for good SEO,
 * so we can be as lazy as possible with the tooltip.
 */
export function InlineLinkTooltip(props: {
    isSamePage: boolean;
    isExternal: boolean;
    breadcrumbs: Array<{ href?: string; label: string; icon?: React.ReactNode }>;
    target: {
        href: string;
        text: string;
        subText?: string;
        icon?: React.ReactNode;
    };
    openInNewTabLabel: string;
    children: React.ReactNode;
}) {
    const { children, ...rest } = props;
    const [shouldLoad, setShouldLoad] = React.useState(false);

    // Once the browser is idle, we set shouldLoad to true.
    // NOTE: to be slightly more performant, we could load when a link is hovered.
    // But I found this was too much of a delay for the tooltip to appear.
    // Loading on idle is a good compromise, as it allows the initial render to be fast,
    // while still loading the tooltip in the background and not polluting the RSC payload.
    React.useEffect(() => {
        if ('requestIdleCallback' in window) {
            (window as globalThis.Window).requestIdleCallback(() => setShouldLoad(true));
        } else {
            // fallback for old browsers
            setTimeout(() => setShouldLoad(true), 2000);
        }
    }, []);

    return shouldLoad ? (
        <LoadingValueContext.Provider value={children}>
            <InlineLinkTooltipImpl {...rest}>{children}</InlineLinkTooltipImpl>
        </LoadingValueContext.Provider>
    ) : (
        children
    );
}
