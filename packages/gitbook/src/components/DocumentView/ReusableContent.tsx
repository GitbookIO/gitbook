import type { DocumentBlockReusableContent } from '@gitbook/api';

import { createLinkerForSpace, resolveContentRef } from '@/lib/references';

import type { GitBookSpaceContext } from '@v2/lib/context';
import { getDataOrNull } from '@v2/lib/data';
import { assert } from 'ts-essentials';
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
    const reusableContentContext: GitBookSpaceContext = await (async () => {
        assert(context.contentContext);

        // Reusable Content in the same space resolves the same as any other reference.
        if (context.contentContext.space.id === reusableContent.space.id) {
            return context.contentContext;
        }

        // Reusable Content in a different space needs to resolve the space context and linker.
        const ctx = await createLinkerForSpace(reusableContent.space.id, context.contentContext);

        if (!ctx) {
            throw new Error(`Could not create context for space ${reusableContent.space.id}`);
        }

        return {
            ...context.contentContext,
            ...ctx.spaceContext,
            dataFetcher,
            space: ctx.space,
            linker: ctx.linker,
            // When the reusable content is in a different space, we don't resolve relative links to pages
            // as this space might not be part of the current site.
            // In the future, we might expand the logic to look up the space from the list of all spaces in the site
            // and adapt the relative links to point to the correct variant.
            revision: reusableContent.revision,
            shareKey: undefined,
        };
    })();

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
