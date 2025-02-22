import { TrackPageViewEvent } from '@/components/Insights';
import { getSpaceLanguage, t } from '@/intl/server';
import { getSiteData, getSpaceContentData } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';
import { tcls } from '@/lib/tailwind';
import { getDataFetcherV1 } from '@/lib/v1';

export default async function NotFound() {
    const pointer = await getSiteContentPointer();
    const [{ space }, { customization }] = await Promise.all([
        getSpaceContentData(await getDataFetcherV1(), pointer, pointer.siteShareKey),
        getSiteData(pointer),
    ]);

    const language = getSpaceLanguage(customization);

    return (
        <div
            className={tcls(
                'flex-1',
                'flex',
                'flex-row',
                'items-center',
                'justify-center',
                'py-9',
                'min-h-[calc(100vh-64px)] lg:min-h-fit',
            )}
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
