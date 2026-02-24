import { tcls } from '@/lib/tailwind';
import type { RevisionTag } from '@gitbook/api';

/**
 * Renders a tag, used to tag content like pages and blocks.
 */
export function Tag(props: { label: RevisionTag['label']; className?: string }) {
    const { label, className } = props;

    return (
        <span
            data-tag=""
            title={label}
            className={tcls(
                'inline-flex items-center rounded-full bg-tint-5 px-2 py-1 font-medium text-tint-strong text-xs leading-normal contrast-more:ring-1 contrast-more:ring-tint',
                className
            )}
        >
            <span className="truncate">{label}</span>
        </span>
    );
}
