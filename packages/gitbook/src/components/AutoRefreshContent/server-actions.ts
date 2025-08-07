'use server';

import { getDataOrNull } from '@/lib/data';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { trace } from '@/lib/tracing';

/**
 * Return true if a change-request has been updated.
 */
export async function hasContentBeenUpdated(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    return trace('AutoRefreshContent.hasContentBeenUpdated', async () => {
        const context = await getServerActionBaseContext();
        const changeRequest = await getDataOrNull(
            context.dataFetcher.getChangeRequest({
                spaceId: props.spaceId,
                changeRequestId: props.changeRequestId,
            })
        );
        if (!changeRequest) {
            return false;
        }
        return changeRequest.revision !== props.revisionId;
    });
}
