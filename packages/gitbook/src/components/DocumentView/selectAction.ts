import type * as api from '@gitbook/api';

/**
 * Detect a "Select" action on a button's data returns the action (with its `value`) or `null` if the button is not a select action.
 */
export function getSelectAction(data: api.DocumentInlineButton['data']) {
    if (!('action' in data)) {
        return null;
    }
    const action = data.action;
    if (action.action === 'select') {
        return { action: action.action, value: action.slug };
    }
    return null;
}
