'use client';

import type { Space } from '@gitbook/api';

import { joinPath } from '@/lib/paths';
import { useCurrentPagePath } from '../hooks';
import { DropdownMenuItem } from './DropdownMenu';

function useVariantSpaceHref(variantSpaceUrl: string, currentSpacePath: string, active = false) {
    const currentPathname = useCurrentPagePath();

    if (!active && currentPathname.startsWith(currentSpacePath)) {
        // If the variant space is not active, we need to ensure that we return to the variant space URL
        // without the current pathname, otherwise we get stuck in the current space.
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
    variantSpace: { id: Space['id']; title: Space['title']; url: string };
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
