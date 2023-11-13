import { ClassValue } from '@/lib/tailwind';

/**
 * Maximum width of the normal mode.
 */
export const CONTAINER_MAX_WIDTH_NORMAL = 'max-w-screen-2xl';

/**
 * Padding of the container.
 */
export const CONTAINER_PADDING: ClassValue = ['px-4 sm:px-6 md:px-8'];

/**
 * Side column positioning, with and without a header.
 */
export const SIDE_COLUMN_WITH_HEADER: ClassValue = ['top-16', 'h-[calc(100vh-4rem)]'];
export const SIDE_COLUMN_WITHOUT_HEADER: ClassValue = ['top-0', 'h-screen'];
