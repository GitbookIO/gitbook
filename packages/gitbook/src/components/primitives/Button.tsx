'use client';

import type { HTMLAttributeAnchorTarget, HTMLAttributes } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Icon, type IconName } from '@gitbook/icons';
import { Link, type LinkInsightsProps } from './Link';

import styles from './button.module.css';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary' | 'blank';
    icon?: IconName;
    iconOnly?: boolean;
    size?: 'default' | 'medium' | 'small';
    className?: ClassValue;
    label?: string;
} & LinkInsightsProps &
    HTMLAttributes<HTMLElement>;

const variantClasses = {
    primary: [styles.primary],
    blank: [styles.blank, 'hover:scale-1'],
    secondary: [
        styles.secondary,
        'bg-secondary-solid',
        'text-contrast-secondary-solid',
        'hover:bg-secondary-solid-hover',
        'hover:text-contrast-secondary-solid-hover',
    ],
};

export function Button({
    href,
    variant = 'primary',
    size = 'default',
    className,
    insights,
    target,
    label,
    icon,
    iconOnly = false,
    ...rest
}: ButtonProps & { target?: HTMLAttributeAnchorTarget }) {
    const sizes = {
        default: [styles.default],
        medium: [styles.medium],
        small: [styles.small, iconOnly ? 'px-2' : 'px-3'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(styles.styledButton, variantClasses[variant], sizeClasses, className);

    if (href) {
        return (
            <Link
                href={href}
                className={domClassName}
                insights={insights}
                aria-label={label}
                target={target}
                {...rest}
            >
                {icon ? <Icon icon={icon} className={tcls('size-[1em]')} /> : null}
                {iconOnly ? null : label}
            </Link>
        );
    }

    return (
        <button type="button" className={domClassName} aria-label={label} {...rest}>
            {icon ? <Icon icon={icon} className={tcls('size-[1em]')} /> : null}
            {iconOnly ? null : label}
        </button>
    );
}
