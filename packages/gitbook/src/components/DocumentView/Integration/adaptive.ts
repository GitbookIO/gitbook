import type {
    ContentKitDescendantElement,
    ContentKitRenderOutput,
    ContentKitRootElement,
    ContentKitStepper,
} from '@gitbook/api';

type ContentKitElement = ContentKitRootElement | ContentKitDescendantElement | ContentKitStepper;

/**
 * Decide whether an integration block needs to be rendered with Adaptive visitor context.
 */
export function shouldRenderIntegrationBlockWithAdaptiveVisitorContext(
    output: ContentKitRenderOutput
) {
    if (output.type === 'complete') {
        return false;
    }

    return doesContentKitElementContainWebframe(output.element);
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
