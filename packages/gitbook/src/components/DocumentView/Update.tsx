import { formatDateFull, formatDateShort, formatNumericDate } from '@/components/utils/dates';
import { getRevisionTags, resolveBlockTags } from '@/lib/tags';
import { tcls } from '@/lib/tailwind';
import type { DocumentBlockUpdate, DocumentBlockUpdates } from '@gitbook/api';
import { assert } from 'ts-essentials';
import { Tag } from '../Tag';
import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Update(props: BlockProps<DocumentBlockUpdate>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    // Get the parent Updates block to retrieve properties from
    const parentUpdates = ancestorBlocks.find(
        (ancestor): ancestor is DocumentBlockUpdates => ancestor.type === 'updates'
    );

    if (!parentUpdates) {
        assert(parentUpdates, 'Parent updates block should exist');
        return null;
    }

    // Get the date for this Update block and parse it to a Date object
    const date = block.data.date;
    const parsedDate = parseISODate(date);

    if (!parsedDate) {
        assert(date, 'Date should exist on Update block');
        return null;
    }

    // Then get the format from the parent Updates block and use that format
    const dateFormat = parentUpdates.data?.format ?? 'full';
    const displayDate = {
        numeric: formatNumericDate(parsedDate),
        full: formatDateFull(parsedDate),
        short: formatDateShort(parsedDate),
    }[dateFormat];

    // Resolve tags from the block data using revision-level tag definitions
    const revisionTags = getRevisionTags(contextProps.context.contentContext?.revision);
    const resolvedTags = resolveBlockTags(block.data.tags, revisionTags);

    return (
        <div className={tcls('relative flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-8', style)}>
            <div
                className={tcls(
                    // Date is only sticky on larger screens when we use flex-row layout, with 0px fallback to prevent flicker and flaky tests before JS sets the variable
                    'h-fit w-40 min-w-40 shrink-0 md:sticky md:top-[calc(var(--toc-top-offset,0px)+8px)]!'
                )}
            >
                <time
                    // Adding a dateTime attribute for accessibility (and SEO)
                    dateTime={date}
                    className="inline-flex items-center font-medium text-neutral-10 text-sm tracking-wide"
                >
                    {displayDate}
                </time>
                {resolvedTags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {resolvedTags.map((tag) => (
                            <Tag key={tag.slug} label={tag.label} />
                        ))}
                    </div>
                ) : null}
            </div>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                style="[&>*:first-child]:!pt-0 flex flex-1 flex-col [&>*+*]:mt-5"
            />
        </div>
    );
}

/**
 * Parse an ISO date string into a Date object.
 */
function parseISODate(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
