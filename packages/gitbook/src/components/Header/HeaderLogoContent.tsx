import type { ReactNode } from 'react';

import { tcls } from '@/lib/tailwind';

export const HEADER_LOGO_IMAGE_SIZES = [
    {
        media: '(max-width: 1024px)',
        width: 160,
    },
    {
        width: 260,
    },
];

export const HEADER_LOGO_CONTAINER_CLASS = tcls(
    'group/headerlogo',
    'min-w-0',
    'shrink',
    'flex',
    'items-center'
);

export const HEADER_LOGO_IMAGE_CLASS = tcls(
    'overflow-hidden',
    'shrink',
    'min-w-0',
    'max-w-40',
    'lg:max-w-64',
    'lg:site-header-none:page-no-toc:max-w-56',
    'max-h-8',
    'h-full',
    'w-full',
    'object-contain',
    'object-left'
);

interface HeaderLogoContentProps {
    logo: ReactNode | null;
    fallbackIcon: ReactNode;
    title: ReactNode;
}

export function HeaderLogoContent(props: HeaderLogoContentProps) {
    const { logo, fallbackIcon, title } = props;

    if (logo) {
        return logo;
    }

    return (
        <>
            {fallbackIcon}
            <HeaderLogoTitle>{title}</HeaderLogoTitle>
        </>
    );
}

function HeaderLogoTitle(props: { children: ReactNode }) {
    return (
        <div
            className={tcls(
                'text-pretty',
                'line-clamp-2',
                'tracking-tight',
                'max-w-[18ch]',
                'lg:max-w-[24ch]',
                'font-semibold',
                'ms-3',
                'text-base/tight',
                'lg:text-lg/tight',
                'text-tint-strong',
                'theme-bold:text-header-link'
            )}
        >
            {props.children}
        </div>
    );
}
