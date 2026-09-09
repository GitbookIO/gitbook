import type * as api from '@gitbook/api';

/**
 * Detect an "integration" action on a button's data, returning the integration and the component
 * it targets, or `null` when the button is not an integration action.
 */
export function getIntegrationAction(data: api.DocumentInlineButton['data']) {
    if (!('action' in data)) {
        return null;
    }

    // TODO: drop the cast once `@gitbook/api` ships the `integration` variant of `DocumentAction`.
    const action = data.action as { action: string; integration?: unknown; block?: unknown };
    if (
        action.action === 'integration' &&
        typeof action.integration === 'string' &&
        typeof action.block === 'string' &&
        action.integration &&
        action.block
    ) {
        return { integration: action.integration, block: action.block };
    }

    return null;
}
