import {
    type GitBookBaseContext,
    type GitBookSpaceContext,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import { createDataFetcher } from '@v2/lib/data';
import { createLinker } from '@v2/lib/links';
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

    const basePath = getPDFRoutePath(params);
    const linker = createLinker({
        spaceBasePath: basePath,
        siteBasePath: basePath,
    });
    const dataFetcher = createDataFetcher({
        apiToken: apiToken,
    });

    const baseContext: GitBookBaseContext = {
        linker,
        dataFetcher,
    };

    return await fetchSpaceContextByIds(baseContext, {
        space: spaceId,
        shareKey: undefined,
        changeRequest: params.changeRequestId,
        revision: params.revisionId,
    });
}

function getPDFRoutePath(params: SpacePDFRouteParams) {
    let path = `/~space/${params.spaceId}`;

    if (params.changeRequestId) {
        path += `/~/changes/${params.changeRequestId}`;
    }

    if (params.revisionId) {
        path += `/~/revisions/${params.revisionId}`;
    }

    path += '~gitbook/pdf';

    return path;
}
