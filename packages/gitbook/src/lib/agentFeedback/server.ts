import 'server-only';
import type { AgentFeedbackSource } from '@gitbook/api';

import { type AgentFeedbackPage, type AgentFeedbackResult, parseAgentFeedbackPageURL } from '.';
import type { GitBookSiteContext } from '../context';
import { throwIfDataError } from '../data';
import { resolveContentRef, resolveStringContentRef, toContentRefPath } from '../references';
import { findSiteSpaceByUrl, resolveSiteSpacePagePath } from '../sites';

/** Record a finding about the content of the site, submitted by an agent while helping a user. */
export async function submitAgentFeedback(
    context: GitBookSiteContext,
    input: {
        feedback: string;
        goal?: string;
        /** Page the finding is about, as a URL on the site or a `/spaces/…/pages/…` ref. */
        page: string;
        source: AgentFeedbackSource;
    }
): Promise<AgentFeedbackResult> {
    const feedback = input.feedback.trim();
    if (!feedback) {
        return { submitted: false, error: 'The feedback cannot be empty.' };
    }

    const page = await resolveAgentFeedbackPage(context, input.page);
    if (!page) {
        return { submitted: false, error: `Page not found: "${input.page}"` };
    }

    const goal = input.goal?.trim();

    const api = await context.dataFetcher.api();
    await api.orgs.submitSiteAgentFeedback(context.organizationId, context.site.id, {
        feedback,
        url: page.url,
        spaceId: page.spaceId,
        pageId: page.pageId,
        ...(goal ? { goal } : {}),
        source: input.source,
    });

    return { submitted: true, page };
}

/** Resolve the page a finding is about, from a URL on the site or a `/spaces/…/pages/…` ref. */
async function resolveAgentFeedbackPage(
    context: GitBookSiteContext,
    reference: string
): Promise<AgentFeedbackPage | null> {
    return (
        (await resolvePageFromContentRef(context, reference)) ??
        (await resolvePageFromURL(context, reference))
    );
}

async function resolvePageFromContentRef(
    context: GitBookSiteContext,
    reference: string
): Promise<AgentFeedbackPage | null> {
    const contentRef = resolveStringContentRef(toContentRefPath(reference));
    if (contentRef?.kind !== 'page') {
        return null;
    }

    const resolved = await resolveContentRef(contentRef, context);
    if (!resolved) {
        return null;
    }

    // A ref pointing at a page group resolves to its first document, so trust the resolved page
    // and space over the ids in the ref itself.
    return {
        url: URL.canParse(resolved.href)
            ? resolved.href
            : context.linker.toAbsoluteURL(resolved.href),
        spaceId: resolved.space?.id ?? contentRef.space ?? context.space.id,
        pageId: resolved.page?.id ?? contentRef.page,
        revisionId: resolved.space?.revision ?? context.revisionId,
    };
}

async function resolvePageFromURL(
    context: GitBookSiteContext,
    reference: string
): Promise<AgentFeedbackPage | null> {
    const url = parseAgentFeedbackPageURL(reference, context.siteSpace.urls.published);
    if (!url) {
        return null;
    }

    const match = findSiteSpaceByUrl(context.structure, url);
    if (!match) {
        return null;
    }

    const revision = await throwIfDataError(
        context.dataFetcher.getRevision({
            spaceId: match.siteSpace.space.id,
            revisionId: match.siteSpace.space.revision,
        })
    );

    const resolved = resolveSiteSpacePagePath(match.siteSpace, revision.pages, match.pagePath);
    if (!resolved) {
        return null;
    }

    return {
        url,
        spaceId: match.siteSpace.space.id,
        pageId: resolved.page.id,
        revisionId: match.siteSpace.space.revision,
    };
}
