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
                    'flex h-full grow overflow-hidden bg-radial-[circle_at_bottom] from-primary to-50% to-transparent text-sm text-tint',
                    divProps.className
                )}
                ref={ref}
            >
                {children}
            </div>
        );
    }
);

export function EmbeddableFrameMain(props: React.ComponentProps<'div'>) {
    const { children, ...rest } = props;

    return (
        <div className="flex flex-1 flex-col overflow-hidden" {...rest}>
            {children}
        </div>
    );
}

export function EmbeddableFrameHeader(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return (
        <div className="relative z-10 flex not-hydrated:animate-blur-in-slow select-none items-center gap-2 px-4 py-2.5 text-tint-strong">
            {children}
        </div>
    );
}

export function EmbeddableFrameHeaderMain(props: {
    children: React.ReactNode;
}) {
    const { children } = props;

    return <div className="flex h-8 flex-1 flex-col justify-center">{children}</div>;
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
                'origin-left text-tint text-xs leading-none transition-all duration-500',
                className
            )}
        >
            {children}
        </div>
    );
}

export function EmbeddableFrameSidebar(props: { children: React.ReactNode }) {
    const { children } = props;

    return (
        <div className="flex w-15 shrink-0 origin-top not-hydrated:animate-blur-in-slow flex-col gap-2 overflow-hidden border-tint-solid/3 border-r bg-tint-solid/1 p-2 transition-all transition-discrete duration-300 empty:hidden empty:w-0 empty:px-0">
            {children}
        </div>
    );
}

export function EmbeddableFrameButtons(props: {
    className?: string;
    children: React.ReactNode;
}) {
    const { children, className } = props;

    return <div className={tcls('flex gap-2', className)}>{children}</div>;
}
