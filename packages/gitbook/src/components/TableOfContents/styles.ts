import { type ClassValue, tcls } from '@/lib/tailwind';

export const ToCItemBaseStyles = [
    'flex flex-row justify-start items-center gap-3',
    'circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3',
    'focus-visible:-outline-offset-2',
    'before:contents[] before:-left-px before:absolute before:inset-y-0',
    'sidebar-list-line:rounded-l-none! sidebar-list-line:before:w-px [&+div_a]:sidebar-list-default:rounded-l-none has-[.openapi-method]:pl-3 [&+div_a]:pl-5 [&+div_a]:sidebar-list-default:before:w-px',
];

export const ToCLinkItemStyles = [
    'group/toclink toclink relative transition-colors',
    ToCItemBaseStyles,
    'text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong',
    'contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12',
];

export const ToCButtonItemStyles = [
    'relative transition-colors',
    ToCItemBaseStyles,
    'text-balance font-normal text-sm text-tint-strong hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong',
    'contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12',
];

export const ToCLinkItemActiveStyles = [
    'font-semibold',
    'sidebar-list-line:before:w-0.5',

    'before:bg-primary-solid',
    'text-primary-subtle',
    'contrast-more:text-primary',

    'sidebar-list-pill:bg-primary',
    '[html.sidebar-list-pill.theme-muted_&]:bg-primary-hover',
    '[html.sidebar-list-pill.theme-bold.tint_&]:bg-primary-hover',
    '[html.sidebar-filled.sidebar-list-pill.theme-muted_&]:bg-primary',
    '[html.sidebar-filled.sidebar-list-pill.theme-bold.tint_&]:bg-primary',

    'hover:bg-primary-hover',
    'hover:text-primary',
    'hover:before:bg-primary-solid-hover',
    'hover:sidebar-list-pill:bg-primary-hover',

    'contrast-more:text-primary',
    'contrast-more:hover:text-primary-strong',
    'contrast-more:bg-primary',
    'contrast-more:ring-1',
    'contrast-more:ring-primary',
    'contrast-more:hover:ring-primary-hover',
];

export function getTableOfContentsClassName(className?: ClassValue) {
    return tcls(
        'group/table-of-contents',
        'text-sm',

        'grow-0',
        'shrink-0',

        'w-4/5',
        'md:w-1/2',
        'lg:w-72',

        'max-lg:not-sidebar-filled:bg-tint-base',
        'max-lg:not-sidebar-filled:border-r',
        'border-tint-subtle',

        'lg:flex!',
        'lg:animate-none!',
        'lg:sticky',
        'lg:mr-12',
        'lg:z-0',

        'layout-wide:no-sidebar:lg:fixed',
        'layout-wide:no-sidebar:lg:max-3xl:w-12',
        'layout-wide:no-sidebar:lg:left-5',
        'layout-wide:no-sidebar:lg:z-30',

        'layout-default:no-sidebar:lg:max-xl:fixed',
        'layout-default:no-sidebar:lg:max-xl:w-12',
        'layout-default:no-sidebar:lg:max-xl:left-5',
        'layout-default:no-sidebar:lg:z-30',

        // Server-side static positioning
        'lg:top-0',
        'lg:h-screen',
        'lg:announcement:h-[calc(100vh-4.25rem)]',

        // With header
        'lg:site-header:top-16',
        'lg:site-header:h-[calc(100vh-4rem)]',
        'lg:announcement:site-header:h-[calc(100vh-4rem-4.25rem)]',

        'lg:site-header-sections:top-27',
        'lg:site-header-sections:h-[calc(100vh-6.75rem)]',
        'lg:site-header-sections:announcement:h-[calc(100vh-6.75rem-4.25rem)]',

        // Client-side dynamic positioning (CSS vars applied by script)
        'lg:[html[style*="--toc-top-offset"]_&]:top-(--toc-top-offset)!',
        'lg:[html[style*="--toc-height"]_&]:h-(--toc-height)!',
        'lg:page-no-toc:[html[style*="--outline-top-offset"]_&]:top-(--outline-top-offset)!',
        'lg:page-no-toc:[html[style*="--outline-height"]_&]:h-(--outline-height)!',

        'pt-6 pb-4',
        'supports-[-webkit-touch-callout]:pb-[env(safe-area-inset-bottom)]',
        'lg:max-3xl:has-sidebar:sidebar-filled:layout-default:pr-6',
        'max-lg:pl-8',

        'flex',
        'flex-col',
        'min-h-0',
        'gap-4',
        className
    );
}

export function getTableOfContentsSidebarClassName(className?: ClassValue) {
    return tcls(
        '-ms-5',
        'layout-wide:no-sidebar:ms-0 layout-default:no-sidebar:lg:max-xl:ms-0',
        'relative flex min-h-0 grow flex-col border-tint-subtle',

        'sidebar-filled:bg-tint-subtle',
        'theme-muted:bg-tint-subtle',
        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
        '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
        '[html.sidebar-filled.theme-gradient_&]:border',
        'max-lg:sidebar-filled:border',
        'lg:page-no-toc:bg-transparent!',
        'lg:page-no-toc:border-none!',

        'sidebar-filled:rounded-2xl',
        'straight-corners:rounded-none',
        '[html.sidebar-filled.circular-corners_&]:layout-wide:rounded-4xl',
        className
    );
}

export function getTableOfContentsInnerHeaderClassName(props?: {
    hideOnMobile?: boolean;
    className?: ClassValue;
}) {
    const { hideOnMobile = false, className } = props ?? {};

    return tcls(
        'my-5 sidebar-default:mt-2 flex flex-col gap-2 px-5 empty:hidden',
        hideOnMobile ? 'max-lg:hidden' : '',
        className
    );
}

export const TABLE_OF_CONTENTS_SPACES_DROPDOWN_CLASS = 'w-full px-3';
