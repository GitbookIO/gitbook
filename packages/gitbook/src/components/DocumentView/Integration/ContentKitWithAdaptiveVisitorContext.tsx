'use client';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';
import React from 'react';

type ContentKitProps<RenderContext> = React.ComponentProps<typeof ContentKit<RenderContext>>;

/**
 * ContentKit wrapper for integration blocks that need client-only adaptive context.
 */
export function ContentKitWithAdaptiveVisitorContext<RenderContext>(
    props: ContentKitProps<RenderContext>
) {
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    const visitorClaims = getAdaptiveVisitorClaims();

    const clientContext = React.useMemo<ContentKitClientContextData>(
        () => ({
            getVisitorContext: () => ({
                visitor: visitorClaims?.visitor ?? null,
            }),
        }),
        [visitorClaims]
    );

    return <ContentKit {...props} clientContext={clientContext} />;
}
