import type { ClassValue } from '@/lib/tailwind';

export const ButtonStyles = [
    'button',
    'group/button',
    'inline-flex',
    'items-center',
    'gap-2',
    'rounded-md',
    'straight-corners:rounded-none',
    'circular-corners:rounded-3xl',

    'border',
    'border-tint',
    'hover:border-tint-hover',
    'disabled:border-tint',

    'depth-subtle:shadow-xs',
    'hover:depth-subtle:shadow-md',
    'focus-visible:depth-subtle:shadow-md',
    'active:depth-subtle:shadow-xs',
    'shadow-tint/6',
    'dark:shadow-tint-1',

    'contrast-more:border-tint-12',
    'contrast-more:hover:border-2',
    'contrast-more:hover:border-tint-12',

    'hover:depth-subtle:-translate-y-px',
    'focus-visible:depth-subtle:-translate-y-px',
    'data-[state=open]:depth-subtle:-translate-y-px',
    'active:depth-subtle:translate-y-0',
    'transition-all',

    'grow-0',
    'shrink-0',
    'truncate',
    'max-w-full',

    'disabled:cursor-not-allowed',
    'disabled:translate-y-0!',
    'disabled:shadow-none!',
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
    'rounded-sm',
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
    'hover:links-default:text-primary-strong',
    'contrast-more:links-default:text-primary',
    'contrast-more:hover:links-default:text-primary-strong',

    'links-accent:decoration-primary-subtle',
    'hover:links-accent:decoration-[3px]',
    'hover:links-accent:[text-decoration-skip-ink:none]',

    'transition-all',
    'duration-100',
] as ClassValue[];
