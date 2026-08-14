'use client';

import { Menu } from '@base-ui/react/menu';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { assert } from 'ts-essentials';

import { Icon, type IconName } from '@gitbook/icons';

import { Link, type LinkInsightsProps } from '.';
import { ToggleChevron } from './ToggleChevron';
import { Tooltip } from './Tooltip';
import { type ClassValue, tcls } from '@/lib/tailwind';

export type DropdownButtonProps<E extends HTMLElement = HTMLElement> = Omit<
    Partial<DetailedHTMLProps<HTMLAttributes<E>, E>>,
    'ref'
>;

const DropdownMenuContext = createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({
    open: false,
    setOpen: () => {},
});

const DROPDOWN_POSITIONER_CLASS =
    'z-50 flex max-h-(--available-height) min-w-28 xs:min-w-40 max-w-(--available-width) flex-col pt-2 outline-hidden data-anchor-hidden:hidden';
// The exit animation has to live on the popup: Base UI keeps it mounted until *its* animations end.
const DROPDOWN_POPUP_CLASS =
    'flex origin-(--transform-origin) animate-scale-in flex-col gap-1 overflow-auto circular-corners:rounded-xl rounded-md straight-corners:rounded-none border border-tint bg-tint-base p-2 shadow-lg outline-hidden data-closed:animate-scale-out';

const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Button with a dropdown.
 */
export function DropdownMenu(props: {
    /** Content of the button */
    button: React.ReactElement<Record<string, unknown>>;
    /** Tooltip label for the button */
    buttonTooltip?: React.ReactNode;
    /** Content of the dropdown */
    children: React.ReactNode;
    /** Custom styles */
    className?: ClassValue;
    /** Open the dropdown on hover */
    openOnHover?: boolean;
    /**
     * Delay in milliseconds before the dropdown opens on hover. Only applies with `openOnHover`.
     * @default 0
     */
    openDelay?: number;
    nativeButton?: boolean;
    /**
     * Side of the dropdown
     * @default "bottom"
     */
    side?: Menu.Positioner.Props['side'];
    /**
     * Alignment of the dropdown
     * @default "start"
     */
    align?: Menu.Positioner.Props['align'];
    /**
     * Distance between the trigger and the dropdown.
     * @default 0
     */
    sideOffset?: Menu.Positioner.Props['sideOffset'];
}) {
    const {
        button,
        buttonTooltip,
        children,
        className,
        openOnHover = false,
        openDelay = 0,
        nativeButton,
        side = 'bottom',
        align = 'start',
        sideOffset = 0,
    } = props;
    const [open, setOpen] = useState(false);

    const trigger = (
        <Menu.Trigger
            render={button}
            nativeButton={nativeButton}
            openOnHover={openOnHover}
            delay={openDelay}
            closeDelay={HOVER_CLOSE_DELAY_MS}
            className="group/dropdown"
        />
    );

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <Menu.Root modal={false} open={open} onOpenChange={setOpen}>
                {buttonTooltip ? (
                    <Tooltip label={buttonTooltip} disableHoverablePopup>
                        {trigger}
                    </Tooltip>
                ) : (
                    trigger
                )}

                <Menu.Portal>
                    <Menu.Positioner
                        collisionPadding={8}
                        align={align}
                        side={side}
                        sideOffset={sideOffset}
                        className={DROPDOWN_POSITIONER_CLASS}
                    >
                        <Menu.Popup
                            data-testid="dropdown-menu"
                            className={tcls(DROPDOWN_POPUP_CLASS, className)}
                        >
                            {children}
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </DropdownMenuContext.Provider>
    );
}

/**
 * Button with a chevron for use in dropdowns.
 */
export function DropdownButton(props: { children: React.ReactNode; className?: ClassValue }) {
    const { children, className } = props;

    return (
        <div className={tcls('group/dropdown', 'flex', 'items-center', className)}>
            {children}
            <ToggleChevron />
        </div>
    );
}

/**
 * Menu item in a dropdown.
 */
export function DropdownMenuItem(
    props: {
        href?: string;
        target?: React.HTMLAttributeAnchorTarget;
        active?: boolean;
        className?: ClassValue;
        children: React.ReactNode;
        leadingIcon?: IconName | React.ReactNode;
    } & LinkInsightsProps &
        Omit<Menu.Item.Props, 'className' | 'render'>
) {
    const {
        children,
        active = false,
        href,
        className,
        insights,
        target,
        leadingIcon,
        ...rest
    } = props;

    const itemClassName = tcls(
        'rounded-sm straight-corners:rounded-none circular-corners:rounded-lg px-3 py-1 text-sm flex gap-2 items-center',
        active
            ? 'bg-primary text-primary-strong data-highlighted:bg-primary-hover'
            : 'data-highlighted:bg-tint-hover',
        'focus:outline-hidden',
        props.disabled ? 'opacity-7 cursor-not-allowed' : 'cursor-pointer',
        className
    );

    const icon = leadingIcon ? (
        typeof leadingIcon === 'string' ? (
            <Icon
                icon={leadingIcon as IconName}
                className={tcls('size-4 shrink-0', active ? 'text-primary' : 'text-tint-subtle')}
            />
        ) : (
            leadingIcon
        )
    ) : null;

    if (href) {
        return (
            <Menu.Item
                {...rest}
                className={itemClassName}
                render={<Link href={href} insights={insights} target={target} />}
            >
                {icon}
                {children}
            </Menu.Item>
        );
    }

    return (
        <Menu.Item {...rest} className={tcls('px-3 py-1', itemClassName, className)}>
            {icon}
            {children}
        </Menu.Item>
    );
}

export function DropdownSubMenu(props: { children: React.ReactNode; label: React.ReactNode }) {
    const { children, label } = props;

    return (
        <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger className="straight-corners:rounded-xs focus:outline-hidden data-highlighted:bg-tint-hover flex cursor-pointer items-center justify-between rounded-sm px-3 py-1 text-sm">
                {label}
                <Icon icon="chevron-right" className="size-3 shrink-0 opacity-6" />
            </Menu.SubmenuTrigger>
            <Menu.Portal>
                <Menu.Positioner collisionPadding={8} className={DROPDOWN_POSITIONER_CLASS}>
                    <Menu.Popup className={DROPDOWN_POPUP_CLASS}>{children}</Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.SubmenuRoot>
    );
}

export function DropdownMenuSeparator(props: { className?: ClassValue }) {
    const { className } = props;
    return (
        <Menu.Separator
            className={tcls('my-1 h-px w-full border-tint-subtle border-t', className)}
        />
    );
}

/**
 * Hook to close the dropdown menu.
 */
export function useDropdownMenuClose() {
    const context = useContext(DropdownMenuContext);
    assert(context, 'DropdownMenuContext not found');
    return useCallback(() => context.setOpen(false), [context]);
}
