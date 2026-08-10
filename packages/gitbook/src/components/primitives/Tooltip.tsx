'use client';

import { tcls } from '@/lib/tailwind';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useState } from 'react';

export type TooltipProps = {
    rootProps?: RadixTooltip.TooltipProps;
    triggerProps?: RadixTooltip.TooltipTriggerProps;
    contentProps?: RadixTooltip.TooltipContentProps;
};

export function Tooltip(props: {
    children: React.ReactNode;
    label?: string | React.ReactNode;
    triggerProps?: RadixTooltip.TooltipTriggerProps;
    contentProps?: RadixTooltip.TooltipContentProps;
    portalProps?: RadixTooltip.TooltipPortalProps;
    rootProps?: RadixTooltip.TooltipProps;
    arrowProps?: RadixTooltip.TooltipArrowProps;
    arrow?: boolean;
    className?: string;
    pinOnClick?: boolean;
}) {
    const {
        children,
        label,
        triggerProps,
        contentProps,
        portalProps,
        rootProps,
        arrowProps,
        arrow = false,
        className,
        pinOnClick = true,
    } = props;

    const [open, setOpen] = useState(false);
    const [clicked, setClicked] = useState(false);

    // When hoverable content is disabled, the content is purely informational: make it
    // non-interactive so its (portaled) popper wrapper can't steal hover/clicks from the
    // trigger. The `data-non-interactive` marker lets a scoped global rule (globals.css)
    // set `pointer-events: none` on the wrapper, which we can't reach from React.
    const nonInteractive = rootProps?.disableHoverableContent ?? false;
    const resolvedContentProps = nonInteractive
        ? {
              ...contentProps,
              'data-non-interactive': '',
              style: {
                  ...contentProps?.style,
                  // Forced last so the non-interactive guarantee can't be overridden.
                  pointerEvents: 'none' as const,
                  userSelect: 'none' as const,
              },
          }
        : contentProps;

    return (
        <RadixTooltip.Root open={open || clicked} onOpenChange={setOpen} {...rootProps}>
            <RadixTooltip.Trigger
                asChild
                onClick={pinOnClick ? () => setClicked(true) : undefined}
                {...triggerProps}
            >
                {children}
            </RadixTooltip.Trigger>
            <RadixTooltip.Portal {...portalProps}>
                <RadixTooltip.Content
                    sideOffset={4}
                    collisionPadding={8}
                    className={tcls(
                        'z-50 max-w-xs circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-12 px-2 py-1 text-contrast-tint-12 text-sm data-[state$="closed"]:animate-scale-out data-[state$="open"]:animate-scale-in',
                        className
                    )}
                    onPointerDownOutside={() => setClicked(false)}
                    {...resolvedContentProps}
                >
                    {label}
                    {arrow && <RadixTooltip.Arrow {...arrowProps} />}
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
}
