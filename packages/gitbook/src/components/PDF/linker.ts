import type { Revision } from '@gitbook/api';
import { RevisionPageType } from '@gitbook/api';

import type { GitBookLinker } from '@/lib/links';

function getPagePDFContainerId(page: Revision['pages'][number], anchor?: string): string {
    return `page-${page.id}` + (anchor ? `-${anchor}` : '');
}

export function createPDFLinker(
    baseLinker: GitBookLinker,
    pages: Array<{ page: Revision['pages'][number] }>
): GitBookLinker {
    return {
        ...baseLinker,
        toPathForPage(input) {
            if (pages.some((p) => p.page.id === input.page.id)) {
                return `#${getPagePDFContainerId(input.page, input.anchor)}`;
            }
            if (input.page.type === RevisionPageType.Group) {
                return '#';
            }

            // For pages that are not embedded in this PDF export, keep links on the published site.
            return baseLinker.toAbsoluteURL(baseLinker.toPathForPage(input));
        },
    };
}
