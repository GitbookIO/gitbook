import type { IconName } from '@gitbook/icons';

export type OrderedComputedResult =
    | ComputedPageResult
    | ComputedSectionResult
    | ComputedRecordResult;

export type BaseComputedResult = {
    id: string;
    title: string;
    href: string;
    score: number;
};

export type ComputedSectionResult = BaseComputedResult & {
    type: 'section';
    body: string;
    pageId: string;
    spaceId: string;
};

export type ComputedPageResult = BaseComputedResult & {
    type: 'page';
    pageId: string;
    spaceId: string;
    breadcrumbs?: Array<{ icon?: IconName; label: string }>;
};

export type ComputedRecordResult = BaseComputedResult & {
    type: 'record';
    description: string | undefined;
};

export type SearchSiteContentScope =
    | { mode: 'all' }
    | { mode: 'current'; siteSpaceId: string }
    | { mode: 'specific'; siteSpaceIds: string[] };

export interface SearchSiteContentRequest {
    asEmbeddable?: boolean;
    query: string;
    scope: SearchSiteContentScope;
}
