'use client';

import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { tcls, ClassValue } from '@/lib/tailwind';

import { Link } from './Link';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary';
    size?: 'default' | 'medium' | 'small';
    className?: ClassValue;
} & HTMLAttributes<HTMLElement>;

export function Button({
    href,
    children,
    variant = 'primary',
    size = 'default',
    className,
    ...rest
}: ButtonProps) {
    const variantClasses =
        variant === 'primary'
            ? //PRIMARY
              [
                  'bg-primary-600',
                  'text-white',
                  'ring-dark/2',
                  'hover:bg-primary-500',
                  'dark:ring-light/3',
                  'dark:bg-primary-600',
                  'dark:hover:bg-primary-700',
              ]
            : // SECONDARY
              [
                  'bg-dark/2',
                  'ring-dark/1',
                  'hover:bg-dark/3',
                  'dark:bg-light/2',
                  'dark:ring-light/1',
                  'dark:hover:bg-light/3',
              ];

    const sizes = {
        default: ['text-base', 'px-4', 'py-2'],
        medium: ['text-sm', 'px-3', 'py-1'],
        small: ['text-xs', 'px-3 py-2'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(
        'inline-block',
        'rounded-md',
        'straight-corners:rounded-none',
        'place-self-start',
        'ring-1',
        'ring-inset',
        'grow-0',
        'shrink-0',
        'truncate',
        'transition-colors',
        variantClasses,
        sizeClasses,
        className,
    );

    if (href) {
        return (
            <Link href={href} className={domClassName} {...rest}>
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
