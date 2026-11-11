import type { DocumentBlockHeading, DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Link } from '../primitives';
import type { DocumentContext } from './DocumentView';
import './HashLinkButton.css';
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
        <span className={tcls('hash', className)}>
            <Link
                href={`#${id}`}
                aria-label={label}
                className={tcls('hash-link', textStyle.lineHeight)}
            >
                <Icon icon="hashtag" className={tcls('hash-icon', iconClassName)} />
            </Link>
        </span>
    );
}
