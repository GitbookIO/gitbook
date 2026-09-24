'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { ContentKit, type ContentKitClientContextData } from '@gitbook/react-contentkit/client';

import type { WebframePageContext } from './adaptive';
import { useAdaptiveVisitor } from '@/components/Adaptive';
import { NavigationStatusContext } from '@/components/hooks';
import { type GitBookLinker, createLinker } from '@/lib/links';

type ContentKitProps<RenderContext> = React.ComponentProps<typeof ContentKit<RenderContext>>;

// Query params a webframe may set when navigating: the search/ask widget params (see `useSearch`).
const ALLOWED_NAVIGATE_QUERY_PARAMS = ['q', 'ask', 'scope', 'section'];

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
    }
) {
    const { canAccessVisitorClaims, page, linkerData, ...contentKitProps } = props;

    const router = useRouter();
    const { onNavigationClick } = React.useContext(NavigationStatusContext);
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();

    const getVisitorContext = React.useCallback(async () => {
        let visitorClaims: ReturnType<typeof getAdaptiveVisitorClaims>;
        try {
            visitorClaims = getAdaptiveVisitorClaims();
        } catch (suspender) {
            if (
                typeof suspender !== 'object' ||
                suspender === null ||
                !('then' in suspender) ||
                typeof suspender.then !== 'function'
            ) {
                throw suspender;
            }

            await suspender;
            visitorClaims = getAdaptiveVisitorClaims();
        }

        return { visitor: visitorClaims?.visitor ?? null };
    }, [getAdaptiveVisitorClaims]);

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
    const clientContext = React.useMemo<ContentKitClientContextData>(
        () => ({
            getVisitorContext: canAccessVisitorClaims ? getVisitorContext : undefined,
            getPageContext: page ? () => ({ page }) : undefined,
            navigate: ({ path, anchor, query }) => {
                // Resolve the requested path relative to the site root so a webframe can navigate
                // to any section or space within the site (and nowhere outside it).
                const params = new URLSearchParams(
                    Object.entries(query ?? {}).filter(([key]) =>
                        ALLOWED_NAVIGATE_QUERY_PARAMS.includes(key)
                    )
                ).toString();
                const search = params ? `?${params}` : '';
                const hash = anchor ? `#${anchor}` : '';
                navigateTo(linker.toPathInSite(path) + search + hash);
            },
        }),
        [canAccessVisitorClaims, getVisitorContext, page, linker, navigateTo]
    );

    return <ContentKit {...contentKitProps} clientContext={clientContext} />;
}
