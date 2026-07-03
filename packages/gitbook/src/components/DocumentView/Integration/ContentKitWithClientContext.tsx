'use client';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';
import React from 'react';
import type { WebframePageContext } from './adaptive';

type ContentKitProps<RenderContext> = React.ComponentProps<typeof ContentKit<RenderContext>>;

/**
 * ContentKit wrapper for integration blocks that expose client-only context to webframes:
 * the current page (always, when known) and adaptive visitor claims (only when the integration
 * is allowed to access them).
 */
export function ContentKitWithClientContext<RenderContext>(
    props: ContentKitProps<RenderContext> & {
        /** Whether visitor claims may be exposed to the webframe (integration scope gated). */
        canAccessVisitorClaims: boolean;
        /** Current page to inject into the webframe, or `null` when unknown. */
        page: WebframePageContext | null;
    }
) {
    const { canAccessVisitorClaims, page, ...contentKitProps } = props;

    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    // Read during render (Suspense) only when the integration is allowed visitor claims, so that
    // page-only webframes don't suspend on the visitor-claims fetch.
    const visitorClaims = canAccessVisitorClaims ? getAdaptiveVisitorClaims() : null;

    const clientContext = React.useMemo<ContentKitClientContextData>(
        () => ({
            getVisitorContext: canAccessVisitorClaims
                ? () => ({ visitor: visitorClaims?.visitor ?? null })
                : undefined,
            getPageContext: page ? () => ({ page }) : undefined,
        }),
        [canAccessVisitorClaims, visitorClaims, page]
    );

    return <ContentKit {...contentKitProps} clientContext={clientContext} />;
}
