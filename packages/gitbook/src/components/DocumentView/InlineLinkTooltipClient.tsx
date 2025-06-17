'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ReactNode } from 'react';

const InlineLinkTooltipClientImpl = dynamic(
    () => import('./InlineLinkTooltipClientImpl').then((mod) => mod.InlineLinkTooltipClientImpl),
    {
        ssr: false,
        loading: () => null, // Don't render anything until loaded
    }
);

export function InlineLinkTooltipClient({
    children,
    trigger,
}: {
    children: ReactNode;
    trigger: ReactNode;
}) {
    const [shouldLoad, setShouldLoad] = useState(false);

    return (
        <span onMouseEnter={() => setShouldLoad(true)} onFocus={() => setShouldLoad(true)}>
            {shouldLoad ? (
                <InlineLinkTooltipClientImpl trigger={trigger}>
                    {children}
                </InlineLinkTooltipClientImpl>
            ) : (
                children
            )}
        </span>
    );
}
