import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

import {
    type RouteLayoutParams,
    getDynamicSiteContext,
    getSiteURLDataFromParams,
} from '@/app/utils';
import { ConsentError, ConsentScreen } from '@/components/SiteOAuthConsent';
import { withLeadingSlash, withTrailingSlash } from '@/lib/paths';
import {
    SiteOAuthConsentError,
    isSitesOAuthConsentEnabled,
    startSiteOAuthConsent,
} from '@/lib/site-oauth';
import { getVisitorToken } from '@/lib/visitors';

// The consent screen depends on the request (visitor, one-time interaction) and must never be cached.
export const dynamic = 'force-dynamic';

type PageParams = RouteLayoutParams & { siteId: string };

/**
 * Render the sites OAuth consent screen for a post-login authorize resume.
 */
export default async function Page(props: {
    params: Promise<PageParams>;
    searchParams: Promise<{ gb_oauth_state?: string }>;
}) {
    if (!isSitesOAuthConsentEnabled()) {
        notFound();
    }

    const params = await props.params;
    const searchParams = await props.searchParams;
    const { siteId } = params;

    const { context } = await getDynamicSiteContext(params);
    const siteBasePath = withTrailingSlash(
        withLeadingSlash(getSiteURLDataFromParams(params).siteBasePath)
    );
    const authorizeURL = new URL(
        `${siteBasePath}~gitbook/oauth2/v1/${siteId}/authorize`,
        context.linker.toAbsoluteURL('/')
    );
    const visitorToken = getVisitorToken({
        cookies: (await cookies()).getAll(),
        headers: await headers(),
        url: authorizeURL,
    });
    const jwtToken = visitorToken?.token;
    const interactionId = searchParams.gb_oauth_state;

    if (!interactionId || !jwtToken) {
        return <ConsentError />;
    }

    try {
        const consent = await startSiteOAuthConsent({ siteId, interactionId, jwtToken });
        return <ConsentScreen siteId={siteId} siteTitle={context.site.title} consent={consent} />;
    } catch (error) {
        if (error instanceof SiteOAuthConsentError) {
            return <ConsentError />;
        }
        throw error;
    }
}
