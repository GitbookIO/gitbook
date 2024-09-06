import { Icon } from '@gitbook/icons';
import { DetailedHTMLProps, HTMLAttributes, useId } from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { Link } from '../primitives';

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
        <div className={tcls('group/dropdown', 'relative')}>
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
                    'max-h-56',
                    'flex',
                    'absolute',
                    'top-full',
                    'left-0',
                    'z-10',
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
                        'bg-light',
                        'rounded-lg',
                        'straight-corners:rounded-sm',
                        'p-2',
                        'shadow-1xs',
                        'overflow-auto',
                        'ring-1',
                        'ring-dark/1',
                        'ring-opacity-8',
                        'focus:outline-none',
                        'dark:bg-dark',
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
export function DropdownChevron(props: {}) {
    return (
        <Icon
            icon="chevron-down"
            className={tcls(
                'opacity-6',
                'size-3',
                'ms-1',
                'transition-transform',
                'group-hover/dropdown:rotate-180',
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
export function DropdownMenuItem(props: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    const { children, active = false, href } = props;

    return (
        <Link
            href={href}
            prefetch={false}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'text-sm',
                'px-3',
                'py-1',
                'rounded',
                'straight-corners:rounded-sm',
                active
                    ? ['bg-primary/3', 'dark:bg-light/2', 'text-primary-600']
                    : ['hover:bg-dark/2', 'dark:hover:bg-light/2'],
            )}
        >
            {children}
        </Link>
    );
}
