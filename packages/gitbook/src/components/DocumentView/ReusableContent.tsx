import type { DocumentBlockReusableContent } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import type { GitBookSpaceContext } from '@v2/lib/context';
import { getDataOrNull } from '@v2/lib/data';
import type { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { block, context, ancestorBlocks } = props;

    if (!context.contentContext) {
        throw new Error('Expected a content context to render a reusable content block');
    }

    const dataFetcher = block.meta?.token
        ? context.contentContext.dataFetcher.withToken({ apiToken: block.meta.token })
        : context.contentContext.dataFetcher;

    const resolved = await resolveContentRef(block.data.ref, {
        ...context.contentContext,
        dataFetcher,
    });

    if (!resolved) {
        return null;
    }

    const { reusableContent } = resolved;
    if (!reusableContent || !reusableContent.revisionReusableContent.document) {
        return null;
    }

    const document = await getDataOrNull(
        dataFetcher.getDocument({
            spaceId: reusableContent.space.id,
            documentId: reusableContent.revisionReusableContent.document,
        })
    );

    if (!document) {
        return null;
    }

    // Create a new context for reusable content block, including
    // the data fetcher with the token from the block meta and the correct
    // space and revision pointers.
    const reusableContentContext: GitBookSpaceContext =
        context.contentContext.space.id === reusableContent.space.id
            ? context.contentContext
            : {
                  ...context.contentContext,
                  dataFetcher,
                  space: reusableContent.space,
                  // When the reusable content is in a different space, we don't resolve relative links to pages
                  // as this space might not be part of the current site.
                  // In the future, we might expand the logic to look up the space from the list of all spaces in the site
                  // and adapt the relative links to point to the correct variant.
                  revision: {
                      ...reusableContent.revision,
                      pages: [], // TODO: check with Steven
                  },
                  shareKey: undefined,
              };

    return (
        <UnwrappedBlocks
            nodes={document.nodes}
            document={document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={{
                ...context,
                contentContext: reusableContentContext,
            }}
        />
    );
}
