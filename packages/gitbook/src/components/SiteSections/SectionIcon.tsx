import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, cx } from '@/lib/classnames';

/**
 * Icon shown beside a section in the site section tabs.
 */
export function SectionIcon(props: { icon: IconName; isActive: boolean; className?: ClassValue }) {
    const { icon, isActive, className } = props;

    return (
        <Icon
            icon={icon}
            className={cx('section-icon', isActive && 'section-icon-active', className)}
        />
    );
}
