import type { IconName } from '@gitbook/icons';

export type OrderedComputedResult =
    | ComputedPageResult
    | ComputedSectionResult
    | ComputedRecordResult;

export interface ComputedSectionResult {
    type: 'section';
    id: string;
    title: string;
    body: string;
    href: string;

    pageId: string;
    spaceId: string;
}

export interface ComputedPageResult {
    type: 'page';
    id: string;
    title: string;

    href: string;

    pageId: string;
    spaceId: string;

    breadcrumbs?: Array<{ icon?: IconName; label: string }>;
}

export interface ComputedRecordResult {
    type: 'record';
    id: string;
    title: string;
    description: string | undefined;
    href: string;
}

export type SearchSiteContentScope =
    | { mode: 'all' }
    | { mode: 'current'; siteSpaceId: string }
    | { mode: 'specific'; siteSpaceIds: string[] };

export interface SearchSiteContentRequest {
    query: string;
    scope: SearchSiteContentScope;
    /** Current page path, used for context. */
    path: string;
}
