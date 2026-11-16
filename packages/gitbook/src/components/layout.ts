import type { ClassValue } from '@/lib/tailwind';

/**
 * Height of the desktop header.
 */
export const HEADER_HEIGHT_DESKTOP = 64 as const;

/**
 * Style for the site container, sets the margins and max width of the UI surrounding the content (header, footer, ...).
 * Defined in `RootLayout/styles/page.css`.
 */
export const CONTAINER_STYLE: ClassValue = 'site-container';

/**
 * Style for the content container, sets the max width of the content area. Adapts between normal, wide and full width layouts.
 * Defined in `RootLayout/styles/page.css`.
 *
 * Layout modes:
 * - layout-default → max-w-3xl
 * - layout-wide → max-w-6xl
 */
export const CONTENT_STYLE: ClassValue = 'page-content-width';

export const CONTENT_STYLE_REDUCED: ClassValue = 'page-content-reduced';

/**
 * Height of the page cover.
 */
export const PAGE_COVER_HEIGHT: ClassValue = 'page-cover-height';

/**
 * Side column positioning, with and without a header.
 */
export const SIDE_COLUMN_WITH_HEADER: ClassValue = 'side-column-header';
export const SIDE_COLUMN_WITH_HEADER_AND_COVER: ClassValue = 'side-column-header-cover';
export const SIDE_COLUMN_WITHOUT_HEADER: ClassValue = 'side-column';
export const SIDE_COLUMN_WITHOUT_HEADER_AND_COVER: ClassValue = 'side-column-cover';

/** Id of the `<main>` landmark, target of the skip link. */
export const MAIN_CONTENT_ID = 'gitbook-main-content';
