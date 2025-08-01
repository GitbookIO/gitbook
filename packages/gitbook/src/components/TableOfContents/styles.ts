export const PageLinkItemStyles = [
    'flex',
    'justify-start',
    'items-center',
    'gap-3',
    'p-1.5',
    'pl-3',
    'text-sm',
    'transition-colors',
    'duration-100',
    'text-tint-strong/7',
    'rounded-md',
    'straight-corners:rounded-none',
    'circular-corners:rounded-xl',
    'before:content-none',
    'font-normal',
    'hover:bg-tint',
    'hover:text-tint-strong',
];

export const ToggleableLinkItemStyles = [
    'group/toclink toclink relative transition-colors',
    'flex flex-row justify-between',
    'circular-corners:rounded-2xl rounded-md straight-corners:rounded-none p-1.5 pl-3',
    'text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong contrast-more:text-tint-strong',
    'contrast-more:hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint-12',
    'before:contents[] before:-left-px before:absolute before:inset-y-0',
    'sidebar-list-line:rounded-l-none sidebar-list-line:before:w-px [&+div_a]:sidebar-list-default:rounded-l-none [&+div_a]:pl-5 [&+div_a]:sidebar-list-default:before:w-px',
];

export const ToggleableLinkItemActiveStyles = [
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
