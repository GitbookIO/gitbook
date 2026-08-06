'use client';

import { Tooltip } from '@base-ui/react/tooltip';
import classNames from 'classnames';

export function OpenAPITooltip(props: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
}) {
    const { children, open, onOpenChange, disabled } = props;
    return (
        <Tooltip.Provider delay={200} closeDelay={200}>
            <Tooltip.Root
                open={open}
                onOpenChange={onOpenChange}
                disabled={disabled}
                // These are plain labels; keeping them alive while the pointer travels towards them
                // just makes them linger after the trigger is left.
                disableHoverablePopup
            >
                {children}
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}

// react-aria inferred the trigger from the first child; Base UI wants it declared.
function OpenAPITooltipTrigger(props: { render: React.ReactElement<Record<string, unknown>> }) {
    return <Tooltip.Trigger render={props.render} />;
}

function OpenAPITooltipContent(props: {
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
}) {
    const { children, className, side = 'top', sideOffset = 4 } = props;
    return (
        <Tooltip.Portal>
            <Tooltip.Positioner side={side} sideOffset={sideOffset}>
                <Tooltip.Popup className={classNames('openapi-tooltip', className)}>
                    {children}
                </Tooltip.Popup>
            </Tooltip.Positioner>
        </Tooltip.Portal>
    );
}

OpenAPITooltip.Trigger = OpenAPITooltipTrigger;
OpenAPITooltip.Content = OpenAPITooltipContent;
