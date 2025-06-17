'use client';
import * as Tooltip from '@radix-ui/react-tooltip';

export function InlineLinkTooltipClientImpl(props: {
    trigger: React.ReactNode;
    children: React.ReactNode;
}) {
    const { trigger, children } = props;

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="z-40 w-screen max-w-md animate-present px-4 sm:w-auto">
                        {children}
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
