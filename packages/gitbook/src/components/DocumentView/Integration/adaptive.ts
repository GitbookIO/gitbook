import type { GitBookAnyContext } from '@/lib/context';
import type {
    ContentKitDescendantElement,
    ContentKitRenderOutput,
    ContentKitRootElement,
    ContentKitStepper,
} from '@gitbook/api';

type ContentKitElement = ContentKitRootElement | ContentKitDescendantElement | ContentKitStepper;

/**
 * Current page exposed to a webframe through the client-only webframe state.
 */
export type WebframePageContext = {
    id: string;
    path: string;
    title: string;
};

/**
 * Whether an integration block's output contains a webframe that can consume client-only context
 * (visitor claims and/or the current page).
 */
export function integrationBlockContainsWebframe(output: ContentKitRenderOutput): boolean {
    if (output.type === 'complete') {
        return false;
    }

    return doesContentKitElementContainWebframe(output.element);
}

/**
 * Extract the current page to expose to a webframe, or `null` when it is unknown
 * (e.g. a non-page context, or reusable content resolved from another source).
 */
export function getWebframePageContext(
    contentContext: GitBookAnyContext
): WebframePageContext | null {
    if (!('page' in contentContext) || !contentContext.page) {
        return null;
    }

    const { id, path, title } = contentContext.page;
    return { id, path, title };
}

/**
 * Check whether a ContentKit element tree contains a webframe element.
 */
function doesContentKitElementContainWebframe(element: ContentKitElement): boolean {
    switch (element.type) {
        case 'webframe':
            return true;
        case 'block':
        case 'box':
        case 'hstack':
        case 'vstack':
        case 'step':
        case 'modal':
        case 'configuration':
        case 'stepper':
        case 'card':
            return doesContentKitElementArrayContainWebframe(element.children);
        case 'codeblock':
            return (
                doesContentKitElementArrayContainWebframe(element.header) ||
                doesContentKitElementArrayContainWebframe(element.footer)
            );
        default:
            return false;
    }
}

function doesContentKitElementArrayContainWebframe(elements: unknown): boolean {
    if (!Array.isArray(elements)) {
        return doesContentKitElementContainWebframeValue(elements);
    }

    return elements.some(doesContentKitElementContainWebframeValue);
}

function doesContentKitElementContainWebframeValue(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || !('type' in value)) {
        return false;
    }

    return doesContentKitElementContainWebframe(value as ContentKitElement);
}
