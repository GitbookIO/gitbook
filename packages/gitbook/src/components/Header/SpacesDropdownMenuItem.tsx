'use client';

import { joinPath } from '@/lib/paths';
import { useCurrentPageMetadata, useCurrentPagePath } from '../hooks';
import { DropdownMenuItem } from '../primitives/DropdownMenu';

interface VariantSpace {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    spaceId: string;
}

/**
 * Return the href for a variant space, taking into account the current page path and metadata.
 */
function useVariantSpaceHref(variantSpace: VariantSpace, currentSpacePath: string, active = false) {
    const currentPathname = useCurrentPagePath();
    const { metaLinks, currentPage } = useCurrentPageMetadata();

    // We first check if there is an alternate link for the variant space in the current page metadata.
    const pageHasAlternateForVariant = metaLinks?.alternates.find(
        (alt) => alt.space?.id === variantSpace.spaceId
    );
    if (pageHasAlternateForVariant) {
        return pageHasAlternateForVariant.href;
    }

    const firstAlternate = metaLinks?.alternates[0];
    const computed = firstAlternate
        ? {
              pageID: firstAlternate.pageID,
              spaceID: firstAlternate.space?.id,
          }
        : {
              pageID: currentPage?.id,
              spaceID: currentPage?.spaceId,
          };

    // If there is no alternate link, we reconstruct the URL by swapping the space path.

    // We need to ensure that the variant space URL is not the same as the current space path.
    // If it is, we return only the variant space URL to redirect to the root of the variant space.
    // This is necessary in case the currentPathname is the same as the variantSpaceUrl,
    // otherwise we would redirect to the same space if the variant space that we are switching to is the default one.
    const variantSpaceUrl = variantSpace.url;
    if (!active && currentPathname.startsWith(`${currentSpacePath}/`)) {
        return variantSpaceUrl;
    }

    if (URL.canParse(variantSpaceUrl)) {
        const targetUrl = new URL(variantSpaceUrl);
        targetUrl.pathname = joinPath(targetUrl.pathname, currentPathname);

        targetUrl.searchParams.set('fallback', 'true');

        if (computed?.spaceID && computed?.pageID) {
            targetUrl.searchParams.set('fallbackPageID', computed.pageID);
            targetUrl.searchParams.set('fallbackSpaceID', computed.spaceID);
        }

        return targetUrl.toString();
    }

    if (computed?.spaceID && computed?.pageID) {
        return `${joinPath(variantSpaceUrl, currentPathname)}?fallback=true&fallbackPageID=${computed.pageID}&fallbackSpaceID=${computed.spaceID}`;
    }

    // Fallback when the URL path is a relative path (in development mode)
    return `${joinPath(variantSpaceUrl, currentPathname)}?fallback=true`;
}

export function SpacesDropdownMenuItem(props: {
    variantSpace: VariantSpace;
    active: boolean;
    currentSpacePath: string;
}) {
    const { variantSpace, active, currentSpacePath } = props;
    const variantHref = useVariantSpaceHref(variantSpace, currentSpacePath, active);

    return (
        <DropdownMenuItem key={variantSpace.id} href={variantHref} active={active}>
            {variantSpace.title}
        </DropdownMenuItem>
    );
}

export function SpacesDropdownMenuItems(props: {
    slimSpaces: VariantSpace[];
    curPath: string;
}) {
    const { slimSpaces, curPath } = props;

    return (
        <>
            {slimSpaces.map((space) => (
                <SpacesDropdownMenuItem
                    key={space.id}
                    variantSpace={space}
                    active={space.isActive}
                    currentSpacePath={curPath}
                />
            ))}
        </>
    );
}
