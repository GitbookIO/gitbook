import { ClassValue } from '@/lib/tailwind';

/**
 * Height of the desktop header.
 */
export const HEADER_HEIGHT_DESKTOP = 64 as const;

/**
 * Returns horizontal padding classes for the application. Optionally provide
 * an offset to adjust the padding.
 */
export function getContainerHorizontalPaddingStyle(offset: number = 0): ClassValue {
    return [
        // px-4
        `px-${4 - offset}`,
        // sm:px-6
        `sm:px-${6 - offset}`,
        // md:px-8
        `md:px-${8 - offset}`,
    ];
}

/**
 * Style for the container to adapt between normal and full width.
 */
export const CONTAINER_STYLE: ClassValue = [
    getContainerHorizontalPaddingStyle(),
    'max-w-screen-2xl',
    'mx-auto',
    'page-full-width:max-w-full',
];

/**
 * Height of the page cover.
 */
export const PAGE_COVER_HEIGHT: ClassValue = ['h-[240px]'];

/**
 * Side column positioning, with and without a header.
 */
export const SIDE_COLUMN_WITH_HEADER: ClassValue = ['top-[64px]', 'h-[calc(100vh-64px)]'];
export const SIDE_COLUMN_WITH_HEADER_AND_COVER: ClassValue = [
    'top-[304px]',
    'h-[calc(100vh-304px)]',
];
export const SIDE_COLUMN_WITHOUT_HEADER: ClassValue = ['top-0', 'h-screen'];
export const SIDE_COLUMN_WITHOUT_HEADER_AND_COVER: ClassValue = [
    'top-[240px]',
    'h-[calc(100vh-240px)]',
];
