import { Popover as BasePopover } from '@base-ui/react/popover';

import { tcls } from '@/lib/tailwind';

export function Popover(props: {
    anchor: BasePopover.Positioner.Props['anchor'];
    content?: string | React.ReactNode;
    rootProps?: Omit<BasePopover.Root.Props, 'children'>;
    positionerProps?: Omit<BasePopover.Positioner.Props, 'children' | 'className' | 'anchor'> & {
        className?: string;
    };
    popupProps?: Omit<BasePopover.Popup.Props, 'children' | 'className'> & { className?: string };
}) {
    const { anchor, content, rootProps, positionerProps, popupProps } = props;

    return (
        <BasePopover.Root {...rootProps}>
            <BasePopover.Portal>
                <BasePopover.Positioner
                    {...positionerProps}
                    anchor={anchor}
                    className={tcls('z-50 data-anchor-hidden:hidden', positionerProps?.className)}
                    collisionPadding={positionerProps?.collisionPadding ?? 16}
                    sideOffset={positionerProps?.sideOffset ?? 4}
                >
                    <BasePopover.Popup
                        {...popupProps}
                        className={tcls(
                            'max-h-(--available-height) max-w-xs animate-scale-in overflow-y-auto overflow-x-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl bg-tint px-4 py-3 text-sm text-tint depth-subtle:shadow-xl shadow-tint-12/4 outline-hidden ring-1 ring-tint transition-all empty:hidden data-closed:animate-scale-out motion-reduce:transition-none dark:shadow-tint-1/6',
                            popupProps?.className
                        )}
                    >
                        {content}
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    );
}
