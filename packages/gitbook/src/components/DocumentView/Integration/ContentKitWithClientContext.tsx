'use client';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { NavigationStatusContext } from '@/components/hooks';
import { type GitBookLinker, createLinker } from '@/lib/links';
import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { WebframePageContext } from './adaptive';

type ContentKitProps<RenderContext> = React.ComponentProps<typeof ContentKit<RenderContext>>;

/** Serializable inputs to rebuild the tested linker on the client (functions can't cross the RSC boundary). */
export type WebframeLinkerData = Pick<
    Parameters<typeof createLinker>[0],
    'host' | 'protocol' | 'siteBasePath' | 'spaceBasePath'
>;

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
        /** Data to rebuild the site linker, used to resolve webframe navigation requests. */
        linkerData: WebframeLinkerData;
        /** Map of page id → space-relative path, to resolve `@webframe.navigate` by page id. */
        pagePaths: Record<string, string>;
    }
) {
    const { canAccessVisitorClaims, page, linkerData, pagePaths, ...contentKitProps } = props;

    const router = useRouter();
    const { onNavigationClick } = React.useContext(NavigationStatusContext);
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();

    // Rebuild the (tested) linker on the client so navigation resolves paths exactly like the rest
    // of the app, instead of duplicating the join logic here.
    const linker = React.useMemo<GitBookLinker>(() => createLinker(linkerData), [linkerData]);

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
                navigateTo(linker.toPathInSite(path) + suffix);
            },
            navigateToPageId: ({ pageId, anchor }) => {
                // Resolve the page id against the current space's pages so the destination is a
                // real in-site page (and nowhere outside it).
                const pagePath = pagePaths[pageId];
                if (pagePath === undefined) {
                    return;
                }
                const suffix = anchor ? `#${anchor}` : '';
                navigateTo(linker.toPathInSpace(pagePath) + suffix);
            },
        }),
        [canAccessVisitorClaims, visitorClaims, page, linker, pagePaths, navigateTo]
    );

    return <ContentKit {...contentKitProps} clientContext={clientContext} />;
}
