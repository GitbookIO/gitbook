'use client';
import { tcls } from '@/lib/tailwind';
import * as Tooltip from '@radix-ui/react-tooltip';

export function HoverCardRoot(props: Tooltip.TooltipProps) {
    return <Tooltip.Root delayDuration={200} {...props} />;
}

export function HoverCardTrigger(props: { children: React.ReactNode }) {
    return <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>;
}

export function HoverCard(props: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Tooltip.Portal>
            <Tooltip.Content className="z-40 w-screen max-w-md animate-present px-4 sm:w-auto">
                <div
                    className={tcls(
                        'overflow-hidden rounded-md straight-corners:rounded-none bg-tint-base shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1',
                        props.className
                    )}
                >
                    {props.children}
                </div>
                <Tooltip.Arrow className="fill-tint-1" />
            </Tooltip.Content>
        </Tooltip.Portal>
    );
}
