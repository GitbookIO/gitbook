'use client';

import * as React from 'react';

import { Icon, type IconName } from '@gitbook/icons';

import { Link, type LinkInsightsProps } from './Link';
import { Tooltip, type TooltipProps } from './Tooltip';
import { type ClassValue, cx } from '@/lib/classnames';

export type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary' | 'blank' | 'header';
    icon?: IconName | React.ReactNode;
    iconOnly?: boolean;
    size?: 'large' | 'medium' | 'small' | 'xsmall';
    className?: ClassValue;
    label?: string | React.ReactNode;
    trailing?: React.ReactNode;
    children?: React.ReactNode;
    active?: boolean;
    tooltipProps?: TooltipProps;
    truncate?: boolean;
} & LinkInsightsProps &
    React.HTMLAttributes<HTMLElement>;

export const Button = React.forwardRef<
    HTMLButtonElement | HTMLAnchorElement,
    ButtonProps &
        React.ButtonHTMLAttributes<HTMLButtonElement> & { target?: React.HTMLAttributeAnchorTarget }
>(
    (
        {
            href,
            variant = 'primary',
            size = 'medium',
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
            tooltipProps,
            truncate = true,
            ...rest
        },
        ref
    ) => {
        // Styled in `RootLayout/styles/primitives.css`; active styles key off `data-active`.
        const domClassName = cx(
            'button',
            `button-${variant}`,
            `button-${size}`,
            iconOnly && 'button-icon-only',
            className
        );

        // Kept as utilities: callers' icon sizes (e.g. `size-4`) must keep losing to these by sort order.
        const iconSizeClasses = {
            large: 'size-text-2xl',
            medium: ['size-text-lg my-[.1875em]', iconOnly && 'mx-[.1875em]'],
            small: ['my-text-1/4 size-text-base', iconOnly && 'mx-text-1/4'],
            xsmall: ['my-text-1/8 size-text-base', iconOnly && 'mx-text-1/8'],
        };
        let iconElement = null;
        if (icon) {
            if (typeof icon === 'string') {
                iconElement = (
                    <Icon
                        icon={icon as IconName}
                        className={cx('button-leading-icon', iconSizeClasses[size])}
                    />
                );
            } else if (React.isValidElement<React.SVGProps<SVGSVGElement>>(icon)) {
                iconElement = React.cloneElement(icon, {
                    className: cx(
                        'button-leading-icon',
                        iconSizeClasses[size],
                        icon.props.className
                    ),
                });
            }
        }

        const content = (
            <>
                {iconElement}
                {iconOnly || (!children && !label) ? null : (
                    <span
                        className={cx(
                            'button-content',
                            truncate ? 'truncate' : 'button-content-wrap'
                        )}
                    >
                        {children ?? label}
                    </span>
                )}
            </>
        );

        const button = href ? (
            <Link
                ref={ref as React.Ref<HTMLAnchorElement>}
                href={href}
                className={domClassName}
                insights={insights}
                aria-label={typeof label === 'string' ? label : undefined}
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
                className={domClassName}
                aria-label={typeof label === 'string' ? label : undefined}
                aria-pressed={active}
                disabled={disabled}
                data-active={active}
                {...rest}
            >
                {content}
                {trailing ? <span className="button-trailing-icon">{trailing}</span> : null}
            </button>
        );

        return (children || iconOnly) && label ? (
            <Tooltip label={label} disabled={disabled} {...tooltipProps}>
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
            className={cx(
                'flex h-fit items-stretch justify-start overflow-hidden',
                // Per-segment rounding lives in `globals.css`: Tailwind cannot express
                // "last button" once focus guards are injected.
                combinedShape && 'button-group',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
});
