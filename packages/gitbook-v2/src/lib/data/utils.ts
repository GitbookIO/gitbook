import { RevisionPageDocument } from "@gitbook/api";
import { GitBookDataFetcher } from "./types";

/**
 * Get the document for a page.
 */
export async function getPageDocument(dataFetcher: GitBookDataFetcher, spaceId: string, page: RevisionPageDocument) {
    if (page.documentId) {
        return dataFetcher.getDocument({ spaceId, documentId: page.documentId });
    } else if (page.computed) {
        return dataFetcher.getComputedDocument({ spaceId, source: page.computed });
    }

    return null;
}

