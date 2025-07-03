'use client';

import type { Space } from '@gitbook/api';

import { joinPath } from '@/lib/paths';
import { useCurrentPagePath } from '../hooks';
import { DropdownMenuItem } from '../primitives/DropdownMenu';

interface VariantSpace {
    id: Space['id'];
    title: Space['title'];
    url: string;
    isActive: boolean;
}

// When switching to a different variant space, we reconstruct the URL by swapping the space path.
function useVariantSpaceHref(variantSpaceUrl: string, currentSpacePath: string, active = false) {
    const currentPathname = useCurrentPagePath();

    // We need to ensure that the variant space URL is not the same as the current space path.
    // If it is, we return only the variant space URL to redirect to the root of the variant space.
    // This is necessary in case the currentPathname is the same as the variantSpaceUrl,
    // otherwise we would redirect to the same space if the variant space that we are switching to is the default one.
    if (!active && currentPathname.startsWith(`${currentSpacePath}/`)) {
        return variantSpaceUrl;
    }

    if (URL.canParse(variantSpaceUrl)) {
        const targetUrl = new URL(variantSpaceUrl);
        targetUrl.pathname = joinPath(targetUrl.pathname, currentPathname);

        targetUrl.searchParams.set('fallback', 'true');

        return targetUrl.toString();
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
    const variantHref = useVariantSpaceHref(variantSpace.url, currentSpacePath, active);

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
