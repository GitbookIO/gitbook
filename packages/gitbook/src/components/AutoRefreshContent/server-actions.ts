'use server';

import { getChangeRequest } from '@/lib/api';

/**
 * Return true if a change-request has been updated.
 */
export async function checkHasContentBeenUpdated(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    const changeRequest = await getChangeRequest(props.spaceId, props.changeRequestId);
    return changeRequest.revision !== props.revisionId;
}
