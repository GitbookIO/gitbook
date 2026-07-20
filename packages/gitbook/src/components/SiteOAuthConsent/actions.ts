'use server';

import { type SiteOAuthConsentDecision, submitSiteOAuthConsentDecision } from '@/lib/site-oauth';

export type SubmitConsentInput = {
    siteId: string;
    consentSessionId: string;
    decision: SiteOAuthConsentDecision;
    trusted: boolean;
};

export type SubmitConsentResult = { redirectURL: string } | { error: string };

/**
 * Server action to submit the consent decision to the sites OAuth server's `consent/decision` endpoint.
 */
export async function submitSiteOAuthConsent(
    input: SubmitConsentInput
): Promise<SubmitConsentResult> {
    const { siteId, consentSessionId, decision, trusted } = input;

    if (!siteId || !consentSessionId || (decision !== 'approve' && decision !== 'deny')) {
        return { error: 'Invalid request. Please start again from the application.' };
    }

    try {
        const { redirectURL } = await submitSiteOAuthConsentDecision({
            siteId,
            consentSessionId,
            decision,
            trusted,
        });
        return { redirectURL };
    } catch (_error) {
        return {
            error: 'We could not complete the authorization. The request may have expired — please start again from the application.',
        };
    }
}
