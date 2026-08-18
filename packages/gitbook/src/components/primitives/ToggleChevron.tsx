import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Animated chevron to display in dropdowns and other toggleable elements. Picks up the open state
 * from the enclosing `group/dropdown` or `<details>`, unless an `open` prop is passed.
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
            autoAnimation:
                'group-data-popup-open/dropdown:rotate-180 group-data-panel-open/dropdown:rotate-180 group-open:rotate-180',
        },
        'right-to-down': {
            icon: 'chevron-right',
            animation: 'rotate-90',
            autoAnimation:
                'group-data-popup-open/dropdown:rotate-90 group-data-panel-open/dropdown:rotate-90 group-open:rotate-90',
        },
    };

    return (
        <Icon
            icon={classes[orientation].icon as IconName}
            className={tcls(
                'shrink-0',
                getRotationClassName(open, classes[orientation]),
                'size-3',
                'transition-all',
                className
            )}
        />
    );
}

function getRotationClassName(
    open: boolean | undefined,
    classes: { animation: string; autoAnimation: string }
): string {
    if (open === undefined) {
        return classes.autoAnimation;
    }
    if (open) {
        return classes.animation;
    }
    return '';
}
