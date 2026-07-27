import type * as api from '@gitbook/api';

/**
 * The "Select" button action: clicking the button activates the slug derived from `value`, so any
 * block containing that slug (tabs today) reacts.
 *
 * TODO(RND-11832): this is a local bridge. Remove it once `@gitbook/api`'s `DocumentAction` gains
 * the `{ action: 'select'; value: string }` variant, and read `inline.data.action` directly.
 */
export interface SelectDocumentAction {
    action: 'select';
    value: string;
}

/**
 * Detect a "Select" action on a button's data, tolerating the fact that the installed `@gitbook/api`
 * doesn't type it yet. Returns the action (with its `value`) or `null` for link/ask/search buttons.
 */
export function getSelectAction(
    data: api.DocumentInlineButton['data']
): SelectDocumentAction | null {
    if (!('action' in data)) {
        return null;
    }
    const action = data.action as { action?: string; value?: unknown };
    if (action.action === 'select' && typeof action.value === 'string') {
        return { action: 'select', value: action.value };
    }
    return null;
}
