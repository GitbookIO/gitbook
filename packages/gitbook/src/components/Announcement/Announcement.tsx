import { resolveContentRef } from '@/lib/references';
import type { GitBookSiteContext } from '@v2/lib/context';
import { AnnouncementBanner } from './AnnouncementBanner';

export async function Announcement(props: {
    context: GitBookSiteContext;
}) {
    const { context } = props;

    if (!context.customization.announcement) {
        return null;
    }

    const resolvedContentRef = context?.customization.announcement?.link
        ? await resolveContentRef(context.customization.announcement?.link?.to, context)
        : null;

    return (
        <AnnouncementBanner
            announcement={context.customization.announcement}
            contentRef={resolvedContentRef}
        />
    );
}
