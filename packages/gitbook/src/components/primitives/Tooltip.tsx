'use client';

import { tcls } from '@/lib/tailwind';
import * as RadixTooltip from '@radix-ui/react-tooltip';

export function Tooltip(props: {
    children: React.ReactNode;
    label?: string | React.ReactNode;
    triggerProps?: RadixTooltip.TooltipTriggerProps;
    contentProps?: RadixTooltip.TooltipContentProps;
    rootProps?: RadixTooltip.TooltipProps;
    arrow?: boolean;
    className?: string;
}) {
    const {
        children,
        label,
        triggerProps,
        contentProps,
        rootProps,
        arrow = false,
        className,
    } = props;

    return (
        <RadixTooltip.Root delayDuration={300} {...rootProps}>
            <RadixTooltip.Trigger asChild {...triggerProps}>
                {children}
            </RadixTooltip.Trigger>
            <RadixTooltip.Portal>
                <RadixTooltip.Content
                    sideOffset={4}
                    className={tcls(
                        'z-50 max-w-xs animate-scale-in circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-12 px-2 py-1 text-contrast-tint-12 text-sm',
                        className
                    )}
                    {...contentProps}
                >
                    {label}
                    {arrow && <RadixTooltip.Arrow />}
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
}
