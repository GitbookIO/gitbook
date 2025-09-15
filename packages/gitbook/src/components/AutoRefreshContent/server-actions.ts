'use server';

import { getDataOrNull } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';

/**
 * Return true if the content has been updated.
 * It compares the revision ID displayed on the client side with the latest revision ID from the server/cache.
 */
export async function hasContentBeenUpdated(props: {
    revisionId: string;
}) {
    return traceErrorOnly('AutoRefreshContent.hasContentBeenUpdated', async () => {
        const context = await getServerActionBaseContext();
        const siteURLData = await getSiteURLDataFromMiddleware();

        if (siteURLData.changeRequest) {
            const changeRequest = await getDataOrNull(
                context.dataFetcher.getChangeRequest({
                    spaceId: siteURLData.space,
                    changeRequestId: siteURLData.changeRequest,
                })
            );
            if (!changeRequest) {
                return false;
            }
            return changeRequest.revision !== props.revisionId;
        }

        const space = await getDataOrNull(
            context.dataFetcher.getSpace({
                spaceId: siteURLData.space,
                shareKey: siteURLData.shareKey,
            })
        );
        if (!space) {
            return false;
        }
        return space.revision !== props.revisionId;
    });
}
