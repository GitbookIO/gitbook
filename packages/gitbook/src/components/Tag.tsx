import { Emoji } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import type { RevisionTag } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

/**
 * Renders a tag, used to tag content like pages and blocks.
 */
export function Tag(props: { tag: RevisionTag; className?: string }) {
    const { tag, className } = props;

    return (
        <span
            data-tag=""
            title={tag.label}
            className={tcls(
                'inline-flex items-center gap-1 rounded-full bg-tint-5 px-2 py-1 font-medium text-tint-strong text-xs leading-normal contrast-more:ring-1 contrast-more:ring-tint',
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
function TagIcon(props: { tag: RevisionTag }) {
    const { tag } = props;

    if ('emoji' in tag) {
        return <Emoji code={tag.emoji} style="shrink-0" />;
    }

    if (tag.icon) {
        return <Icon icon={tag.icon as IconName} className={tcls('size-[1em]', 'shrink-0')} />;
    }

    return null;
}
