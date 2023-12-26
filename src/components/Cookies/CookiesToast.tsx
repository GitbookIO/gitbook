'use client';

import IconX from '@geist-ui/icons/x';
import * as React from 'react';

import { Button } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { isCookiesTrackingDisabled, setCookiesTracking } from '@/lib/analytics';
import { tcls } from '@/lib/tailwind';

/**
 * Toast to accept or reject the use of cookies.
 */
export function CookiesToast(props: { privacyPolicy?: string }) {
    const { privacyPolicy = 'https://policies.gitbook.com/privacy/cookies' } = props;
    const [show, setShow] = React.useState(false);
    const language = useLanguage();

    React.useEffect(() => {
        setShow(isCookiesTrackingDisabled() === undefined);
    }, []);

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
            aria-modal="true"
            aria-label={tString(language, 'cookies_title')}
            aria-describedby={describedById}
            className={tcls(
                'fixed',
                'z-10',
                'bg-white',
                'rounded',
                'ring-1',
                'ring-dark/2',
                'shadow-1xs',
                'p-4',
                'pr-8',
                'bottom-4',
                'right-4',
                'left-16',
                'max-w-md',
                'textwrap-balance',
                'sm:left-auto',
                'dark:ring-light/2',
                'dark:bg-dark',
            )}
        >
            <p id={describedById} className={tcls('text-sm')}>
                {t(
                    language,
                    'cookies_prompt',
                    <a
                        href={privacyPolicy}
                        className={tcls('text-primary-500', 'hover:text-primary-600', 'underline')}
                    >
                        {t(language, 'cookies_prompt_privacy')}
                    </a>,
                )}
            </p>
            <button
                onClick={() => setShow(false)}
                className={tcls(
                    'absolute',
                    'top-3',
                    'right-3',
                    'w-6',
                    'h-6',
                    'flex',
                    'justify-center',
                    'items-center',
                    'rounded-sm',
                    'hover:bg-dark/2',
                    'dark:hover:bg-light/1',
                )}
                title={tString(language, 'cookies_close')}
            >
                <IconX className={tcls('w-4')} />
            </button>
            <div className={tcls('mt-3', 'flex', 'flex-row', 'gap-2')}>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                        onUpdateState(true);
                    }}
                >
                    {t(language, 'cookies_accept')}
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                        onUpdateState(false);
                    }}
                >
                    {t(language, 'cookies_reject')}
                </Button>
            </div>
        </div>
    );
}
