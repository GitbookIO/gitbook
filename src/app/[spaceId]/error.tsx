'use client';

import * as Sentry from '@sentry/nextjs';
import React from 'react';

import { Button } from '@/components/primitives/Button';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export default function ErrorPage(props: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { error, reset } = props;
    const language = useLanguage();

    const isNotFound = error.message === 'NEXT_NOT_FOUND';

    React.useEffect(() => {
        // Log the error to Sentry
        if (!isNotFound) {
            Sentry.captureException(error);
        }
    }, [error, isNotFound]);

    return (
        <div
            className={tcls(
                'fixed',
                'w-full',
                'h-full',
                'flex',
                'items-center',
                'justify-center',
                'p-7',
            )}
        >
            <div>
                <h2 className={tcls('text-2xl', 'font-semibold', 'mb-2')}>
                    {t(language, isNotFound ? 'notfound_title' : 'unexpected_error_title')}
                </h2>
                <p className={tcls('text-base', 'mb-4')}>
                    {t(language, isNotFound ? 'notfound' : 'unexpected_error')}
                </p>
                <div>
                    <Button
                        onClick={() => {
                            if (isNotFound) {
                                window.location.href = '/';
                            } else {
                                reset();
                            }
                        }}
                        variant="secondary"
                        size="small"
                    >
                        {t(language, isNotFound ? 'notfound_go_home' : 'unexpected_error_retry')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
