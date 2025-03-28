import type { TooltipTriggerProps } from 'react-aria';
import { Button, type ButtonProps, Tooltip, TooltipTrigger } from 'react-aria-components';

function OpenAPITooltip(
    props: TooltipTriggerProps & {
        children: React.ReactNode;
        label: string;
    }
) {
    const { children, label } = props;

    return (
        <TooltipTrigger {...props}>
            {children}
            <Tooltip
                isOpen={props.isOpen}
                onOpenChange={props.onOpenChange}
                placement="top"
                offset={4}
                className="openapi-tooltip"
            >
                {label}
            </Tooltip>
        </TooltipTrigger>
    );
}

function OpenAPITooltipButton(props: ButtonProps) {
    return <Button {...props} type="button" />;
}

OpenAPITooltip.Button = OpenAPITooltipButton;

export { OpenAPITooltip };
