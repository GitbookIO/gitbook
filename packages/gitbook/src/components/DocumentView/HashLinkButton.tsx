import type { DocumentBlockHeading, DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Link } from '../primitives';
import type { DocumentContext } from './DocumentView';
import { type ClassValue, cx } from '@/lib/classnames';

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
 * Styled in `styles/blocks.css`, it is revealed when hovering its `.heading` parent.
 */
export function HashLinkButton(props: {
    id: string;
    block: DocumentBlockTabs | DocumentBlockHeading;
    label: string;
    className?: ClassValue;
    iconClassName?: ClassValue;
}) {
    const { id, className, iconClassName, label } = props;

    return (
        <span className={cx('hash', className)}>
            <Link href={`#${id}`} aria-label={label} className="hash-link">
                <Icon icon="hashtag" className={cx('hash-icon', iconClassName)} />
            </Link>
        </span>
    );
}
