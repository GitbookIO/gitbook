'use client';

import { tcls } from '@/lib/tailwind';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';

export function Collapsible(
    props: Omit<BaseCollapsible.Root.Props, 'className'> & {
        children: React.ReactNode;
        className?: string;
    }
) {
    const { children, className, ...rest } = props;

    return (
        <BaseCollapsible.Root {...rest} className={tcls('group/collapsible', className)}>
            {children}
        </BaseCollapsible.Root>
    );
}

export function CollapsibleTrigger(
    props: BaseCollapsible.Trigger.Props & {
        children?: React.ReactNode;
    }
) {
    return <BaseCollapsible.Trigger {...props} />;
}

export function CollapsibleContent(
    props: Omit<BaseCollapsible.Panel.Props, 'className'> & {
        children: React.ReactNode;
        className?: string;
    }
) {
    const { children, className, ...rest } = props;
    return (
        <BaseCollapsible.Panel
            {...rest}
            className={tcls(
                'data-closed:animate-[blurOut_300ms,heightOut_300ms] data-open:animate-[blurIn_300ms,heightIn_300ms]',
                className
            )}
        >
            {children}
        </BaseCollapsible.Panel>
    );
}
