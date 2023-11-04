import { tcls } from '@/lib/tailwind';
import IconChevronDown from '@geist-ui/icons/chevrondown';
import Link from 'next/link';

/**
 * Button with a dropdown.
 */
export function Dropdown(props: {
    /** Content of the button */
    children: React.ReactNode;
    /** Content of the dropdown */
    dropdown: React.ReactNode;
}) {
    const { children, dropdown } = props;

    return (
        <div className={tcls('group/dropdown', 'relative')}>
            {children}
            <div className={tcls('absolute', 'top-full', 'hidden', 'group-hover/dropdown:flex')}>
                <div
                    className={tcls(
                        'mt-3',
                        'w-52',
                        'max-h-56',
                        'bg-white',
                        'rounded',
                        'p-2',
                        'shadow',
                        'overflow-auto',
                    )}
                >
                    {dropdown}
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
