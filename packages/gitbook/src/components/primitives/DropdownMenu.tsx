'use client';

import { Icon } from '@gitbook/icons';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useState } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { Link, type LinkInsightsProps } from '.';

export type DropdownButtonProps<E extends HTMLElement = HTMLElement> = Omit<
    Partial<DetailedHTMLProps<HTMLAttributes<E>, E>>,
    'ref'
>;

/**
 * Button with a dropdown.
 */
export function DropdownMenu(props: {
    /** Content of the button */
    button: React.ReactNode;
    /** Content of the dropdown */
    children: React.ReactNode;
    /** Custom styles */
    className?: ClassValue;
    /** Open the dropdown on hover */
    openOnHover?: boolean;
    /**
     * Side of the dropdown
     * @default "bottom"
     */
    side?: RadixDropdownMenu.DropdownMenuContentProps['side'];
    /**
     * Alignment of the dropdown
     * @default "start"
     */
    align?: RadixDropdownMenu.DropdownMenuContentProps['align'];
}) {
    const {
        button,
        children,
        className,
        openOnHover = false,
        side = 'bottom',
        align = 'start',
    } = props;
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    return (
        <RadixDropdownMenu.Root
            modal={false}
            open={openOnHover ? clicked || hovered : clicked}
            onOpenChange={setClicked}
        >
            <RadixDropdownMenu.Trigger
                asChild
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => (openOnHover ? setClicked(!clicked) : null)}
                className="group/dropdown"
            >
                {button}
            </RadixDropdownMenu.Trigger>

            <RadixDropdownMenu.Portal>
                <RadixDropdownMenu.Content
                    data-testid="dropdown-menu"
                    hideWhenDetached
                    collisionPadding={8}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    align={align}
                    side={side}
                    className="z-40 animate-scaleIn pt-2"
                >
                    <div
                        className={tcls(
                            'flex max-h-80 min-w-40 max-w-[40vw] flex-col gap-1 overflow-auto rounded-lg straight-corners:rounded-sm bg-tint-base p-2 shadow-lg ring-1 ring-tint-subtle sm:min-w-52 sm:max-w-80',
                            className
                        )}
                    >
                        {children}
                    </div>
                </RadixDropdownMenu.Content>
            </RadixDropdownMenu.Portal>
        </RadixDropdownMenu.Root>
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
                'group-data-[state=open]/dropdown:opacity-11',
                'group-data-[state=open]/dropdown:rotate-180'
            )}
        />
    );
}

/**
 * Button with a chevron for use in dropdowns.
 */
export function DropdownButton(props: {
    children: React.ReactNode;
    className?: ClassValue;
}) {
    const { children, className } = props;

    return (
        <div className={tcls('group/dropdown', 'flex', 'items-center', className)}>
            {children}
            <DropdownChevron />
        </div>
    );
}

/**
 * Menu item in a dropdown.
 */
export function DropdownMenuItem(
    props: {
        href?: string;
        active?: boolean;
        className?: ClassValue;
        children: React.ReactNode;
    } & LinkInsightsProps &
        RadixDropdownMenu.DropdownMenuItemProps
) {
    const { children, active = false, href, className, insights, ...rest } = props;

    const itemClassName = tcls(
        'rounded straight-corners:rounded-sm px-3 py-1 text-sm flex gap-2 items-center',
        active
            ? 'bg-primary text-primary-strong data-[highlighted]:bg-primary-hover'
            : 'data-[highlighted]:bg-tint-hover',
        'focus:outline-none',
        props.disabled ? 'opacity-7 cursor-not-allowed' : 'cursor-pointer',
        className
    );

    if (href) {
        return (
            <RadixDropdownMenu.Item {...rest} asChild>
                <Link href={href} insights={insights} className={itemClassName}>
                    {children}
                </Link>
            </RadixDropdownMenu.Item>
        );
    }

    return (
        <RadixDropdownMenu.Item {...rest} className={tcls('px-3 py-1', itemClassName, className)}>
            {children}
        </RadixDropdownMenu.Item>
    );
}

export function DropdownSubMenu(props: { children: React.ReactNode; label: React.ReactNode }) {
    const { children, label } = props;

    return (
        <RadixDropdownMenu.Sub>
            <RadixDropdownMenu.SubTrigger className="flex cursor-pointer items-center justify-between rounded straight-corners:rounded-sm px-3 py-1 text-sm focus:outline-none data-[highlighted]:bg-tint-hover">
                {label}
                <Icon icon="chevron-right" className="size-3 shrink-0 opacity-6" />
            </RadixDropdownMenu.SubTrigger>
            <RadixDropdownMenu.Portal>
                <RadixDropdownMenu.SubContent
                    hideWhenDetached
                    collisionPadding={8}
                    className="z-40 animate-present"
                >
                    <div className="flex max-h-80 min-w-40 max-w-[40vw] flex-col gap-1 overflow-auto rounded-lg straight-corners:rounded-sm bg-tint-base p-2 shadow-lg ring-1 ring-tint-subtle sm:min-w-52 sm:max-w-80">
                        {children}
                    </div>
                </RadixDropdownMenu.SubContent>
            </RadixDropdownMenu.Portal>
        </RadixDropdownMenu.Sub>
    );
}
