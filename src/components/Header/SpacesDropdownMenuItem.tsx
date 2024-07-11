'use client';

import { Space } from '@gitbook/api';
import { useSelectedLayoutSegment } from 'next/navigation';

import { DropdownMenuItem } from './Dropdown';

function useVariantSpaceHref(variantSpaceUrl: string) {
    const currentPathname = useSelectedLayoutSegment() ?? '';
    const targetUrl = new URL(variantSpaceUrl);
    targetUrl.pathname += `/${currentPathname}`;
    targetUrl.pathname = targetUrl.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');

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
