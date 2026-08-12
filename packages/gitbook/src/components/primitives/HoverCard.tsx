'use client';
import { tcls } from '@/lib/tailwind';
import { PreviewCard } from '@base-ui/react/preview-card';
import { PopupArrow } from './PopupArrow';

export function HoverCardRoot(props: PreviewCard.Root.Props) {
    return <PreviewCard.Root {...props} />;
}

// We wrap the Trigger child in a span to avoid the render prop seeing a lazy chunk
export function HoverCardTrigger(props: {
    children: React.ReactNode;
    className?: string;
    openDelay?: number;
    closeDelay?: number;
}) {
    const { children, className, openDelay = 200, closeDelay = 100 } = props;
    return (
        <PreviewCard.Trigger
            render={<span className={className} />}
            delay={openDelay}
            closeDelay={closeDelay}
        >
            {children}
        </PreviewCard.Trigger>
    );
}

export function HoverCard(
    props: Omit<PreviewCard.Popup.Props, 'className'> & {
        className?: string;
        side?: PreviewCard.Positioner.Props['side'];
        arrow?: { className?: string };
    }
) {
    const { arrow, side = 'top', className, children, ...popupProps } = props;
    return (
        <PreviewCard.Portal>
            <PreviewCard.Positioner
                side={side}
                className="pointer-events-none z-50 w-screen max-w-md px-4 sm:w-auto"
            >
                <PreviewCard.Popup
                    {...popupProps}
                    className="animate-scale-in data-closed:animate-scale-out"
                >
                    <div
                        className={tcls(
                            'overflow-hidden rounded-md straight-corners:rounded-none bg-tint-base shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1',
                            className
                        )}
                    >
                        {children}
                    </div>
                    <PopupArrow
                        arrow={PreviewCard.Arrow}
                        className={arrow?.className ?? 'fill-tint-1'}
                    />
                </PreviewCard.Popup>
            </PreviewCard.Positioner>
        </PreviewCard.Portal>
    );
}
