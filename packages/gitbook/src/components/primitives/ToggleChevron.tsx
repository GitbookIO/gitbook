import { type ClassValue, tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';

/**
 * Animated chevron to display in dropdowns and other toggleable elements.
 * Uses the `data-[state=open]` attribute to animate the chevron, or you can pass it an `open` prop to control the state.
 */
export function ToggleChevron(props: {
    open?: boolean;
    orientation?: 'down-to-up' | 'right-to-down'; // The direction of the chevron when open.
    className?: ClassValue;
}) {
    const {
        open,
        orientation = 'down-to-up',
        className = 'opacity-6 group-hover/dropdown:opacity-11',
    } = props;

    const classes = {
        'down-to-up': {
            icon: 'chevron-down',
            animation: 'rotate-180',
            autoAnimation: 'group-data-[state=open]/dropdown:rotate-180 group-open:rotate-180',
        },
        'right-to-down': {
            icon: 'chevron-right',
            animation: 'rotate-90',
            autoAnimation: 'group-data-[state=open]/dropdown:rotate-90 group-open:rotate-90',
        },
    };

    return (
        <Icon
            icon={classes[orientation].icon as IconName}
            className={tcls(
                'shrink-0',
                open ? classes[orientation].animation : classes[orientation].autoAnimation,
                'size-3',
                'transition-all',
                className
            )}
        />
    );
}
