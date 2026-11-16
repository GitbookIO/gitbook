import { assertNever } from 'assert-never';
import { assert } from 'ts-essentials';

import type { DocumentBlockUpdate, DocumentBlockUpdates, TranslationLanguage } from '@gitbook/api';

import { Tag } from '../Tag';
import type { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { FilteredUpdate } from './UpdatesFilter';
import {
    getFullDateFormatter,
    getNumericDateFormatter,
    getShortDateFormatter,
} from '@/components/utils/dates';
import { cx } from '@/lib/classnames';
import { getRevisionTags, resolveBlockTags } from '@/lib/tags';
import { tcls } from '@/lib/tailwind';

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
    const dateFormatter = getDateFormatter(dateFormat, contextProps.context.contentContext?.locale);

    // Resolve tags from the block data using revision-level tag definitions
    const revisionTags = getRevisionTags(contextProps.context.contentContext?.revision);
    const resolvedTags = resolveBlockTags(block.data.tags, revisionTags);

    return (
        <FilteredUpdate
            tagSlugs={resolvedTags.map((tag) => tag.slug)}
            className={cx('update-block', tcls(style))}
        >
            <div className="update-block-aside">
                <time
                    // Adding a dateTime attribute for accessibility (and SEO)
                    dateTime={date}
                    className="update-block-date"
                >
                    {dateFormatter.format(parsedDate)}
                </time>
                {resolvedTags.length > 0 ? (
                    <div className="update-block-tags">
                        {resolvedTags.map((tag) => (
                            <Tag key={tag.slug} tag={tag} />
                        ))}
                    </div>
                ) : null}
            </div>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                style="update-block-body"
            />
        </FilteredUpdate>
    );
}

function getDateFormatter(
    format: 'numeric' | 'full' | 'short',
    locale: TranslationLanguage | undefined
) {
    switch (format) {
        case 'short':
            return getShortDateFormatter(locale);
        case 'numeric':
            return getNumericDateFormatter(locale);
        case 'full':
            return getFullDateFormatter(locale);
        default:
            assertNever(format);
    }
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
