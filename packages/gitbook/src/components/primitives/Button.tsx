'use client';

import * as React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Icon, type IconName } from '@gitbook/icons';
import { Link, type LinkInsightsProps } from './Link';
import { useClassnames } from './StyleProvider';
import { Tooltip } from './Tooltip';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary' | 'blank' | 'header';
    icon?: IconName | React.ReactNode;
    iconOnly?: boolean;
    size?: 'default' | 'medium' | 'small' | 'xsmall';
    className?: ClassValue;
    label?: string | React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    active?: boolean;
} & LinkInsightsProps &
    React.HTMLAttributes<HTMLElement>;

export const variantClasses = {
    primary: [
        'bg-primary-solid',
        'text-contrast-primary-solid',
        'hover:bg-primary-solid-hover',
        'hover:text-contrast-primary-solid-hover',
        'border-0',
        'contrast-more:border-1',
    ],
    blank: [
        'bg-transparent',
        'text-tint',
        'border-0',
        '!shadow-none',
        'hover:bg-primary-hover',
        'hover:text-primary-strong',
        'hover:scale-1',
        'contrast-more:bg-tint-subtle',
        'depth-subtle:hover:translate-y-0',
    ],
    secondary: [
        'bg-tint',
        'depth-flat:bg-transparent',
        'text-tint',
        'hover:bg-tint-hover',
        'depth-flat:hover:bg-tint-hover',
        'hover:text-primary',
        'contrast-more:bg-tint-subtle',
    ],
    header: [
        'bg-tint-base text-tint',
        'theme-clean:hover:bg-tint-subtle',

        'theme-bold:bg-header-link/2',
        'theme-bold:text-header-link',
        'theme-bold:!shadow-none',
        'theme-bold:ring-header-link/4',

        'theme-bold:hover:bg-header-link/3',
        'theme-bold:hover:text-header-link',
        'theme-bold:hover:shadow-none',
        'theme-bold:hover:ring-header-link/5',

        'theme-bold:contrast-more:bg-header-background',
        'theme-bold:contrast-more:text-header-link',
        'theme-bold:contrast-more:ring-header-link',
        'theme-bold:contrast-more:hover:ring-header-link',
    ],
};

const activeClasses = {
    primary: 'bg-primary-solid-hover',
    blank: 'bg-primary-active text-primary-strong font-medium hover:text-primary-strong hover:bg-primary-active',
    secondary: 'bg-tint-active',
    header: 'bg-header-link/3',
};

export const Button = React.forwardRef<
    HTMLButtonElement | HTMLAnchorElement,
    ButtonProps &
        React.ButtonHTMLAttributes<HTMLButtonElement> & { target?: React.HTMLAttributeAnchorTarget }
>(
    (
        {
            href,
            variant = 'primary',
            size = 'default',
            className,
            insights,
            target,
            label,
            icon,
            iconOnly = false,
            children,
            active,
            trailing,
            ...rest
        },
        ref
    ) => {
        const sizes = {
            default: ['text-base', 'font-semibold', 'px-5', 'py-2', 'circular-corners:px-6'],
            medium: ['text-sm', 'px-3.5', 'py-1.5', 'circular-corners:px-4'],
            small: ['text-xs', 'py-2', iconOnly ? 'px-2' : 'px-3'],
            xsmall: ['text-xs', 'py-1', iconOnly ? 'px-1.5' : 'px-2'],
        };

        const sizeClasses = sizes[size] || sizes.default;

        const domClassName = tcls(
            variantClasses[variant],
            sizeClasses,
            active && activeClasses[variant],
            className
        );
        const buttonOnlyClassNames = useClassnames(['ButtonStyles']);

        const content = (
            <>
                {icon ? (
                    typeof icon === 'string' ? (
                        <Icon icon={icon as IconName} className={tcls('size-[1em]')} />
                    ) : (
                        icon
                    )
                ) : null}
                {iconOnly ? null : label}
            </>
        );

        if (href) {
            return (
                <Link
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    href={href}
                    className={domClassName}
                    classNames={['ButtonStyles']}
                    insights={insights}
                    aria-label={label?.toString()}
                    target={target}
                    {...rest}
                >
                    {content}
                </Link>
            );
        }

        const button = (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type="button"
                className={tcls(buttonOnlyClassNames, domClassName)}
                aria-label={label?.toString()}
                {...rest}
            >
                {content}
            </button>
        );

        return iconOnly && label ? <Tooltip label={label}>{button}</Tooltip> : button;
    }
);
