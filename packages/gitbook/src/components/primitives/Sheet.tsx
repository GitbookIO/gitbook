'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import type * as React from 'react';

import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

/**
 * Root component for the Sheet dialog.
 * Wraps the Radix UI Dialog.Root component and provides the context for the sheet dialog.
 *
 * @example
 * <Sheet>
 *   <SheetTrigger>Open</SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Title</SheetTitle>
 *       <SheetDescription>Description</SheetDescription>
 *     </SheetHeader>
 *   </SheetContent>
 * </Sheet>
 */
export function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/**
 * Trigger component that opens the sheet dialog.
 * Typically used as a button or other interactive element to open the sheet.
 */
export function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/**
 * Close component that closes the sheet dialog.
 * Can be used to create custom close buttons or triggers.
 */
export function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/**
 * Portal component that renders the sheet content outside the DOM hierarchy.
 * Ensures proper stacking context and accessibility.
 */
export function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

/**
 * Overlay component that creates a semi-transparent backdrop behind the sheet.
 * Includes blur effect and animation states for opening/closing.
 */
function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            data-slot="sheet-overlay"
            className={tcls(
                'fixed inset-0 z-30 bg-tint-12/4 backdrop-blur-lg data-[state=closed]:animate-fadeIn data-[state=closed]:animate-out data-[state=open]:animate-fadeOut data-[state=open]:animate-in dark:bg-tint-1/6',
                className
            )}
            {...props}
        />
    );
}

interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
    /**
     * The class name for the overlay component.
     */
    overlayClassName?: string;
    /**
     * The side the sheet slides in from.
     * @default 'left'
     */
    side?: 'right' | 'left';
}

/**
 * Main content component for the sheet dialog.
 * Handles positioning, animations, and styling of the sheet content.
 */
export function SheetContent(props: SheetContentProps) {
    const { overlayClassName, side = 'left', className, children, ...rest } = props;

    return (
        <SheetPortal>
            <SheetOverlay className={overlayClassName} />
            <SheetPrimitive.Content
                data-slot="sheet-content"
                className={tcls(
                    'fixed',
                    'z-30',
                    'flex',
                    'flex-col',
                    'shadow-lg',
                    'depth-flat:shadow-none',

                    'transition ease-in-out',
                    'data-[state=closed]:duration-300 data-[state=open]:duration-500',

                    'border',
                    'border-tint-subtle',

                    'inset-x-1.5',
                    'inset-y-1.5',

                    'w-10/12',
                    'sm:max-w-sm',

                    'bg-tint-base',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',

                    'rounded-xl',
                    'circular-corners:rounded-2xl',
                    'straight-corners:rounded-none',
                    side === 'right' &&
                        'right-1.5 data-[state=closed]:animate-exitToRight data-[state=open]:animate-enterFromRight',
                    side === 'left' &&
                        'left-1.5 data-[state=closed]:animate-exitToLeft data-[state=open]:animate-enterFromLeft',
                    className
                )}
                {...rest}
            >
                {children}

                <SheetClose asChild>
                    <Button
                        variant="secondary"
                        icon="close"
                        iconOnly
                        autoFocus={false}
                        className="absolute top-2 right-2 z-50 bg-transparent text-tint opacity-8 shadow-none ring-transparent"
                    >
                        <span className="sr-only">Close</span>
                    </Button>
                </SheetClose>
            </SheetPrimitive.Content>
        </SheetPortal>
    );
}

/**
 * Header component for the sheet dialog.
 * Provides consistent padding and layout for the sheet header area.
 */
export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={tcls('flex flex-col gap-1.5 p-4', className)}
            {...props}
        />
    );
}

/**
 * Title component for the sheet dialog.
 * Renders the main heading of the sheet with consistent styling.
 */
export function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            data-slot="sheet-title"
            className={tcls('font-semibold text-tint-default', className)}
            {...props}
        />
    );
}

/**
 * Description component for the sheet dialog.
 * Renders supplementary text or description with consistent styling.
 */
export function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
    return (
        <SheetPrimitive.Description
            data-slot="sheet-description"
            className={tcls('text-sm text-tint-weak', className)}
            {...props}
        />
    );
}
