import { Icon } from '@gitbook/icons';
import { DetailedHTMLProps, HTMLAttributes, useId } from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { Link, LinkInsightsProps } from '../primitives';

export type DropdownButtonProps<E extends HTMLElement = HTMLElement> = Omit<
    Partial<DetailedHTMLProps<HTMLAttributes<E>, E>>,
    'ref'
>;

/**
 * Button with a dropdown.
 */
export function Dropdown<E extends HTMLElement>(props: {
    /** Content of the button */
    button: (buttonProps: DropdownButtonProps<E>) => React.ReactNode;
    /** Content of the dropdown */
    children: React.ReactNode;
    /** Custom styles */
    className?: ClassValue;
}) {
    const { button, children, className } = props;
    const dropdownId = useId();

    return (
        <div className={tcls('group/dropdown', 'relative flex shrink min-w-0')}>
            {button({
                id: dropdownId,
                tabIndex: 0,
                'aria-expanded': true,
                'aria-haspopup': true,
            })}
            <div
                tabIndex={-1}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby={dropdownId}
                className={tcls(
                    'w-52',
                    'max-h-80',
                    'flex',
                    'absolute',
                    'top-full',
                    'left-0',
                    'z-20',
                    'origin-top-left',
                    'invisible',
                    'transition-opacity',
                    'duration-1000',
                    'group-hover/dropdown:visible',
                    'group-focus-within/dropdown:visible',
                    className,
                )}
            >
                <div
                    className={tcls(
                        'mt-2',
                        'w-full',
                        'bg-gray-base',
                        'rounded-lg',
                        'straight-corners:rounded-sm',
                        'p-2',
                        'shadow-1xs',
                        'overflow-auto',
                        'ring-1',
                        'ring-dark/1',
                        'ring-opacity-8',
                        'focus:outline-none',
                        'dark:ring-light/2',
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Animated chevron to display in the dropdown button.
 */
export function DropdownChevron() {
    return (
        <Icon
            icon="chevron-down"
            className={tcls(
                'shrink-0',
                'opacity-6',
                'size-3',
                'ms-1',
                'transition-all',
                'group-hover/dropdown:opacity-11',
                'group-focus-within/dropdown:rotate-180',
            )}
        />
    );
}

/**
 * Group of menu items in a dropdown.
 */
export function DropdownMenu(props: { children: React.ReactNode }) {
    const { children } = props;

    return <div className={tcls('flex', 'flex-col', 'gap-1')}>{children}</div>;
}

/**
 * Menu item in a dropdown.
 */
export function DropdownMenuItem(
    props: {
        href: string | null;
        active?: boolean;
        className?: ClassValue;
        children: React.ReactNode;
    } & LinkInsightsProps,
) {
    const { children, active = false, href, className, insights } = props;

    if (href) {
        return (
            <Link
                href={href}
                prefetch={false}
                insights={insights}
                className={tcls(
                    'px-3 py-1 text-sm rounded straight-corners:rounded-sm',
                    active ? 'bg-primary text-primary-strong' : null,
                    'hover:bg-gray-hover',
                    className,
                )}
            >
                {children}
            </Link>
        );
    }

    return (
        <div
            className={tcls(
                'text-xs px-3 py-1 font-medium text-dark/8 dark:text-light/8',
                className,
            )}
        >
            {children}
        </div>
    );
}
