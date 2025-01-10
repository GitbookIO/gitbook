'use server';

import { getChangeRequest } from '@/lib/api';
import { GitBookContext } from '@/lib/gitbook-context';

/**
 * Return true if a change-request has been updated.
 */
export async function hasContentBeenUpdated(
    ctx: GitBookContext,
    props: {
        spaceId: string;
        changeRequestId: string;
        revisionId: string;
    },
) {
    const changeRequest = await getChangeRequest.revalidate(
        ctx,
        props.spaceId,
        props.changeRequestId,
    );
    return changeRequest.revision !== props.revisionId;
}
