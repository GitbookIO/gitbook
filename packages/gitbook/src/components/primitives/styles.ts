import type { ClassValue } from '@/lib/tailwind';

export const ButtonStyles = [
    'button',
    'inline-flex',
    'items-center',
    'gap-2',
    'rounded-md',
    'straight-corners:rounded-none',
    'circular-corners:rounded-full',
    // 'place-self-start',

    'ring-1',
    'ring-tint',
    'hover:ring-tint-hover',
    'focus-visible:ring-2',
    'focus-visible:ring-primary-hover',
    'outline-none',

    'depth-subtle:shadow-sm',
    'depth-subtle:hover:shadow-md',
    'depth-subtle:focus-visible:shadow-md',
    'active:shadow-none',
    'shadow-tint',
    'dark:shadow-tint-1',

    'contrast-more:ring-tint-12',
    'contrast-more:hover:ring-2',
    'contrast-more:hover:ring-tint-12',

    'depth-subtle:hover:-translate-y-px',
    'depth-subtle:focus-visible:-translate-y-px',
    // 'depth-flat:hover:scale-100',
    // 'active:scale-100',
    'transition-all',

    'grow-0',
    'shrink-0',
    'truncate',

    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:bg-tint',
    'disabled:text-tint/8',
    'disabled:shadow-none',
    'disabled:hover:scale-100',
] as ClassValue[];

export const CardStyles = [
    'group',
    'flex',
    'flex-row',
    'justify-between',
    'items-center',
    'gap-4',
    'ring-1',
    'ring-tint-subtle',
    'rounded',
    'straight-corners:rounded-none',
    'circular-corners:rounded-2xl',
    'px-5',
    'py-3',
    'transition-shadow',
    'hover:ring-primary-hover',
] as ClassValue[];

export const LinkStyles = [
    'underline',
    'decoration-[max(0.07em,1px)]', // Set the underline to be proportional to the font size, with a minimum. The default is too thin.
    'underline-offset-2',
    'links-accent:underline-offset-4',

    'links-default:decoration-primary/6',
    'links-default:text-primary-subtle',
    'links-default:hover:text-primary-strong',
    'links-default:contrast-more:text-primary',
    'links-default:contrast-more:hover:text-primary-strong',

    'links-accent:decoration-primary-subtle',
    'links-accent:hover:decoration-[3px]',
    'links-accent:hover:[text-decoration-skip-ink:none]',

    'transition-all',
    'duration-100',
] as ClassValue[];
