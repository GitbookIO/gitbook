import Link from 'next/link';

import { TrackPageViewEvent } from '@/components/Insights';
import { getSpaceLanguage, t } from '@/intl/server';
import { languages } from '@/intl/translations';
import { getSiteData, getSpaceContentData } from '@/lib/api';
import { checkIsFromMiddleware } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';
import { tcls } from '@/lib/tailwind';

export default async function NotFound() {
    const fromMiddleware = await checkIsFromMiddleware();
    if (!fromMiddleware) {
        return (
            <div className="flex flex-1 flex-row items-center justify-center py-9 h-screen">
                <div className="max-w-80">
                    <h2 className="text-2xl font-semibold mb-2">Not found</h2>
                    <p className="text-base mb-4">This page could not be found</p>
                    <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
                        Go back to home
                    </Link>
                </div>
            </div>
        );
    }
    const pointer = await getSiteContentPointer();
    const [{ space }, { customization }] = await Promise.all([
        getSpaceContentData(pointer, pointer.siteShareKey),
        getSiteData(pointer),
    ]);
    const language = getSpaceLanguage(customization);

    return (
        <div
            className={tcls('flex-1', 'flex', 'flex-row', 'items-center', 'justify-center', 'py-9')}
        >
            <div className={tcls('max-w-80')}>
                <h2 className={tcls('text-2xl', 'font-semibold', 'mb-2')}>
                    {t(language, 'notfound_title')}
                </h2>
                <p className={tcls('text-base', 'mb-4')}>{t(language, 'notfound')}</p>
            </div>

            {/* Track the page not found as a page view */}
            <TrackPageViewEvent pageId={null} revisionId={space.revision} />
        </div>
    );
}
