'use client';

import { Space } from '@gitbook/api';
import { useSelectedLayoutSegment } from 'next/navigation';

import { DropdownMenuItem } from './Dropdown';

export function SpacesDropdownMenuItem(props: { variantSpace: Space; currentSpace: Space }) {
    const { variantSpace, currentSpace } = props;
    const currentPathname = useSelectedLayoutSegment() ?? '';
    const targetUrl = new URL(variantSpace.urls.published ?? variantSpace.urls.app);
    targetUrl.pathname += `/${currentPathname}`;

    return (
        <DropdownMenuItem
            key={variantSpace.id}
            href={targetUrl.toString()}
            active={variantSpace.id === currentSpace.id}
        >
            {variantSpace.title}
        </DropdownMenuItem>
    );
}
