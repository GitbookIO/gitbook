'use client';
import * as React from 'react';

import { Button, StyledLink } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';

import { useCustomCookieBanner, useIntegrationsLoaded } from '@/components/Integrations';
import { isAIUserAgent } from '@/lib/browser';
import {
    isCookiesTrackingDisabled,
    isGlobalPrivacyControlEnabled,
    setCookiesTracking,
} from '../Insights';

/**
 * Toast to accept or reject the use of cookies.
 */
export function CookiesToast(props: { privacyPolicy?: string }) {
    const { privacyPolicy = 'https://policies.gitbook.com/privacy/cookies' } = props;
    const [show, setShow] = React.useState(false);
    const language = useLanguage();
    const integrationsLoaded = useIntegrationsLoaded();
    const { hasCustomCookieBanner } = useCustomCookieBanner();
    const isAI = isAIUserAgent();
    const hasGlobalPrivacyControl = isGlobalPrivacyControlEnabled();

    React.useEffect(() => {
        // If global privacy control is enabled, reject cookies
        if (hasGlobalPrivacyControl && !isCookiesTrackingDisabled()) {
            setCookiesTracking(false);
            return;
        }

        // Always wait for integrations to load, and if a custom banner is registered, hide the built-in banner
        if (!integrationsLoaded || hasCustomCookieBanner || isAI) {
            setShow(false);
            return;
        }

        setShow(isCookiesTrackingDisabled() === undefined);
    }, [hasCustomCookieBanner, integrationsLoaded, isAI, hasGlobalPrivacyControl]);

    if (!show) {
        return null;
    }

    const onUpdateState = (enabled: boolean) => {
        setCookiesTracking(enabled);
        // Reload the page to take the change in consideration
        window.location.reload();
    };

    const describedById = 'cookies-description';

    return (
        <div
            role="dialog"
            data-testid="cookies-dialog"
            aria-modal="true"
            aria-label={tString(language, 'cookies_title')}
            aria-describedby={describedById}
            className={tcls(
                'fixed',
                'z-50',
                'bg-tint-base',
                'rounded-sm',
                'straight-corners:rounded-none',
                'circular-corners:rounded-2xl',
                'ring-1',
                'ring-tint-subtle',
                'shadow-1xs',
                'depth-flat:shadow-none',
                'p-4',
                'pr-8',
                'bottom-[max(env(safe-area-inset-bottom),1rem)]',
                'right-[max(env(safe-area-inset-right),1rem)]',
                'left-[max(env(safe-area-inset-left),4rem)]',
                'max-w-md',
                'text-balance',
                'sm:left-auto',
                'lg:chat-open:mr-80',
                'xl:chat-open:mr-100',
                'motion-safe:transition-all',
                'duration-300',
                'text-sm'
            )}
        >
            <p id={describedById}>
                {t(
                    language,
                    'cookies_prompt',
                    <StyledLink href={privacyPolicy}>
                        {t(language, 'cookies_prompt_privacy')}
                    </StyledLink>
                )}
            </p>
            <Button
                iconOnly
                icon="close"
                size="small"
                label={tString(language, 'close')}
                variant="blank"
                onClick={() => setShow(false)}
                className={tcls('absolute', 'top-2', 'right-2', 'hover:bg-tint-hover')}
            />
            <div className="mt-3 flex flex-row gap-2">
                <Button
                    variant="primary"
                    size="small"
                    aria-label={tString(language, 'cookies_accept')}
                    onClick={() => {
                        onUpdateState(true);
                    }}
                    label={tString(language, 'cookies_accept')}
                />
                <Button
                    variant="secondary"
                    size="small"
                    aria-label={tString(language, 'cookies_reject')}
                    onClick={() => {
                        onUpdateState(false);
                    }}
                    label={tString(language, 'cookies_reject')}
                />
            </div>
        </div>
    );
}
