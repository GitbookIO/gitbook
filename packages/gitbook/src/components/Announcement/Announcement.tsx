import type { GitBookSiteContext } from '@/lib/context';
import { resolveContentRef } from '@/lib/references';
import { AnnouncementBanner } from './AnnouncementBanner';
import { toAbsoluteContentRefHref } from './utils';

/**
 * Server-side component to resolve content refs and pass down to client-side component
 */
export async function Announcement(props: {
    context: GitBookSiteContext;
}) {
    const { context } = props;
    const { customization } = context;

    if (
        !customization.announcement ||
        !customization.announcement.enabled ||
        !customization.announcement.message
    ) {
        return null;
    }

    const resolvedContentRef = customization.announcement?.link
        ? toAbsoluteContentRefHref(
              await resolveContentRef(customization.announcement?.link?.to, context),
              context.linker.toAbsoluteURL
          )
        : null;

    return (
        <AnnouncementBanner
            announcement={customization.announcement}
            locale={context.locale}
            contentRef={resolvedContentRef}
        />
    );
}
