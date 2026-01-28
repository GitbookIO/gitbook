'use client';

import { TrackPageViewEvent } from '@/components/Insights';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSpaceBasePath } from '../SpaceLayout/SpaceLayoutContext';
import { CurrentPageProvider } from '../hooks';
import { SuspenseLoadedHint } from '../primitives';

/**
 * Component that displays a "page not found" message.
 */
export function SitePageNotFound() {
    const basePath = useSpaceBasePath();
    const language = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // If ?fallback=true, redirect to the root page.
    const fallback = searchParams?.get('fallback');
    const ask = searchParams?.get('ask');
    useEffect(() => {
        if (fallback) {
            router.replace(basePath);
        } else if (ask) {
            // This is a workaround to prevent an infinite loop when the ask parameter is present.
            // If it is present while we are on a 404 page, Next.js will fetch the RSC of the page again,
            // trigerring the page to rerender and the assistant to start again, causing the infinite loop.
            // To prevent this, when we detect the ask parameter, we redirect to the base path where the error does not occur.
            router.replace(`${basePath}?${searchParams?.toString()}`);
        }
    }, [basePath, fallback, ask, router, searchParams]);

    return (
        <CurrentPageProvider page={null}>
            <div
                className={tcls(
                    'flex-1',
                    'flex',
                    'flex-row',
                    'items-center',
                    'justify-center',
                    'py-9',
                    'min-h-[calc(100vh-64px)] lg:min-h-fit'
                )}
            >
                <div className={tcls('max-w-80')}>
                    <h2 className={tcls('text-2xl', 'font-semibold', 'mb-2')}>
                        {t(language, 'notfound_title')}
                    </h2>
                    <p className={tcls('text-base', 'mb-4')}>{t(language, 'notfound')}</p>
                </div>
                <SuspenseLoadedHint />

                {/* Track the page not found as a page view */}
                <TrackPageViewEvent displayContext={SiteInsightsDisplayContext.Site} />
            </div>
        </CurrentPageProvider>
    );
}
