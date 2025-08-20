import { tcls } from '@/lib/tailwind';
import React from 'react';

export type EmbeddableFrameHeaderProps = {
    icon: React.ReactNode;

    title: string;
    subtitle?: string;

    buttons?: React.ReactNode;
};

export type EmbeddableFrameProps = EmbeddableFrameHeaderProps &
    React.ComponentProps<'div'> & {
        children: React.ReactNode;
    };

/**
 * Presentation component to display an embeddable frame.
 * It is used for the AI chat window in the docs, but also when embedded in another website.
 */
export const EmbeddableFrame = React.forwardRef<HTMLDivElement, EmbeddableFrameProps>(
    (props, ref) => {
        const { icon, title, subtitle, buttons, children, ...divProps } = props;

        return (
            <div
                {...divProps}
                className={tcls(
                    'flex h-full grow flex-col overflow-hidden bg-tint-base text-sm text-tint',
                    divProps.className
                )}
                ref={ref}
            >
                <div className="flex select-none items-center gap-2 border-tint-subtle border-b bg-tint-subtle px-4 py-2 text-tint-strong">
                    {icon}
                    <div className="flex flex-col">
                        <div className="font-bold">{title}</div>
                        <div
                            className={`text-tint text-xs leading-none transition-all duration-500 ${
                                subtitle ? 'h-3 opacity-11' : 'h-0 opacity-0'
                            }`}
                        >
                            {subtitle}
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2">{buttons}</div>
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
            </div>
        );
    }
);
