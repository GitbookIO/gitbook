import { tcls } from '@/lib/tailwind';
import IconChevronDown from '@geist-ui/icons/chevronDown';
import Link from 'next/link';
import { DetailedHTMLProps, HTMLAttributes, useId } from 'react';

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
}) {
    const { button, children } = props;
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
                )}
            >
                <div
                    className={tcls(
                        'mt-3',
                        'w-52',
                        'max-h-56',
                        'bg-white',
                        'rounded',
                        'p-2',
                        'shadow-lg',
                        'overflow-auto',
                        'ring-1',
                        'ring-black',
                        'ring-opacity-5',
                        'focus:outline-none',
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
        <IconChevronDown
            className={tcls(
                'w-4',
                'h-4',
                'ms-2',
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
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'text-sm',
                'text-slate-600',
                'px-3',
                'py-1',
                'rounded',
                active ? ['bg-primary-50'] : ['hover:bg-slate-100'],
            )}
        >
            {children}
        </Link>
    );
}
