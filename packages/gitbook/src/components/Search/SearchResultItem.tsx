import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import * as React from 'react';
import { Button } from '../primitives';
import { Link, type LinkInsightsProps } from '../primitives/Link';

export const SearchResultItem = React.forwardRef(function SearchResultItem(
    props: {
        children: React.ReactNode;
        href: string;
        action: string;
        active: boolean;
        className?: string;
        size?: 'small' | 'medium';
        leadingIcon?: React.ReactNode;
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
        ...rest
    } = props;

    return (
        <Link
            ref={ref}
            href={href}
            className={tcls(
                'flex',
                'items-center',
                'gap-3',
                'group',
                'px-4',
                size === 'small' ? 'py-1.5' : 'py-3',
                'text-tint',
                'hover:bg-tint',
                'hover:text-tint-strong',
                'group',
                'transition-colors',
                'rounded-corners:rounded-md',
                'circular-corners:rounded-2xl',
                active
                    ? ['is-active', 'bg-primary', 'text-primary-strong', 'hover:bg-primary']
                    : null,
                className
            )}
            role="option"
            {...rest}
        >
            <div className="size-4 shrink-0 text-tint-subtle">
                {typeof leadingIcon === 'string' ? (
                    <Icon icon={leadingIcon as IconName} className="size-4" />
                ) : (
                    leadingIcon
                )}
            </div>
            <div className="grow">{children}</div>
            {active ? (
                <Button label={action} iconOnly variant="primary" icon="arrow-turn-down-left" />
            ) : (
                <div className="flex size-8 shrink-0 items-center justify-center text-tint-subtle">
                    <Icon icon="chevron-right" className="size-3" />
                </div>
            )}
        </Link>
    );
});
