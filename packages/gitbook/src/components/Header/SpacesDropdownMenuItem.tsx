'use client';

import type { Space } from '@gitbook/api';

import { joinPath } from '@/lib/paths';
import { useCurrentPagePath } from '../hooks';
import { DropdownMenuItem } from './Dropdown';

function useVariantSpaceHref(variantSpaceUrl: string) {
    const currentPathname = useCurrentPagePath();

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
}) {
    const { variantSpace, active } = props;
    const variantHref = useVariantSpaceHref(variantSpace.url);

    return (
        <DropdownMenuItem key={variantSpace.id} href={variantHref} active={active}>
            {variantSpace.title}
        </DropdownMenuItem>
    );
}
