import type { ClassValue } from '@/lib/tailwind';

/**
 * Height of the desktop header.
 */
export const HEADER_HEIGHT_DESKTOP = 64 as const;

/**
 * Style for the site container, sets the margins and max width of the UI surrounding the content (header, footer, ...).
 */
export const CONTAINER_LAYOUT: ClassValue = [
    'px-4 pl-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)]',
    'sm:px-6 sm:pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),1.5rem)]',
    'md:px-8 md:pl-[max(env(safe-area-inset-left),2rem)] md:pr-[max(env(safe-area-inset-right),2rem)]',
    'max-w-screen-2xl',
    'mx-auto',
];

/**
 * Style for the content container, sets the max width of the content area. Adapts between normal, wide and full width layouts.
 */
export const CONTENT_LAYOUT: ClassValue = [
    'max-w-3xl',
    'layout-wide:max-w-6xl',
    'layout-full:max-w-6xl',
    'mx-auto',
    'w-full',
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
