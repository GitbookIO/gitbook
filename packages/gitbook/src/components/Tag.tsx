import type { RevisionTag } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { Emoji } from '@/components/primitives';
import { cx } from '@/lib/classnames';
import { backgroundColorToStyle, textColorToStyle } from '@/lib/colors';

/**
 * Renders a tag, used to tag content like pages and blocks.
 */
export function Tag(props: { tag: RevisionTag; className?: string }) {
    const { tag, className } = props;
    const hasColor = tag.color !== 'default';

    return (
        <span
            data-tag=""
            title={tag.label}
            className={cx(
                'tag',
                hasColor
                    ? [backgroundColorToStyle[tag.color], textColorToStyle[tag.color]]
                    : 'tag-default',
                className
            )}
        >
            <TagIcon tag={tag} />
            <span className="truncate">{tag.label}</span>
        </span>
    );
}

/**
 * Renders the emoji or icon for a tag, if present.
 */
export function TagIcon(props: { tag: RevisionTag }) {
    const { tag } = props;

    if ('emoji' in tag) {
        return <Emoji code={tag.emoji} style="shrink-0" />;
    }

    if (tag.icon) {
        return <Icon icon={tag.icon as IconName} className="tag-icon" />;
    }

    return null;
}
