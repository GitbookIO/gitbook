/** Default number of pages rendered per request when exporting the whole space. */
export const PDF_DEFAULT_LIMIT = 100;

/**
 * Default number of pages rendered per request when exporting a page and its subtree.
 * Subtrees are often OpenAPI references, which are much heavier to render than prose
 * and get the request killed for CPU/memory at higher limits.
 */
export const PDF_SUBTREE_DEFAULT_LIMIT = 20;

export interface PDFSearchParams {
    /** Page to export. If none is passed, all pages are exported. */
    page?: string;
    /** If true, the `page` is exported with its descendants */
    only?: boolean;
    /** Maximum number of pages to render in this batch */
    limit: number;
    /** Index of the first page to render in this batch */
    offset: number;
    /** URL to redirect back to */
    back?: string;
}

/**
 * Params accepted when building a PDF export URL. `limit` and `offset` fall back to the defaults.
 */
export type PDFURLParams = Omit<PDFSearchParams, 'limit' | 'offset'> & {
    limit?: number;
    offset?: number;
};

/**
 * Default batch size for a given PDF export.
 */
export function getDefaultPDFLimit(params: Pick<PDFSearchParams, 'page' | 'only'>): number {
    return params.page && params.only ? PDF_SUBTREE_DEFAULT_LIMIT : PDF_DEFAULT_LIMIT;
}

/**
 * Get the PDF export params from the URL serch params.
 */
export function getPDFSearchParams(searchParams: URLSearchParams): PDFSearchParams {
    const page = searchParams.has('page') ? (searchParams.get('page') ?? '') : undefined;
    const only = searchParams.has('only') ? true : undefined;

    const params: PDFSearchParams = {
        limit:
            parseInteger(searchParams.get('limit'), { min: 1 }) ??
            getDefaultPDFLimit({ page, only }),
        offset: parseInteger(searchParams.get('offset'), { min: 0 }) ?? 0,
    };

    if (page !== undefined) {
        params.page = page;
    }
    if (only) {
        params.only = true;
    }
    if (searchParams.has('back')) {
        params.back = searchParams.get('back') ?? '';
    }

    return params;
}

/**
 * Get the URL search params to use for a PDF export.
 */
export function getPDFURLSearchParams(
    params: PDFURLParams,
    searchParams = new URLSearchParams({})
): URLSearchParams {
    if (params?.page) {
        searchParams.set('page', params.page);
    } else {
        searchParams.delete('page');
    }
    if (params?.only) {
        searchParams.set('only', 'yes');
    } else {
        searchParams.delete('only');
    }

    // Persist limit, offset and back
    if (params?.limit) {
        searchParams.set('limit', String(params.limit));
    } else {
        searchParams.delete('limit');
    }
    if (params?.offset) {
        searchParams.set('offset', String(params.offset));
    } else {
        searchParams.delete('offset');
    }
    if (params?.back) {
        searchParams.set('back', String(params.back));
    }

    return searchParams;
}

function parseInteger(value: string | null, options: { min: number }): number | undefined {
    if (value === null || value.trim() === '') {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= options.min ? parsed : undefined;
}
