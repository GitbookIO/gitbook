'use client';

import * as React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Icon, type IconName } from '@gitbook/icons';
import { Link, type LinkInsightsProps } from './Link';
import { useClassnames } from './StyleProvider';
import { Tooltip } from './Tooltip';

export type ButtonProps = {
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
        'bg-primary-original',
        'text-contrast-primary-original',
        'hover:bg-primary-solid-hover',
        'hover:text-contrast-primary-solid-hover',
        'border-0',
        'contrast-more:bg-primary-solid',
        'contrast-more:text-contrast-primary-solid',
        'contrast-more:border',
        'disabled:bg-primary-subtle',
        'disabled:text-primary/8',
    ],
    blank: [
        'bg-transparent',
        'text-tint',
        'border-0',
        'contrast-more:border',
        'shadow-none!',
        'translate-y-0!',
        'hover:bg-tint-hover',
        'hover:text-tint-strong',
        'focus-visible:bg-tint-hover',
        'focus-visible:text-tint-strong',
        'data-[state=open]:bg-tint-hover',
        'data-[state=open]:text-tint-strong',
        'contrast-more:bg-tint-subtle',
        'disabled:text-tint/8',
        'disabled:bg-transparent',
    ],
    secondary: [
        'bg-tint',
        'depth-flat:bg-transparent',
        'text-tint',
        'hover:bg-tint-hover',
        'hover:depth-flat:bg-tint-hover',
        'hover:text-tint',
        'contrast-more:bg-tint-subtle',
        'disabled:bg-transparent',
        'disabled:text-tint/8',
    ],
    header: [
        'bg-tint-base text-tint',
        'hover:theme-clean:bg-tint-subtle',

        'theme-bold:bg-header-link/2',
        'theme-bold:text-header-link',
        'theme-bold:shadow-none!',
        'theme-bold:border-header-link/4',

        'hover:theme-bold:bg-header-link/3',
        'hover:theme-bold:text-header-link',
        'hover:theme-bold:shadow-none',
        'hover:theme-bold:border-header-link/5',

        'contrast-more:theme-bold:bg-header-background',
        'contrast-more:theme-bold:text-header-link',
        'contrast-more:theme-bold:border-header-link',
        'contrast-more:hover:theme-bold:border-header-link',
    ],
};

export const activeClasses = {
    primary: 'bg-primary-solid-hover',
    blank: 'bg-primary-active contrast-more:bg-primary-12 contrast-more:text-contrast-primary-12 disabled:bg-primary-active text-primary-strong font-medium hover:text-primary-strong disabled:text-primary-strong hover:bg-primary-active focus-visible:bg-primary-active focus-visible:text-primary-strong data-[state=open]:bg-primary-active data-[state=open]:text-primary-strong',
    secondary: 'bg-tint-active disabled:bg-tint-active',
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
            disabled,
            ...rest
        },
        ref
    ) => {
        const sizes = {
            default: ['text-base', 'font-semibold', iconOnly ? 'px-2' : 'px-5', 'py-2'],
            medium: ['text-sm', iconOnly ? 'px-2' : 'px-3.5', 'py-1.5'],
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
                        <Icon
                            icon={icon as IconName}
                            className={tcls('button-leading-icon size-[1em] shrink-0')}
                        />
                    ) : (
                        icon
                    )
                ) : null}
                {iconOnly || (!children && !label) ? null : (
                    <span className="button-content truncate">{children ?? label}</span>
                )}
            </>
        );

        const button = href ? (
            <Link
                ref={ref as React.Ref<HTMLAnchorElement>}
                href={href}
                className={domClassName}
                classNames={['ButtonStyles']}
                insights={insights}
                aria-label={label?.toString()}
                aria-pressed={active}
                target={target}
                data-active={active}
                {...rest}
            >
                {content}
            </Link>
        ) : (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type="button"
                className={tcls(buttonOnlyClassNames, domClassName)}
                aria-label={label?.toString()}
                aria-pressed={active}
                disabled={disabled}
                data-active={active}
                {...rest}
            >
                {content}
                {trailing ? <span className="button-trailing-icon ms-auto">{trailing}</span> : null}
            </button>
        );

        return (children || iconOnly) && label ? (
            <Tooltip
                rootProps={{ open: disabled === true ? false : undefined }}
                label={label}
                triggerProps={{ disabled }}
            >
                {button}
            </Tooltip>
        ) : (
            button
        );
    }
);

export const ButtonGroup = React.forwardRef<
    HTMLDivElement,
    ButtonProps & { combinedShape?: boolean }
>(({ children, className, combinedShape = true, ...rest }, ref) => {
    return (
        <div
            ref={ref}
            className={tcls(
                'flex h-fit items-stretch justify-start overflow-hidden',
                combinedShape
                    ? '*:translate-y-0! *:shadow-none! [&>*:not(:first-child)]:border-l-0 [&>*:not(:first-child,:last-child)]:rounded-none! [&>*:not(:only-child):first-child]:rounded-r-none [&>*:not(:only-child):last-child]:rounded-l-none'
                    : '',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
});
