import type { GitBookAnyContext } from '@/lib/context';
import { getPagePath } from '@/lib/pages';
import {
    type ContentKitDescendantElement,
    type ContentKitRenderOutput,
    type ContentKitRootElement,
    type ContentKitStepper,
    type RevisionPage,
    RevisionPageType,
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
 * Build a map of page id → page path (relative to the current space) for the current revision, so
 * a webframe can navigate by page id without a server round-trip. Resolution is scoped to the
 * current space, mirroring {@link getWebframePageContext}; pages in another section/space are only
 * reachable by path.
 */
export function getWebframePagePaths(contentContext: GitBookAnyContext): Record<string, string> {
    if (!('revision' in contentContext) || !contentContext.revision) {
        return {};
    }

    const rootPages = contentContext.revision.pages;
    const pagePaths: Record<string, string> = {};

    const walk = (pages: RevisionPage[]) => {
        for (const page of pages) {
            if (page.type === RevisionPageType.Document) {
                pagePaths[page.id] = getPagePath(rootPages, page);
            }
            if ('pages' in page && page.pages.length > 0) {
                walk(page.pages);
            }
        }
    };
    walk(rootPages);

    return pagePaths;
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
