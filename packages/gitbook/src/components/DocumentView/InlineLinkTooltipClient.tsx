'use client';
import * as Tooltip from '@radix-ui/react-tooltip';

export function InlineLinkTooltipClient(props: {
    trigger: React.ReactNode;
    children: React.ReactNode;
}) {
    const { trigger, children } = props;

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
                <Tooltip.Portal>{children}</Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
