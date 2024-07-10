'use client';

import { Space } from '@gitbook/api';
import { useSelectedLayoutSegment } from 'next/navigation';

import { DropdownMenuItem } from './Dropdown';

function useVariantSpaceHref(variantSpace: Space) {
    const currentPathname = useSelectedLayoutSegment() ?? '';
    const targetUrl = new URL(variantSpace.urls.published ?? variantSpace.urls.app);
    targetUrl.pathname += `/${currentPathname}`;
    targetUrl.pathname = targetUrl.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');

    return targetUrl.toString();
}

export function SpacesDropdownMenuItem(props: { variantSpace: Space; currentSpace: Space }) {
    const { variantSpace, currentSpace } = props;
    const variantHref = useVariantSpaceHref(variantSpace);

    return (
        <DropdownMenuItem
            key={variantSpace.id}
            href={variantHref}
            active={variantSpace.id === currentSpace.id}
        >
            {variantSpace.title}
        </DropdownMenuItem>
    );
}
