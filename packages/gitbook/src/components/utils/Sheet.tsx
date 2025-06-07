'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import type * as React from 'react';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';

export function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            data-slot="sheet-overlay"
            className={tcls(
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-tint-12/4 backdrop-blur-lg data-[state=closed]:animate-out data-[state=open]:animate-in dark:bg-tint-1/6',
                className
            )}
            {...props}
        />
    );
}

export function SheetContent({
    className,
    overlayClassName,
    children,
    side = 'left',
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
    overlayClassName?: string;
    side?: 'right' | 'left';
}) {
    return (
        <>
            <SheetOverlay className={overlayClassName} />
            <SheetPrimitive.Content
                data-slot="sheet-content"
                className={tcls(
                    'fixed z-50 flex flex-col shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
                    'bg-tint-base theme-gradient-tint:bg-gradient-tint theme-gradient:bg-gradient-primary theme-muted:bg-tint-subtle [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    'border-tint-subtle',
                    'inset-x-0 inset-y-1 w-10/12 rounded-xl border sm:max-w-sm',
                    side === 'right' &&
                        'right-1 data-[state=closed]:animate-exitToRight data-[state=open]:animate-enterFromRight',
                    side === 'left' &&
                        'left-1 data-[state=closed]:animate-exitToLeft data-[state=open]:animate-enterFromLeft',
                    className
                )}
                {...props}
            >
                {children}
                <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none">
                    <Icon icon="close" className="size-4 text-tint-subtle" />
                    <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </>
    );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={tcls('flex flex-col gap-1.5 p-4', className)}
            {...props}
        />
    );
}

export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-footer"
            className={tcls('mt-auto flex flex-col gap-2 p-4', className)}
            {...props}
        />
    );
}

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
