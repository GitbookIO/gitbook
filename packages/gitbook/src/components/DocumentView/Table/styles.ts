import type { ClassValue } from '@/lib/tailwind';

export const RecordCardStyles = [
    'group',
    'grid',
    'shadow-1xs',
    'shadow-tint-9/1',
    'depth-flat:shadow-none',
    'rounded',
    'transition-all',
    'straight-corners:rounded-none',
    'circular-corners:rounded-xl',
    'dark:shadow-transparent',

    'border',
    'border-solid',
    'border-tint-12/2',

    'before:pointer-events-none',
    'before:grid-area-1-1',
    'before:transition-shadow',
    'before:w-full',
    'before:h-full',
    'before:rounded-[inherit]',
    'before:z-10',
    'before:relative',

    'data-[hoverable=true]:hover:border-tint-12/5',
    'data-[hoverable=true]:hover:-translate-y-1',
] as ClassValue;
