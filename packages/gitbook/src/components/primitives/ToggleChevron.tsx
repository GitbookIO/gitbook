import { Icon } from '@gitbook/icons';

import { type ClassValue, cx } from '@/lib/classnames';

/**
 * Animated chevron to display in dropdowns and other toggleable elements. Picks up the open state
 * from the enclosing `group/dropdown` or `<details>`, unless an `open` prop is passed.
 */
export function ToggleChevron(props: {
    open?: boolean;
    orientation?: 'down-to-up' | 'right-to-down'; // The direction of the chevron when open.
    className?: ClassValue;
}) {
    const { open, orientation = 'down-to-up', className = 'toggle-chevron-dim' } = props;
    const isDown = orientation === 'down-to-up';

    return (
        <Icon
            icon={isDown ? 'chevron-down' : 'chevron-right'}
            className={cx(
                'toggle-chevron',
                open === undefined
                    ? isDown
                        ? 'toggle-chevron-auto'
                        : 'toggle-chevron-auto-90'
                    : open && (isDown ? 'rotate-180' : 'rotate-90'),
                className
            )}
        />
    );
}
