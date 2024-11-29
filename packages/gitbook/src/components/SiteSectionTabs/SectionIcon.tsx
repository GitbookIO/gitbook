import type { SiteSection } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Icon shown beside a section in the site section tabs.
 */
export function SectionIcon(props: { icon: IconName; isActive: boolean }) {
    const { icon, isActive } = props;

    return (
        <Icon
            icon={icon}
            className={tcls(
                'size-[1em] text-inherit opacity-8',
                isActive && 'text-inherit opacity-10',
            )}
        />
    );
}
