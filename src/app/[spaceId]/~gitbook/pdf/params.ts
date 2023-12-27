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
 * Get the PDF export params from the URL serch params.
 */
export function getPDFSearchParams(searchParams: URLSearchParams): PDFSearchParams {
    const params: PDFSearchParams = {};

    if (searchParams.has('page')) {
        params.page = searchParams.get('page') ?? '';
    }
    if (searchParams.has('only')) {
        params.only = true;
    }
    if (searchParams.has('limit')) {
        params.limit = Number(searchParams.get('limit'));
    }
    if (searchParams.has('back')) {
        params.back = searchParams.get('back') ?? '';
    }

    return params;
}

/**
 * Update the URL with the PDF export params.
 */
export function getPDFUrl(url: URL, params: PDFSearchParams): URL {
    const copy = new URL(url);

    if (params?.page) {
        copy.searchParams.set('page', params.page);
    } else {
        copy.searchParams.delete('page');
    }
    if (params?.only) {
        copy.searchParams.set('only', 'yes');
    } else {
        copy.searchParams.delete('only');
    }

    // Persist limit and back
    if (params?.limit) {
        copy.searchParams.set('limit', String(params.limit));
    }
    if (params?.back) {
        copy.searchParams.set('back', String(params.back));
    }

    return copy;
}
