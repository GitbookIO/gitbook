import { tcls } from '@/lib/tailwind';
import * as RadixPopover from '@radix-ui/react-popover';

export function Popover(props: {
    children: React.ReactNode;
    content?: string | React.ReactNode;
    rootProps?: RadixPopover.PopoverProps;
    triggerProps?: RadixPopover.PopoverTriggerProps;
    contentProps?: RadixPopover.PopoverContentProps;
    arrow?: boolean;
}) {
    const { children, content, rootProps, triggerProps, contentProps, arrow = false } = props;

    return (
        <RadixPopover.Root {...rootProps}>
            <RadixPopover.Trigger {...triggerProps}>{children}</RadixPopover.Trigger>
            <RadixPopover.Portal>
                <RadixPopover.Content
                    {...contentProps}
                    collisionPadding={contentProps?.collisionPadding ?? 16}
                    sideOffset={contentProps?.sideOffset ?? 4}
                    className={tcls(
                        'z-50 max-h-(--radix-popover-content-available-height) max-w-xs animate-scale-in overflow-y-auto overflow-x-hidden circular-corners:rounded-3xl rounded-corners:rounded-md bg-tint px-4 py-3 text-sm text-tint depth-subtle:shadow-lg shadow-tint outline-hidden ring-1 ring-tint transition-all empty:hidden',
                        contentProps?.className
                    )}
                    style={{
                        ...contentProps?.style,
                    }}
                >
                    {content}
                    {arrow && (
                        <RadixPopover.Arrow className="-mb-px h-2 w-4 fill-tint-3 stroke-2 stroke-tint-7" />
                    )}
                </RadixPopover.Content>
            </RadixPopover.Portal>
        </RadixPopover.Root>
    );
}
