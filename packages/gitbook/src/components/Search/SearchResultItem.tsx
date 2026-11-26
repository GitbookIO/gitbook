import * as React from 'react';

import { Icon, type IconName } from '@gitbook/icons';

import { Button } from '../primitives';
import { Link, type LinkInsightsProps } from '../primitives/Link';
import { tcls } from '@/lib/tailwind';

export const SearchResultItem = React.forwardRef(function SearchResultItem(
    props: {
        children: React.ReactNode;
        href: string;
        action: string;
        active: boolean;
        className?: string;
        size?: 'small' | 'medium';
        leadingIcon?: React.ReactNode;
        disabled?: boolean;
        /** Called when the mouse moves over the item, to make it the selected one. */
        onHover?: () => void;
    } & LinkInsightsProps &
        Omit<React.ComponentProps<typeof Link>, keyof LinkInsightsProps>,
    ref: React.Ref<HTMLAnchorElement>
) {
    const {
        children,
        href,
        active,
        className,
        leadingIcon,
        size = 'medium',
        action,
        disabled,
        onHover,
        ...rest
    } = props;

    return (
        <Link
            ref={ref}
            href={href ?? '#'}
            aria-disabled={disabled}
            // Only a real mouse move selects, so rows scrolling under a still pointer don't.
            onPointerMove={
                onHover && !active
                    ? (event: React.PointerEvent) => {
                          if (event.pointerType === 'mouse') {
                              onHover();
                          }
                      }
                    : undefined
            }
            className={tcls(
                'flex',
                'items-center',
                'gap-3',
                'group',
                'pl-3',
                'pr-2',
                'py-2',
                'text-tint',
                disabled ? ['pointer-events-none'] : null,
                'transition-colors',
                'rounded-corners:rounded-md',
                'circular-corners:rounded-2xl',
                active ? ['is-active', 'bg-primary', 'text-primary-strong'] : null,
                className
            )}
            role="option"
            {...rest}
        >
            {leadingIcon ? (
                <div className="size-4 shrink-0 text-tint-subtle">
                    {typeof leadingIcon === 'string' ? (
                        <Icon icon={leadingIcon as IconName} className="size-4" />
                    ) : (
                        leadingIcon
                    )}
                </div>
            ) : null}
            <div className="min-w-0 grow">{children}</div>
            {disabled ? null : active ? (
                <Button
                    label={action}
                    iconOnly
                    variant="primary"
                    size="xsmall"
                    icon="arrow-turn-down-left"
                    className="size-7"
                />
            ) : (
                <div className="flex size-7 shrink-0 items-center justify-center text-tint-subtle">
                    <Icon icon="chevron-right" className="size-3" />
                </div>
            )}
        </Link>
    );
});
