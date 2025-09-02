'use client';

import { TrackPageViewEvent } from '@/components/Insights';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSpaceBasePath } from '../SpaceLayout/SpaceLayoutContext';
import { CurrentPageProvider } from '../hooks';

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
    useEffect(() => {
        if (fallback) {
            router.replace(basePath);
        }
    }, [basePath, fallback, router]);

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

                {/* Track the page not found as a page view */}
                <TrackPageViewEvent displayContext={SiteInsightsDisplayContext.Site} />
            </div>
        </CurrentPageProvider>
    );
}
