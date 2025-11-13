import { formatDateFull, formatDateShort, formatNumericDate } from '@/components/utils/dates';
import { tcls } from '@/lib/tailwind';
import type { DocumentBlockUpdate, DocumentBlockUpdates } from '@gitbook/api';
import { assert } from 'ts-essentials';
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

    const isSticky = parentUpdates.data.sticky;

    return (
        <div
            className={tcls(
                'relative flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-12 xl:gap-20',
                style
            )}
        >
            <div
                className={tcls(
                    'h-fit w-40 min-w-40 shrink-0',
                    // Date is sticky on larger screens & if enabled on the parent Updates block
                    isSticky && 'md:sticky md:top-[calc(var(--toc-top-offset)+8px)]!'
                )}
            >
                <time
                    // Adding a dateTime attribute for accessibility (and SEO)
                    dateTime={date}
                    className="inline-flex items-center font-medium text-neutral-10 text-sm tracking-wide"
                >
                    {displayDate}
                </time>
            </div>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                // Remove padding-top from headings when they're the first child (similar to column-first-of-type pattern)
                style="[&>*:first-child]:!pt-0 flex-1 space-y-4"
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
