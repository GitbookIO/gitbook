/** URL search param carrying the active tag filter, e.g. `?tag=changelog`. */
export const UPDATES_FILTER_SEARCH_PARAM = 'tag';

export const UPDATES_MAX_PAGE = 500;
export const UPDATES_PAGE_SEARCH_PARAM = 'page';

export function parseUpdatesPageParam(raw: string | null | undefined): number | null {
    const page = Number(raw);
    if (!Number.isInteger(page) || page < 2 || page > UPDATES_MAX_PAGE || String(page) !== raw) {
        return null;
    }
    return page;
}

export function setUpdatesPageParam(params: URLSearchParams, page: number) {
    if (page > 1) {
        params.set(UPDATES_PAGE_SEARCH_PARAM, String(page));
    } else {
        params.delete(UPDATES_PAGE_SEARCH_PARAM);
    }
}
