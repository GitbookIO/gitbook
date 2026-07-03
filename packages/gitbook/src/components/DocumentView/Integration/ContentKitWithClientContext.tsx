'use client';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { WebframePageContext } from './adaptive';

type ContentKitProps<RenderContext> = React.ComponentProps<typeof ContentKit<RenderContext>>;

/**
 * ContentKit wrapper for integration blocks that expose client-only capabilities to webframes:
 * the current page, navigation to other pages, and adaptive visitor claims (only when the
 * integration is allowed to access them).
 */
export function ContentKitWithClientContext<RenderContext>(
    props: ContentKitProps<RenderContext> & {
        /** Whether visitor claims may be exposed to the webframe (integration scope gated). */
        canAccessVisitorClaims: boolean;
        /** Current page to inject into the webframe, or `null` when unknown. */
        page: WebframePageContext | null;
        /** Base path of the current space, used to resolve webframe navigation requests. */
        spaceBasePath: string;
    }
) {
    const { canAccessVisitorClaims, page, spaceBasePath, ...contentKitProps } = props;

    const router = useRouter();
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    // Read during render (Suspense) only when the integration is allowed visitor claims, so that
    // webframes that don't use visitor claims don't suspend on the visitor-claims fetch.
    const visitorClaims = canAccessVisitorClaims ? getAdaptiveVisitorClaims() : null;

    const clientContext = React.useMemo<ContentKitClientContextData>(
        () => ({
            getVisitorContext: canAccessVisitorClaims
                ? () => ({ visitor: visitorClaims?.visitor ?? null })
                : undefined,
            getPageContext: page ? () => ({ page }) : undefined,
            navigate: ({ path, anchor }) => {
                // Resolve the requested page path within the current space so a webframe can only
                // navigate within the site, then soft-navigate client-side.
                const target = joinPath(spaceBasePath, path) + (anchor ? `#${anchor}` : '');
                router.push(target);
            },
        }),
        [canAccessVisitorClaims, visitorClaims, page, spaceBasePath, router]
    );

    return <ContentKit {...contentKitProps} clientContext={clientContext} />;
}

/**
 * Join a base path and a relative path, mirroring the server-side linker so navigation stays
 * within the current space. Kept inline to remain client-safe.
 */
function joinPath(prefix: string, path: string): string {
    const prefixPath = prefix.endsWith('/') ? prefix : `${prefix}/`;
    const suffixPath = path.startsWith('/') ? path.slice(1) : path;
    const joined = prefixPath + suffixPath;
    const withoutTrailingSlash = joined.endsWith('/') ? joined.slice(0, -1) : joined;
    return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
}
