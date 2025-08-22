'use client';
import { tcls } from '@/lib/tailwind';
import * as RadixHoverCard from '@radix-ui/react-hover-card';

export function HoverCardRoot(props: RadixHoverCard.HoverCardProps) {
    return (
        <RadixHoverCard.Root
            openDelay={props.openDelay ?? 200}
            closeDelay={props.closeDelay ?? 100}
            {...props}
        />
    );
}

export function HoverCardTrigger(props: RadixHoverCard.HoverCardTriggerProps) {
    return (
        <RadixHoverCard.Trigger asChild {...props}>
            {props.children}
        </RadixHoverCard.Trigger>
    );
}

export function HoverCard(
    props: RadixHoverCard.HoverCardContentProps & { arrow?: RadixHoverCard.HoverCardArrowProps }
) {
    const { arrow, ...cardProps } = props;
    return (
        <RadixHoverCard.Portal>
            <RadixHoverCard.Content
                side={props.side ?? 'top'}
                className="z-40 w-screen max-w-md animate-present px-4 sm:w-auto"
            >
                <div
                    className={tcls(
                        'overflow-hidden rounded-md straight-corners:rounded-none bg-tint-base shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1',
                        cardProps.className
                    )}
                >
                    {cardProps.children}
                </div>
                <RadixHoverCard.Arrow
                    className={tcls('fill-tint-1', arrow?.className)}
                    {...arrow}
                />
            </RadixHoverCard.Content>
        </RadixHoverCard.Portal>
    );
}
