import type { ClassValue } from '@/lib/tailwind';

export const RecordCardStyles = [
    'group',
    'grid',
    'shadow-1xs',
    'shadow-tint-9/1',
    'depth-flat:shadow-none',
    'rounded-sm',
    'straight-corners:rounded-none',
    'circular-corners:rounded-xl',
    'dark:shadow-transparent',

    'before:pointer-events-none',
    'before:grid-area-1-1',
    'before:transition-shadow',
    'before:w-full',
    'before:h-full',
    'before:rounded-[inherit]',
    'before:ring-1',
    'before:ring-tint-12/2',
    'before:z-10',
    'before:relative',

    'hover:before:ring-tint-12/5',
] as ClassValue;
