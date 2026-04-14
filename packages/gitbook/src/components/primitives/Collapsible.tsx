'use client';

import { tcls } from '@/lib/tailwind';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { useEffect, useState } from 'react';

export function Collapsible(
    props: {
        children: React.ReactNode;
    } & RadixCollapsible.CollapsibleProps
) {
    const { children, open, defaultOpen, className, ...rest } = props;

    useEffect(() => {
        setOpenState(props.open);
    }, [props.open]);

    const [openState, setOpenState] = useState(open);

    return (
        <RadixCollapsible.Root
            {...rest}
            className={tcls('group/collapsible', className)}
            open={openState}
            onOpenChange={setOpenState}
        >
            {children}
        </RadixCollapsible.Root>
    );
}

export function CollapsibleTrigger(
    props: {
        children: React.ReactNode;
    } & RadixCollapsible.CollapsibleTriggerProps
) {
    return (
        <RadixCollapsible.Trigger asChild {...props}>
            {props.children}
        </RadixCollapsible.Trigger>
    );
}

export function CollapsibleContent(
    props: {
        children: React.ReactNode;
    } & RadixCollapsible.CollapsibleContentProps
) {
    const { children, className, ...rest } = props;
    return (
        <RadixCollapsible.Content
            className={tcls(
                'data-[state=closed]:animate-[blurOut_300ms,heightOut_300ms] data-[state=open]:animate-[blurIn_300ms,heightIn_300ms]',
                className
            )}
            {...rest}
        >
            {children}
        </RadixCollapsible.Content>
    );
}
