export interface PDFSearchParams {
    /** Page to export. If none is passed, all pages are exported. */
    page?: string;
    /** If true, only the `page` is exported, and not its descendant */
    only?: boolean;
    /** Limit the number of pages */
    limit?: number;
    /** URL to redirect back to */
    back?: string;
}

/**
 * Generate a search params part of the URL for the PDF export.
 */
export function getPDFParams(params?: PDFSearchParams): string {
    const searchParams = new URLSearchParams();
    if (params?.page) {
        searchParams.set('page', params.page);
    }
    if (params?.only) {
        searchParams.set('only', 'yes');
    }
    if (params?.limit) {
        searchParams.set('limit', String(params.limit));
    }
    if (params?.back) {
        searchParams.set('back', String(params.back));
    }

    return searchParams.toString();
}
