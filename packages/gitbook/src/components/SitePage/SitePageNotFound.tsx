import { GitBookSiteContext } from '@v2/lib/context';

import { TrackPageViewEvent } from '@/components/Insights';
import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';

/**
 * Component that displays a "page not found" message.
 */
export function SitePageNotFound(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { space, customization } = context;

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
