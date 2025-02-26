import { RevisionPage } from '@gitbook/api';
import { Icon, IconName } from '@gitbook/icons';

import { Emoji } from '@/components/primitives';
import { ClassValue, tcls } from '@/lib/tailwind';

export function PageIcon(props: { page: RevisionPage; style?: ClassValue }) {
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
        return <Icon icon={page.icon as IconName} className={tcls('size-[1em]', style)} />;
    }
}
