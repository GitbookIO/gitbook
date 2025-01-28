'use client';

import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { tcls, ClassValue } from '@/lib/tailwind';

import { Link, LinkInsightsProps } from './Link';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary';
    size?: 'default' | 'medium' | 'small';
    className?: ClassValue;
} & LinkInsightsProps &
    HTMLAttributes<HTMLElement>;

export function Button({
    href,
    children,
    variant = 'primary',
    size = 'default',
    className,
    insights,
    ...rest
}: ButtonProps) {
    const variantClasses =
        variant === 'primary'
            ? //PRIMARY
              [
                  'bg-primary',
                  'text-light', // TODO: Move to 'text-contrast-primary' once contrast calculation works better
                  'hover:text-light-1',
                  'hover:bg-primary-600',

                  'dark:bg-primary',
                  'dark:text-contrast-primary',
                  'dark:hover:bg-primary',
              ]
            : // SECONDARY
              [
                  'bg-light-1',
                  'text-dark/8',
                  'hover:text-primary',
                  'contrast-more:bg-light',
                  'contrast-more:text-dark',
                  'contrast-more:hover:ring-primary',

                  'dark:bg-light/1',
                  'dark:text-light/8',
                  'contrast-more:dark:bg-dark',
                  'contrast-more:dark:text-light',
                  'dark:hover:bg-light/2',
                  'dark:hover:text-light',
              ];

    const sizes = {
        default: ['text-base', 'px-4', 'py-2'],
        medium: ['text-sm', 'px-3', 'py-1.5'],
        small: ['text-xs', 'px-3 py-2'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(
        'button',
        'inline-block',
        'rounded-md',
        'straight-corners:rounded-none',
        'place-self-start',

        'ring-1',
        'ring-dark/1',
        'hover:ring-dark/2',
        'dark:ring-light/2',
        'dark:hover:ring-light/4',

        'shadow-sm',
        'shadow-dark/4',
        'dark:shadow-dark/8',
        'hover:shadow-md',
        'active:shadow-none',

        'contrast-more:ring-dark',
        'contrast-more:hover:ring-2',
        'contrast-more:hover:ring-dark',
        'contrast-more:dark:ring-light',
        'contrast-more:dark:hover:ring-light',

        'hover:scale-105',
        'active:scale-100',
        'transition-all',

        'grow-0',
        'shrink-0',
        'truncate',
        variantClasses,
        sizeClasses,
        className,
    );

    if (href) {
        return (
            <Link href={href} className={domClassName} insights={insights} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={domClassName} {...rest}>
            {children}
        </button>
    );
}
