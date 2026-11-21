// TEMPORARY: mirrors the `PublishedSiteContent` variants of GitbookIO/gitbook-x#27870 until a
// published `@gitbook/api` includes them. Delete this file and import the official types then.
import type * as api from '@gitbook/api';

/** Site content at the live revision of its spaces. */
export type PublishedSiteContentLive = object;

/** Site content previewed at a revision of its space. */
export interface PublishedSiteContentAtRevision {
    revision: string;
}

/** Site content previewed in a change request of its space. */
export interface PublishedSiteContentInChangeRequest {
    changeRequest: string;
}

/** Site content previewed at a site revision. */
export interface PublishedSiteContentAtSiteRevision {
    siteRevision: string;
}

/** Site content a URL resolves to: at most one of `revision`, `changeRequest` and `siteRevision`. */
export type PublishedSiteContentWithSiteRevision = Omit<
    api.PublishedSiteContent,
    'revision' | 'changeRequest'
> &
    (
        | PublishedSiteContentLive
        | PublishedSiteContentAtRevision
        | PublishedSiteContentInChangeRequest
        | PublishedSiteContentAtSiteRevision
    );

/**
 * Read a resolution with the variants of the next `@gitbook/api`: the published type has neither
 * `siteRevision` nor the variants, though the API already returns them.
 */
export function asPublishedSiteContentWithSiteRevision(
    content: api.PublishedSiteContent
): PublishedSiteContentWithSiteRevision {
    return content as PublishedSiteContentWithSiteRevision;
}
