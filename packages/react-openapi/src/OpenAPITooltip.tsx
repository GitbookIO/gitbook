'use client';

import classNames from 'classnames';
import type { TooltipTriggerProps } from 'react-aria';
import { Tooltip, type TooltipProps, TooltipTrigger } from 'react-aria-components';

export function OpenAPITooltip(
    props: TooltipTriggerProps & {
        children: React.ReactNode;
    }
) {
    const { children, ...rest } = props;
    return (
        <TooltipTrigger {...rest} closeDelay={200} delay={200}>
            {children}
        </TooltipTrigger>
    );
}

function OpenAPITooltipContent(props: TooltipProps) {
    const { children, placement = 'top', offset = 4, className, ...rest } = props;
    return (
        <Tooltip
            {...rest}
            placement={placement}
            offset={offset}
            className={classNames('openapi-tooltip', className)}
        >
            {children}
        </Tooltip>
    );
}

OpenAPITooltip.Content = OpenAPITooltipContent;
