import type { DocumentBlockHeading, DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Link } from '../primitives';
import type { DocumentContext } from './DocumentView';
import { getBlockTextStyle } from './spacing';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Whether blocks should render a visible anchor link icon.
 * Only the page body carries a page; search answers, AI chat and PDF export keep anchors.
 */
export function shouldShowHashLinks(context: DocumentContext): boolean {
    const contentContext = context.contentContext;
    if (!contentContext || !('page' in contentContext)) {
        return true;
    }
    return contentContext.page.layout.anchors !== false;
}

/**
 * A hash icon which adds the block or active block item's ID in the URL hash.
 * The button needs to be wrapped in a container with `hashLinkButtonWrapperStyles`.
 */
export const hashLinkButtonWrapperStyles = tcls('relative', 'group/hash');

export function HashLinkButton(props: {
    id: string;
    block: DocumentBlockTabs | DocumentBlockHeading;
    label: string;
    className?: ClassValue;
    iconClassName?: ClassValue;
}) {
    const { id, block, className, iconClassName, label } = props;
    const textStyle = getBlockTextStyle(block);

    return (
        <span
            className={tcls(
                'relative',
                'hash',
                'inline-grid',
                'grid-area-1-1',
                'pointer-fine:h-[1em]',
                'border-0',
                'opacity-0',
                'pointer-events-none',
                'site-background',
                'rounded',
                'transition-opacity',
                'pointer-fine:pointer-events-auto',
                'pointer-fine:group-hover/hash:opacity-100',
                'pointer-fine:group-focus-within/hash:opacity-100',
                '[.hash-revealed_&]:opacity-100',
                '[.hash-revealed_&]:pointer-events-auto',
                className
            )}
        >
            <Link
                href={`#${id}`}
                aria-label={label}
                className={tcls(
                    'inline-flex items-center',
                    'p-1',
                    'pointer-fine:h-full pointer-fine:p-0',
                    textStyle.lineHeight
                )}
            >
                <Icon
                    icon="hashtag"
                    className={tcls(
                        'size-3',
                        'self-center',
                        'transition-colors',
                        'text-transparent',
                        'pointer-fine:group-hover/hash:text-tint-subtle',
                        'contrast-more:pointer-fine:group-hover/hash:text-tint-strong',
                        'pointer-fine:group-focus-within/hash:text-tint-subtle',
                        'contrast-more:pointer-fine:group-focus-within/hash:text-tint-strong',
                        '[.hash-revealed_&]:text-tint-subtle',
                        'contrast-more:[.hash-revealed_&]:text-tint-strong',
                        iconClassName
                    )}
                />
            </Link>
        </span>
    );
}
