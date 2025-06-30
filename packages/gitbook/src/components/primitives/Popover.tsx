import { tcls } from '@/lib/tailwind';
import * as RadixPopover from '@radix-ui/react-popover';

export function Popover(props: {
    children: React.ReactNode;
    content?: string | React.ReactNode;
    triggerProps?: RadixPopover.PopoverTriggerProps;
    contentProps?: RadixPopover.PopoverContentProps;
    arrow?: boolean;
    className?: string;
}) {
    const { children, content, triggerProps, contentProps, arrow = false, className } = props;

    return (
        <RadixPopover.Root>
            <RadixPopover.Trigger asChild {...triggerProps}>
                {children}
            </RadixPopover.Trigger>
            <RadixPopover.Portal>
                <RadixPopover.Content
                    collisionPadding={16}
                    sideOffset={4}
                    className={tcls(
                        'z-50 max-w-xs animate-scaleIn overflow-y-auto circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint px-4 py-3 text-sm text-tint shadow-md outline-none ring-1 ring-tint',
                        className
                    )}
                    style={{
                        maxHeight: 'var(--radix-popover-content-available-height)',
                    }}
                    {...contentProps}
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
