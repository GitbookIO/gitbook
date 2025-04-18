import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Icon shown beside a section in the site section tabs.
 */
export function SectionIcon(props: { icon: IconName; isActive: boolean; className?: ClassValue }) {
    const { icon, isActive, className } = props;

    return (
        <Icon
            icon={icon}
            className={tcls(
                'size-[1em] shrink-0 text-inherit opacity-8',
                isActive && 'text-inherit opacity-10',
                className
            )}
        />
    );
}
