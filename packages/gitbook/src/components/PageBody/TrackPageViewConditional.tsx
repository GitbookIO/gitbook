import { headers } from 'next/headers';

import { SiteContentPointer } from '@/lib/api';

import { TrackPageView } from './TrackPageView';

/**
 * Track page view in GitBook analytics if not disabled
 */
export function TrackPageViewConditional(props: {
    apiHost: string;
    sitePointer?: Pick<SiteContentPointer, 'siteId' | 'organizationId'>;
    spaceId: string;
    pageId: string | undefined;
}) {
    const { apiHost, sitePointer, spaceId, pageId } = props;

    const headerSet = headers();
    if (
        process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING &&
        !headerSet.has('x-gitbook-track-page-views')
    ) {
        return null;
    }

    return (
        <TrackPageView
            sitePointer={sitePointer}
            spaceId={spaceId}
            pageId={pageId}
            apiHost={apiHost}
        />
    );
}
