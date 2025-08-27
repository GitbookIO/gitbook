import { tcls } from '@/lib/tailwind';
import React from 'react';

export type EmbeddableFrameProps = React.ComponentProps<'div'> & {
    children: React.ReactNode;
};

/**
 * Presentation component to display an embeddable frame.
 * It is used for the AI chat window in the docs, but also when embedded in another website.
 */
export const EmbeddableFrame = React.forwardRef<HTMLDivElement, EmbeddableFrameProps>(
    (props, ref) => {
        const { children, ...divProps } = props;

        return (
            <div
                {...divProps}
                className={tcls(
                    'flex h-full grow animate-fade-in-slow flex-col overflow-hidden bg-tint-base text-sm text-tint',
                    divProps.className
                )}
                ref={ref}
            >
                {children}
            </div>
        );
    }
);

export function EmbeddableFrameHeader(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return (
        <div className="flex select-none items-center gap-2 border-tint-subtle border-b bg-tint-subtle px-4 py-2 text-tint-strong">
            {children}
        </div>
    );
}

export function EmbeddableFrameHeaderMain(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return <div className="flex flex-1 flex-col">{children}</div>;
}

export function EmbeddableFrameBody(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
}

export function EmbeddableFrameTitle(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return <div className="font-bold">{children}</div>;
}

export function EmbeddableFrameSubtitle(props: {
    children: React.ReactNode;
    className?: string;
}) {
    const { children, className } = props;

    return (
        <div
            className={tcls(
                'text-tint text-xs leading-none transition-all duration-500',
                className
            )}
        >
            {children}
        </div>
    );
}

export function EmbeddableFrameButtons(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return <div className="ml-auto flex gap-2">{children}</div>;
}
