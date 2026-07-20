'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import { tcls } from '@/lib/tailwind';

import { type SubmitConsentInput, submitSiteOAuthConsent } from './actions';

/**
 * Site's OAuth consent form to present to the user the client's information requesting access to the site's MCP.
 */
export function ConsentForm(props: {
    siteId: string;
    consentSessionId: string;
    /** Whether the OAuth server recognizes the client as verified. */
    verified: boolean;
}) {
    const { siteId, consentSessionId, verified } = props;
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>();
    const [trusted, setTrusted] = useState(false);

    // Unverified clients can only be approved once the visitor explicitly acknowledges they trust
    // the app. The OAuth server re-checks this, so it can't be bypassed by tampering with the client.
    const canApprove = verified || trusted;

    const decide = (decision: SubmitConsentInput['decision']) => {
        setError(undefined);
        startTransition(async () => {
            const result = await submitSiteOAuthConsent({
                siteId,
                consentSessionId,
                decision,
                trusted,
            });
            if ('redirectURL' in result) {
                // Full-page navigation to the client's (external) redirect URI.
                window.location.href = result.redirectURL;
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {error ? (
                <p role="alert" className="text-danger-strong text-sm">
                    {error}
                </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                {verified ? (
                    <span />
                ) : (
                    <label
                        htmlFor="site-oauth-trusted"
                        className="flex items-center gap-2 text-sm text-tint"
                    >
                        <Checkbox
                            id="site-oauth-trusted"
                            checked={trusted}
                            onCheckedChange={(value) => setTrusted(value === true)}
                        />
                        <span>I recognize and trust this client</span>
                    </label>
                )}

                <div className={tcls('ms-auto flex gap-2')}>
                    <Button
                        variant="secondary"
                        icon="xmark"
                        disabled={isPending}
                        onClick={() => decide('deny')}
                    >
                        Deny
                    </Button>
                    <Button
                        variant="primary"
                        icon="check"
                        disabled={isPending || !canApprove}
                        onClick={() => decide('approve')}
                    >
                        Approve
                    </Button>
                </div>
            </div>
        </div>
    );
}
