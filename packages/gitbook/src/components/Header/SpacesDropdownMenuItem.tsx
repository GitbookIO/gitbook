'use client';

import type { Space } from '@gitbook/api';

import { useCurrentPagePath } from '../hooks';
import { DropdownMenuItem } from './Dropdown';

function useVariantSpaceHref(variantSpaceUrl: string) {
    const currentPathname = useCurrentPagePath();
    const targetUrl = new URL(variantSpaceUrl, window.location.href);
    targetUrl.pathname += `/${currentPathname}`;
    targetUrl.pathname = targetUrl.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
    targetUrl.searchParams.set('fallback', 'true');

    return targetUrl.toString();
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
