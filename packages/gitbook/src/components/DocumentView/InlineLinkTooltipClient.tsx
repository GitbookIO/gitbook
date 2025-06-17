'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const InlineLinkTooltipClientImpl = dynamic(
    () => import('./InlineLinkTooltipClientImpl').then((mod) => mod.InlineLinkTooltipClientImpl),
    {
        ssr: false,
        loading: () => null, // Don't render anything until loaded
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
    const [shouldLoad, setShouldLoad] = useState(false);

    return (
        <span onMouseEnter={() => setShouldLoad(true)} onFocus={() => setShouldLoad(true)}>
            {shouldLoad ? (
                <InlineLinkTooltipClientImpl {...rest}>{children}</InlineLinkTooltipClientImpl>
            ) : (
                children
            )}
        </span>
    );
}
