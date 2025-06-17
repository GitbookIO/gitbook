'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const LoadingValueContext = React.createContext<React.ReactNode>(null);

const InlineLinkTooltipClientImpl = dynamic(
    () => import('./InlineLinkTooltipClientImpl').then((mod) => mod.InlineLinkTooltipClientImpl),
    {
        ssr: false,
        loading: () => {
            const children = React.useContext(LoadingValueContext);
            return <>{children}</>;
        },
    }
);

export function InlineLinkTooltipClient(props: {
    isSamePage: boolean;
    isExternal: boolean;
    aiSummary?: { pageId: string; spaceId: string };
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

    React.useEffect(() => {
        if ('requestIdleCallback' in window) {
            (window as globalThis.Window).requestIdleCallback(() => setShouldLoad(true));
        } else {
            // fallback for Safari or old browsers
            setTimeout(() => setShouldLoad(true), 2000);
        }
    }, []);

    return shouldLoad ? (
        <LoadingValueContext.Provider value={children}>
            <InlineLinkTooltipClientImpl {...rest}>{children}</InlineLinkTooltipClientImpl>
        </LoadingValueContext.Provider>
    ) : (
        children
    );
}
