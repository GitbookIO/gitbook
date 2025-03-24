import { resolveContentRef } from '@/lib/references';
import type { GitBookSiteContext } from '@v2/lib/context';
import { AnnouncementBanner } from './AnnouncementBanner';
import './style.css';

export async function Announcement(props: {
    context: GitBookSiteContext;
}) {
    const { context } = props;
    const { customization } = context;

    if (!customization.announcement) {
        return null;
    }

    const resolvedContentRef = customization.announcement?.link
        ? await resolveContentRef(customization.announcement?.link?.to, context)
        : null;

    return (
        <AnnouncementBanner
            announcement={customization.announcement}
            contentRef={resolvedContentRef}
        />
    );
}
