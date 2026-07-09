'use client';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { NavigationStatusContext } from '@/components/hooks';
import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { WebframePageContext } from './adaptive';
import { resolveWebframePagePath } from './server-actions';

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
        /** Base path of the current site, used to resolve webframe navigation requests. */
        siteBasePath: string;
    }
) {
    const { canAccessVisitorClaims, page, siteBasePath, ...contentKitProps } = props;

    const router = useRouter();
    const { onNavigationClick } = React.useContext(NavigationStatusContext);
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();

    // Navigate to an in-site href, driving the same navigation progress bar as a regular link so
    // the reader gets feedback while the destination page loads.
    const navigateTo = React.useCallback(
        (href: string) => {
            onNavigationClick(href);
            router.push(href);
        },
        [onNavigationClick, router]
    );
    // Read during render (Suspense) only when the integration is allowed visitor claims, so that
    // webframes that don't use visitor claims don't suspend on the visitor-claims fetch.
    const visitorClaims = canAccessVisitorClaims ? getAdaptiveVisitorClaims() : null;

    const clientContext = React.useMemo<ContentKitClientContextData>(
        () => ({
            getVisitorContext: canAccessVisitorClaims
                ? () => ({ visitor: visitorClaims?.visitor ?? null })
                : undefined,
            getPageContext: page ? () => ({ page }) : undefined,
            navigateToPath: ({ path, anchor }) => {
                // Resolve the requested path relative to the site root so a webframe can navigate
                // to any section or space within the site (and nowhere outside it).
                const suffix = anchor ? `#${anchor}` : '';
                navigateTo(joinPath(siteBasePath, path) + suffix);
            },
            navigateToPageId: async ({ pageId, anchor }) => {
                // Resolve the page ID against the site's page tree so the destination is a real
                // in-site page (and nowhere outside it). Resolution is a (fast, cached) server
                // round-trip; the navigation progress bar is triggered once the path is known.
                const path = await resolveWebframePagePath(pageId);
                if (path) {
                    const suffix = anchor ? `#${anchor}` : '';
                    navigateTo(path + suffix);
                }
            },
        }),
        [canAccessVisitorClaims, visitorClaims, page, siteBasePath, navigateTo]
    );

    return <ContentKit {...contentKitProps} clientContext={clientContext} />;
}

/**
 * Join a base path and a relative path, mirroring the server-side linker so navigation stays
 * within the current site. Kept inline to remain client-safe.
 */
function joinPath(prefix: string, path: string): string {
    const prefixPath = prefix.endsWith('/') ? prefix : `${prefix}/`;
    const suffixPath = path.startsWith('/') ? path.slice(1) : path;
    const joined = prefixPath + suffixPath;
    const withoutTrailingSlash = joined.endsWith('/') ? joined.slice(0, -1) : joined;
    return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
}
