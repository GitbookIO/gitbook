import {
    type GitBookBaseContext,
    type GitBookSpaceContext,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import { createDataFetcher } from '@v2/lib/data';
import { GITBOOK_API_URL } from '@v2/lib/env';
import { createNoopLinker } from '@v2/lib/links';
import { getAPITokenFromMiddleware } from '@v2/lib/middleware';

export type SpacePDFRouteParams = {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
};

export async function getSpacePDFContext(
    params: SpacePDFRouteParams
): Promise<GitBookSpaceContext> {
    const { spaceId } = params;

    const apiToken = await getAPITokenFromMiddleware();

    const linker = createNoopLinker();
    const dataFetcher = createDataFetcher({
        apiToken: apiToken,
        apiEndpoint: GITBOOK_API_URL,
    });

    const baseContext: GitBookBaseContext = {
        linker,
        dataFetcher,
    };

    return await fetchSpaceContextByIds(baseContext, {
        space: spaceId,

        // TODO:
        shareKey: undefined,
        changeRequest: undefined,
        revision: undefined,
    });
}
