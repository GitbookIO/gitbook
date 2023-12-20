'use client';

import * as React from 'react';

import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
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

    return (
        <div
            className={tcls(
                'fixed',
                'z-10',
                'bg-white',
                'dark:bg-slate-800',
                'rounded',
                'border-slate-400',
                'dark:border-slate-700',
                'shadow-md',
                'p-4',
                'bottom-4',
                'right-4',
                'left-4',
                'max-w-sm',
                'sm:left-auto',
            )}
        >
            <p className={tcls('text-sm')}>
                {t(
                    language,
                    'cookies_prompt',
                    <a
                        href={privacyPolicy}
                        className={tcls('text-primary-500', 'hover:text-primary-700', 'underline')}
                    >
                        {t(language, 'cookies_prompt_privacy')}
                    </a>,
                )}
            </p>
            <div className={tcls('mt-3', 'flex', 'flex-row', 'gap-4')}>
                <ToastButton
                    onClick={() => {
                        onUpdateState(true);
                    }}
                >
                    {t(language, 'cookies_accept')}
                </ToastButton>
                <ToastButton
                    onClick={() => {
                        onUpdateState(false);
                    }}
                >
                    {t(language, 'cookies_reject')}
                </ToastButton>
            </div>
        </div>
    );
}

function ToastButton(props: { onClick: () => void; children: React.ReactNode }) {
    const { onClick, children } = props;

    return (
        <button
            onClick={onClick}
            className={tcls(
                'bg-white',
                'dark:bg-slate-800',
                'text-xs',
                'text-slate-800',
                'dark:text-slate-200',
                'rounded',
                'border',
                'border-slate-300',
                'dark:border-slate-700',
                'px-2',
                'py-1',
                'shadow-md',
                'hover:bg-slate-100',
                'dark:hover:bg-slate-700',
            )}
        >
            {children}
        </button>
    );
}
