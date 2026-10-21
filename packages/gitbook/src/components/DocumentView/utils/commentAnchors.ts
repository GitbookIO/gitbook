import type { DocumentContext } from '../DocumentView';

// Spread rather than set to `undefined`: an `undefined` prop is still written to the RSC payload,
// so public pages would keep paying for the attribute names.

/** Marks blocks comments can't anchor to, passed down as their `style` (see `ReusableContent`). */
export const COMMENT_IGNORE_CLASSNAME = 'comment-ignore';

/** The node key comments anchor to, only where commenting is possible. */
export function getCommentAnchorProps(
    context: DocumentContext,
    key: string | undefined
): { 'data-block-key'?: string } {
    return context.withCommentAnchors && key ? { 'data-block-key': key } : {};
}

/** A table cell's record and column, only where commenting is possible. */
export function getCommentCellProps(
    context: DocumentContext,
    record: string,
    column: string
): { 'data-table-record'?: string; 'data-table-column'?: string } {
    return context.withCommentAnchors
        ? { 'data-table-record': record, 'data-table-column': column }
        : {};
}

/** A boolean comment marker, only where commenting is possible. */
export function getCommentMarkerProps(
    context: DocumentContext,
    name: 'data-comment-block' | 'data-comment-ignore'
): Partial<Record<typeof name, ''>> {
    return context.withCommentAnchors ? { [name]: '' } : {};
}

/** The node key as a `commentKey` prop for components rendering it themselves (e.g. client ones). */
export function getCommentKeyProp(
    context: DocumentContext,
    key: string | undefined
): { commentKey?: string } {
    return context.withCommentAnchors && key ? { commentKey: key } : {};
}

/** The anchor attribute for a `commentKey` prop, when set. */
export function getCommentKeyAttributes(commentKey: string | undefined): {
    'data-block-key'?: string;
} {
    return commentKey ? { 'data-block-key': commentKey } : {};
}
