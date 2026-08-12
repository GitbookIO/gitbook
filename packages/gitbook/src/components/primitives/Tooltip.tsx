'use client';

import { tcls } from '@/lib/tailwind';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { PopupArrow } from './PopupArrow';

export type TooltipProps = {
    /** Side of the trigger the tooltip is displayed on. */
    side?: BaseTooltip.Positioner.Props['side'];
    /** Alignment of the tooltip relative to the trigger. */
    align?: BaseTooltip.Positioner.Props['align'];
    /** Distance between the trigger and the tooltip. */
    sideOffset?: number;
    /** Delay before opening on hover, overriding the shared provider delay. */
    delay?: number;
    /** Prevent the tooltip from opening at all. */
    disabled?: boolean;
    /** Let the tooltip close as soon as the trigger is left, instead of staying alive while the pointer travels towards it. */
    disableHoverablePopup?: boolean;
    /** Custom props for the popup itself. */
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
        popupProps,
        arrow = false,
        className,
    } = props;

    return (
        <BaseTooltip.Root disabled={disabled} disableHoverablePopup={disableHoverablePopup}>
            <BaseTooltip.Trigger render={children} delay={delay} />
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
