'use server';

import { type SiteOAuthConsentDecision, submitSiteOAuthConsentDecision } from '@/lib/site-oauth';

export type SubmitConsentInput = {
    siteId: string;
    consentSessionId: string;
    decision: SiteOAuthConsentDecision;
    trusted: boolean;
};

/**
 * Failure reason, as a translation key. The action has no site context to resolve a language from,
 * so the caller translates it.
 */
export type SubmitConsentErrorCode = 'auth_error_invalid_request' | 'auth_error_failed';

export type SubmitConsentResult = { redirectURL: string } | { error: SubmitConsentErrorCode };

/**
 * Server action to submit the consent decision to the sites OAuth server's `consent/decision` endpoint.
 */
export async function submitSiteOAuthConsent(
    input: SubmitConsentInput
): Promise<SubmitConsentResult> {
    const { siteId, consentSessionId, decision, trusted } = input;

    if (!siteId || !consentSessionId || (decision !== 'approve' && decision !== 'deny')) {
        return { error: 'auth_error_invalid_request' };
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
        return { error: 'auth_error_failed' };
    }
}
