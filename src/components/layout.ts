import { ClassValue } from '@/lib/tailwind';

/**
 * Height of the desktop header.
 */
export const HEADER_HEIGHT_DESKTOP = 64 as const;

/**
 * Maximum width of the normal mode.
 */
export const CONTAINER_MAX_WIDTH_NORMAL = 'max-w-screen-2xl';

/**
 * Padding of the container.
 */
export const CONTAINER_PADDING: ClassValue = ['px-4', 'sm:px-6', 'md:px-8'];

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
