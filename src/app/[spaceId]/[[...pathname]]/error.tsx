'use client';

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
                    {t(
                        language,
                        error.message === 'NEXT_NOT_FOUND'
                            ? 'notfound_title'
                            : 'unexpected_error_title',
                    )}
                </h2>
                <p className={tcls('text-base', 'mb-4')}>
                    {t(
                        language,
                        error.message === 'NEXT_NOT_FOUND' ? 'notfound' : 'unexpected_error',
                    )}
                </p>
                <div>
                    <Button
                        onClick={() => {
                            if (error.message === 'NEXT_NOT_FOUND') {
                                window.location.href = '/';
                            } else {
                                reset();
                            }
                        }}
                        variant="secondary"
                        size="small"
                    >
                        {t(
                            language,
                            error.message === 'NEXT_NOT_FOUND'
                                ? 'notfound_go_home'
                                : 'unexpected_error_retry',
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
