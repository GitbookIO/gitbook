'use client';

import { useState, useTransition } from 'react';

import { Icon } from '@gitbook/icons';

import {
    type SubmitConsentErrorCode,
    type SubmitConsentInput,
    submitSiteOAuthConsent,
} from './actions';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/primitives/Checkbox';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

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
    const language = useLanguage();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<SubmitConsentErrorCode>();
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between gap-4">
                {verified ? null : (
                    <label
                        htmlFor="site-oauth-trusted"
                        className="me-auto flex grow cursor-pointer items-center gap-2 text-sm text-tint"
                    >
                        <Checkbox
                            id="site-oauth-trusted"
                            checked={trusted}
                            onCheckedChange={setTrusted}
                        />
                        <span>{t(language, 'auth_trust_client')}</span>
                    </label>
                )}

                <div className={tcls('flex grow gap-2 text-sm')}>
                    <Button
                        variant="secondary"
                        size="medium"
                        icon="xmark"
                        disabled={isPending}
                        onClick={() => decide('deny')}
                        className="grow justify-center"
                    >
                        {t(language, 'auth_deny')}
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        icon="check"
                        disabled={isPending || !canApprove}
                        onClick={() => decide('approve')}
                        className="grow justify-center"
                    >
                        {t(language, 'auth_approve')}
                    </Button>
                </div>
            </div>

            {error ? (
                <div
                    role="alert"
                    className={tcls(
                        'flex gap-3',
                        'rounded-corners:rounded-xl circular-corners:rounded-3xl',
                        'bg-danger p-4 text-danger animate-blur-in-slow'
                    )}
                >
                    <Icon
                        icon="triangle-exclamation"
                        className="ml-1 mt-0.5 size-4 shrink-0 text-danger-strong"
                    />
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-danger-strong">
                            {t(language, 'auth_error_title')}
                        </span>
                        <span>{t(language, error)}</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
