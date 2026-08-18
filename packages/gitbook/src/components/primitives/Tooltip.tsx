'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useState } from 'react';

import { PopupArrow } from './PopupArrow';
import { tcls } from '@/lib/tailwind';

export type TooltipProps = {
    side?: BaseTooltip.Positioner.Props['side'];
    align?: BaseTooltip.Positioner.Props['align'];
    sideOffset?: number;
    delay?: number;
    disabled?: boolean;
    disableHoverablePopup?: boolean;
    pinOnClick?: boolean;
    popupProps?: Omit<BaseTooltip.Popup.Props, 'className' | 'children' | 'render'>;
};

export function Tooltip(
    props: TooltipProps & {
        children: React.ReactElement<Record<string, unknown>>;
        label?: string | React.ReactNode;
        arrow?: boolean | { className?: string };
        className?: string;
    }
) {
    const {
        children,
        label,
        side,
        align,
        sideOffset = 4,
        delay,
        disabled,
        disableHoverablePopup,
        pinOnClick = false,
        popupProps,
        arrow = false,
        className,
    } = props;

    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);

    return (
        <BaseTooltip.Root
            open={hovered || pinned}
            onOpenChange={(nextOpen, eventDetails) => {
                setHovered(nextOpen);
                if (
                    eventDetails.reason === 'outside-press' ||
                    eventDetails.reason === 'escape-key'
                ) {
                    setPinned(false);
                }
            }}
            disabled={disabled}
            disableHoverablePopup={disableHoverablePopup}
        >
            <BaseTooltip.Trigger
                render={children}
                delay={delay}
                onClick={pinOnClick ? () => setPinned(true) : undefined}
            />
            <BaseTooltip.Portal>
                <BaseTooltip.Positioner
                    className="z-50"
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    collisionPadding={8}
                >
                    <BaseTooltip.Popup
                        {...popupProps}
                        className={tcls(
                            'max-w-xs circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-12 px-2 py-1 text-contrast-tint-12 text-sm data-closed:animate-scale-out data-open:animate-scale-in',
                            className
                        )}
                    >
                        {label}
                        {arrow ? (
                            <PopupArrow
                                arrow={BaseTooltip.Arrow}
                                className={
                                    (typeof arrow === 'object' ? arrow.className : null) ??
                                    'fill-tint-12'
                                }
                            />
                        ) : null}
                    </BaseTooltip.Popup>
                </BaseTooltip.Positioner>
            </BaseTooltip.Portal>
        </BaseTooltip.Root>
    );
}
