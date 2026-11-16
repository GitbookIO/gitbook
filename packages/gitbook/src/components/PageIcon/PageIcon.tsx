import type { RevisionPage } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { Emoji } from '@/components/primitives';
import { type ClassValue, cx } from '@/lib/classnames';

export function PageIcon(props: {
    page: Pick<RevisionPage, 'emoji' | 'icon'>;
    style?: ClassValue;
}) {
    const { page, style } = props;

    if (page.emoji) {
        return (
            <Emoji
                code={page.emoji}
                style={[
                    style,
                    // We reset the color that could be passed as "style"
                    // as emojis should always be rendered with normal text opacity
                    'text-inherit',
                ]}
            />
        );
    }

    if (page.icon) {
        return <Icon icon={page.icon as IconName} className={cx('page-icon', style)} />;
    }

    return null;
}
